# 🔒 Documentação de Segurança - Finanças App

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura de Segurança](#arquitetura-de-segurança)
3. [Isolamento de Dados](#isolamento-de-dados)
4. [Regras de Segurança do Firestore](#regras-de-segurança-do-firestore)
5. [Autenticação](#autenticação)
6. [Validações no Backend](#validações-no-backend)
7. [Validações no Frontend](#validações-no-frontend)
8. [Proteção contra Ataques Comuns](#proteção-contra-ataques-comuns)
9. [Boas Práticas de Segurança](#boas-práticas-de-segurança)
10. [Como Testar a Segurança](#como-testar-a-segurança)

---

## Visão Geral

Este aplicativo foi projetado com **segurança em primeiro lugar**. O requisito mais crítico é:

> **ISOLAMENTO TOTAL DE DADOS**: Um usuário "A" jamais pode acessar, nem por acidente, os dados do usuário "B".

Este documento explica como esse isolamento é garantido em múltiplas camadas.

---

## Arquitetura de Segurança

### Camadas de Proteção

```
┌─────────────────────────────────────────────────────┐
│  1. AUTENTICAÇÃO (Firebase Auth)                    │
│     └─ Valida identidade do usuário                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  2. AUTORIZAÇÃO (Firestore Rules)                   │
│     └─ Verifica se auth.uid == userId               │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  3. VALIDAÇÃO DE SCHEMA (Firestore Rules)           │
│     └─ Valida tipos, tamanhos, campos obrigatórios  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  4. VALIDAÇÃO NO CÓDIGO (transactionService.js)     │
│     └─ Verifica auth.currentUser?.uid antes de      │
│        qualquer operação                            │
└─────────────────────────────────────────────────────┘
```

**Princípio de Defesa em Profundidade**: Se uma camada falhar, as outras ainda protegem os dados.

---

## Isolamento de Dados

### Estrutura de Dados no Firestore

```
firestore/
└── users/                              (coleção raiz)
    ├── {userId_A}/                     (documento do usuário A)
    │   ├── name: "João"
    │   ├── email: "joao@example.com"
    │   ├── transactions/               (subcoleção privada)
    │   │   ├── {transactionId_1}
    │   │   ├── {transactionId_2}
    │   │   └── ...
    │   └── recurringTransactions/      (subcoleção privada)
    │       └── {recurringId_1}
    │
    └── {userId_B}/                     (documento do usuário B)
        ├── name: "Maria"
        ├── email: "maria@example.com"
        ├── transactions/               (subcoleção privada)
        │   └── {transactionId_3}
        └── recurringTransactions/
            └── {recurringId_2}
```

### Por que essa estrutura é segura?

1. **Subcoleções ao invés de campo `userId`**:
   - ❌ **Abordagem insegura**: `transactions/{transactionId}` com campo `userId`
   - ✅ **Abordagem segura**: `users/{userId}/transactions/{transactionId}`

2. **Vantagens**:
   - Dados organizados hierarquicamente
   - Proteção automática via regras de acesso do documento pai
   - Impossível acessar `/users/{outroUserId}/transactions` sem permissão

---

## Regras de Segurança do Firestore

O arquivo `firestore.rules` implementa a segurança no backend (Firebase).

### Regra Principal de Isolamento

```javascript
// Verifica se o usuário autenticado é o dono do recurso
function isOwner(userId) {
  return request.auth.uid == userId;
}

match /users/{userId} {
  // Usuário só pode ler/escrever seu próprio documento
  allow read, write: if isSignedIn() && isOwner(userId);

  match /transactions/{transactionId} {
    // Herda proteção: só acessa se userId == auth.uid
    allow read, write: if isSignedIn() && isOwner(userId);
  }
}
```

### Validações Implementadas

#### 1. Validação de Transações

```javascript
function isValidTransaction() {
  let data = request.resource.data;
  return (
    // Campos obrigatórios
    data.keys().hasAll(['date', 'description', 'amount', 'type']) &&

    // Tipos corretos
    data.date is timestamp &&
    data.description is string &&
    data.amount is number &&
    data.type is string &&

    // Validações de conteúdo
    data.description.size() <= 500 &&           // Limite de 500 caracteres
    data.amount >= -1000000000 &&               // Limite: -1 bilhão
    data.amount <= 1000000000 &&                // Limite: +1 bilhão
    (data.type == 'income' || data.type == 'expense')  // Apenas valores válidos
  );
}
```

#### 2. Validação de Transações Recorrentes

```javascript
function isValidRecurringTransaction() {
  let data = request.resource.data;
  return (
    data.keys().hasAll(['description', 'amount', 'dayOfMonth', 'type']) &&
    data.dayOfMonth >= 1 && data.dayOfMonth <= 31 &&  // Dia do mês válido
    // ... outras validações
  );
}
```

#### 3. Proteção de Perfil de Usuário

```javascript
function isValidUserProfile() {
  let data = request.resource.data;
  return (
    // Email deve corresponder ao email do usuário autenticado
    data.email == request.auth.token.email &&

    // Não permite mudança de email em updates
    // (implementado via regra allow update)
  );
}
```

#### 4. Bloqueio Global

```javascript
// Qualquer acesso não explicitamente permitido é negado
match /{document=**} {
  allow read, write: if false;
}
```

---

## Autenticação

### Implementação (`src/services/authService.js`)

```javascript
// Registro de novo usuário
export const registerWithEmail = async (email, password, name) => {
  // 1. Cria autenticação no Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // 2. Cria documento de perfil automaticamente
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    name: name,
    email: email,
    createdAt: serverTimestamp()
  });
};
```

### Observador de Estado de Autenticação (`App.js`)

```javascript
// Monitora mudanças no estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuário autenticado: vai para HomeScreen
    setUser(user);
  } else {
    // Usuário não autenticado: vai para LoginScreen
    setUser(null);
  }
});
```

---

## Validações no Backend

### Verificação de Autenticação em Cada Operação

Todas as funções em `src/services/transactionService.js` verificam a autenticação:

```javascript
export const addTransaction = async (transactionData) => {
  // SEMPRE verifica se há usuário autenticado
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Usuário não autenticado');

  // Usa o userId do usuário autenticado (NÃO aceita userId de parâmetro)
  const transactionsRef = collection(db, `users/${userId}/transactions`);
  await addDoc(transactionsRef, transactionData);
};
```

### Proteção contra Injeção de `userId`

❌ **NUNCA FAÇA ISSO** (vulnerável):
```javascript
// INSEGURO: Aceita userId como parâmetro
export const addTransaction = async (userId, transactionData) => {
  // Atacante poderia passar qualquer userId!
  const ref = collection(db, `users/${userId}/transactions`);
  // ...
}
```

✅ **SEMPRE FAÇA ISSO** (seguro):
```javascript
// SEGURO: Usa auth.currentUser.uid diretamente
export const addTransaction = async (transactionData) => {
  const userId = auth.currentUser?.uid;  // Pega do Firebase Auth
  if (!userId) throw new Error('Usuário não autenticado');

  const ref = collection(db, `users/${userId}/transactions`);
  // ...
}
```

---

## Validações no Frontend

### Proteção de Rotas (`App.js`)

```javascript
// Só renderiza telas privadas se usuário estiver autenticado
{user ? (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
    {/* Outras telas privadas */}
  </Stack.Navigator>
) : (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
)}
```

---

## Proteção contra Ataques Comuns

### 1. **Ataque de Acesso Direto a Dados de Outro Usuário**

**Cenário**: Atacante tenta acessar `users/{outroUserId}/transactions`

**Proteção**:
```javascript
// Firestore Rules bloqueia automaticamente
match /users/{userId}/transactions/{transactionId} {
  allow read: if request.auth.uid == userId;  // Falha se userId != auth.uid
}
```

**Resultado**: ❌ `PERMISSION_DENIED`

---

### 2. **Injeção de Dados Maliciosos**

**Cenário**: Atacante tenta enviar string gigante ou valores absurdos

**Proteção**:
```javascript
function isValidTransaction() {
  return (
    data.description.size() <= 500 &&        // Limita tamanho
    data.amount >= -1000000000 &&            // Limita valores
    data.amount <= 1000000000                // Limita valores
  );
}
```

**Resultado**: ❌ `INVALID_ARGUMENT: Document does not match schema`

---

### 3. **Tentativa de Modificar Email de Outro Usuário**

**Cenário**: Atacante tenta mudar email do perfil

**Proteção**:
```javascript
// Firestore Rules valida que email não pode ser alterado
allow update: if (
  isOwner(userId) &&
  request.resource.data.email == resource.data.email  // Email deve permanecer igual
);
```

**Resultado**: ❌ `PERMISSION_DENIED`

---

### 4. **Duplicação de Transações (Importação Repetida)**

**Cenário**: Usuário importa o mesmo CSV duas vezes

**Proteção**:
```javascript
// src/utils/deduplication.js
import CryptoJS from 'crypto-js';

export const generateTransactionHash = (transaction) => {
  const hashString = `${transaction.date}_${transaction.description}_${transaction.amount}`;
  return CryptoJS.SHA256(hashString).toString();
};

// src/services/transactionService.js
export const transactionExists = async (importHash) => {
  const q = query(transactionsRef, where('importHash', '==', importHash));
  const snapshot = await getDocs(q);
  return !snapshot.empty;  // Retorna true se já existe
};
```

**Resultado**: ✅ Transação duplicada não é importada

---

## Boas Práticas de Segurança

### ✅ Coisas que FAZEMOS

1. **Autenticação Obrigatória**: Todas as operações requerem login
2. **Verificação Dupla**: Backend (Firestore Rules) + Frontend (código)
3. **Princípio do Menor Privilégio**: Usuário só acessa seus próprios dados
4. **Validação de Schema**: Tipos, tamanhos e valores são validados
5. **Bloqueio por Padrão**: Tudo é negado, exceto o explicitamente permitido
6. **Uso de `serverTimestamp()`**: Timestamps são gerados no servidor (não confia no cliente)

### ❌ Coisas que NÃO FAZEMOS

1. **Não armazenamos senhas**: Firebase Auth gerencia isso
2. **Não aceitamos `userId` como parâmetro**: Sempre usamos `auth.currentUser.uid`
3. **Não confiamos apenas no frontend**: Backend sempre valida
4. **Não usamos chaves API em código público**: Movidas para variáveis de ambiente

---

## Como Testar a Segurança

### Teste 1: Tentativa de Acesso a Dados de Outro Usuário

1. Crie dois usuários: `userA@test.com` e `userB@test.com`
2. Faça login como `userA`
3. No console do navegador, tente:

```javascript
// Tente acessar transações do userB
import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/config/firebase';

const userBId = "UID_DO_USER_B";  // ID do outro usuário
const transactionsRef = collection(db, `users/${userBId}/transactions`);
const snapshot = await getDocs(transactionsRef);

// RESULTADO ESPERADO: Error: Missing or insufficient permissions
```

### Teste 2: Tentativa de Enviar Dados Inválidos

1. Faça login
2. Tente criar transação com valor absurdo:

```javascript
import { addTransaction } from './src/services/transactionService';

await addTransaction({
  date: new Date(),
  description: "X".repeat(1000),  // 1000 caracteres (limite: 500)
  amount: 999999999999,            // Valor acima do limite
  type: "income"
});

// RESULTADO ESPERADO: Error: Document does not match schema
```

### Teste 3: Verificar Isolamento no Firestore Console

1. Acesse Firebase Console → Firestore Database
2. Veja a estrutura:
```
users/
  └── {userId}/
      ├── transactions/
      └── recurringTransactions/
```
3. Verifique que transações estão DENTRO do documento do usuário, não numa coleção global

---

## Checklist de Segurança

Antes de colocar o app em produção, verifique:

- [ ] Credenciais do Firebase atualizadas em `src/config/firebase.js`
- [ ] Firestore Rules publicadas no Firebase Console
- [ ] Testado acesso negado a dados de outro usuário
- [ ] Testado validação de schema (dados inválidos são rejeitados)
- [ ] Autenticação obrigatória em todas as telas privadas
- [ ] Variáveis de ambiente configuradas (não expor chaves API)
- [ ] Firebase Auth configurado com métodos de login desejados
- [ ] Testado de-duplicação de importação de CSV

---

## Suporte e Questões

Se você encontrar alguma vulnerabilidade ou tiver dúvidas sobre segurança:

1. **NÃO** abra uma issue pública
2. Entre em contato diretamente com o desenvolvedor
3. Forneça detalhes técnicos e passos para reproduzir

---

## Referências

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/rules-structure)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Auth Best Practices](https://firebase.google.com/docs/auth/web/start)

---

**Última atualização**: 2025-11-06

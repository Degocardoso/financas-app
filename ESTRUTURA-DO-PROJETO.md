# 🗂️ ESTRUTURA DO PROJETO

## 📁 Visão Geral

```
financas-app/
│
├── 📱 App.js                          # Arquivo principal - Navegação e Auth
│
├── 📄 Documentação
│   ├── README.md                      # Guia completo
│   ├── INICIO-RAPIDO.md               # Guia de 5 minutos
│   ├── DICAS-E-BOAS-PRATICAS.md      # Dicas avançadas
│   └── COMANDOS-UTEIS.md             # Comandos para copiar
│
├── 🔥 Configuração Firebase
│   ├── firestore.rules                # Regras de segurança
│   └── exemplo-extrato.csv            # CSV para testes
│
├── 📦 Dependências
│   ├── package.json                   # Lista de dependências
│   ├── package-lock.json              # Versões travadas
│   └── node_modules/                  # Bibliotecas instaladas
│
└── 💻 Código Fonte (src/)
    │
    ├── 🔧 config/
    │   └── firebase.js                # ⚠️ COLE SUAS CREDENCIAIS AQUI
    │
    ├── 🔌 services/                   # Lógica de negócio
    │   ├── authService.js             # Login, registro, logout
    │   ├── transactionService.js      # CRUD de transações
    │   └── projectionService.js       # Cálculos de projeção
    │
    ├── 🖼️ screens/                     # Telas do app
    │   ├── LoginScreen.js             # Tela de login
    │   ├── RegisterScreen.js          # Tela de cadastro
    │   ├── HomeScreen.js              # Dashboard principal
    │   ├── ImportScreen.js            # Importar CSV
    │   ├── RecurringScreen.js         # Lançamentos futuros
    │   └── ProjectionScreen.js        # Gráfico de projeção
    │
    ├── 🧩 components/                 # Componentes reutilizáveis
    │   └── ProjectionChart.js         # Gráfico de linha
    │
    └── 🛠️ utils/                       # Funções auxiliares
        ├── csvParser.js               # Parse de arquivos CSV
        └── deduplication.js           # Hash e de-duplicação
```

---

## 🎯 Arquivos Mais Importantes

### 1. ⚠️ OBRIGATÓRIO EDITAR:

#### `src/config/firebase.js`
```javascript
// Cole suas credenciais aqui ⬇️
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  // ...
};
```

#### `firestore.rules`
```javascript
// Copie e cole no Firebase Console
rules_version = '2';
service cloud.firestore {
  // Regras de segurança
}
```

---

### 2. 🚀 PONTO DE ENTRADA:

#### `App.js`
- Inicializa a navegação
- Controla login/logout
- Decide qual tela mostrar

```javascript
// Se usuário logado → HomeScreen
// Se não logado → LoginScreen
```

---

### 3. 📱 FLUXO DO USUÁRIO:

```
LoginScreen
    ↓ (login bem-sucedido)
HomeScreen (Dashboard)
    ├── ImportScreen → CSV → transactionService
    ├── RecurringScreen → Cadastro → transactionService
    └── ProjectionScreen → Cálculo → projectionService
```

---

## 🗃️ Estrutura de Dados no Firestore

```
Firebase Firestore
│
└── users/ (coleção)
    │
    └── {userId} (documento)
        │
        ├── profile (campos)
        │   ├── name: "João Silva"
        │   ├── email: "joao@email.com"
        │   └── createdAt: timestamp
        │
        ├── transactions/ (subcoleção)
        │   │
        │   ├── {transactionId1} (documento)
        │   │   ├── date: 2025-11-05
        │   │   ├── description: "Salário"
        │   │   ├── amount: 5000
        │   │   ├── type: "income"
        │   │   ├── category: "Importado"
        │   │   ├── importHash: "abc123..."
        │   │   └── createdAt: timestamp
        │   │
        │   └── {transactionId2} (documento)
        │       └── ...
        │
        └── recurringTransactions/ (subcoleção)
            │
            ├── {recurringId1} (documento)
            │   ├── description: "Aluguel"
            │   ├── amount: -1200
            │   ├── dayOfMonth: 10
            │   ├── type: "expense"
            │   ├── startDate: timestamp
            │   └── createdAt: timestamp
            │
            └── {recurringId2} (documento)
                └── ...
```

---

## 🔄 Fluxo de Dados

### 📥 Importação de CSV:

```
1. Usuário seleciona CSV
         ↓
2. csvParser.js lê o arquivo
         ↓
3. Valida estrutura (Data, Descrição, Valor)
         ↓
4. Para cada linha:
   - Gera hash (deduplication.js)
   - Verifica se já existe (transactionService)
   - Se não existe, salva no Firestore
         ↓
5. Mostra resultado (X importadas, Y duplicadas)
```

### 📊 Projeção de Saldo:

```
1. Usuário abre ProjectionScreen
         ↓
2. projectionService.js:
   - Busca saldo atual (soma de todas transações)
   - Busca lançamentos recorrentes
   - Calcula projeção mês a mês
         ↓
3. ProjectionChart.js renderiza o gráfico
         ↓
4. Mostra quando ficará positivo (se negativo)
```

---

## 🔐 Camadas de Segurança

```
1. Frontend (React Native)
   ├── Valida formulários
   ├── Mostra apenas dados do usuário logado
   └── Usa auth.currentUser.uid
         ↓
2. Firebase SDK
   ├── Envia credenciais de autenticação
   ├── Adiciona auth.uid a cada requisição
   └── Criptografa a comunicação
         ↓
3. Firestore Rules (Servidor)
   ├── ✅ Verifica se auth.uid == userId do documento
   ├── ✅ Permite acesso apenas aos próprios dados
   └── ❌ NEGA qualquer acesso não autorizado
         ↓
4. Resultado: ISOLAMENTO TOTAL ✅
```

---

## 📦 Dependências Principais

### Core:
- **expo** → Framework React Native
- **react-native** → Base do app mobile
- **firebase** → Backend as a Service

### Navegação:
- **@react-navigation/native** → Sistema de navegação
- **@react-navigation/native-stack** → Navegação em pilha

### UI/UX:
- **react-native-chart-kit** → Gráficos
- **react-native-svg** → Renderiza SVG (usado pelos gráficos)
- **@react-native-community/datetimepicker** → Picker de data

### Utilitários:
- **papaparse** → Parse de CSV
- **crypto-js** → Geração de hashes
- **expo-document-picker** → Seleção de arquivos
- **expo-file-system** → Leitura de arquivos

---

## 🎨 Paleta de Cores Usada

```css
/* Cores principais */
--primary: #3498db;      /* Azul - Botões principais */
--success: #27ae60;      /* Verde - Saldo positivo */
--danger: #e74c3c;       /* Vermelho - Saldo negativo */
--warning: #f39c12;      /* Laranja - Avisos */
--dark: #2c3e50;         /* Cinza escuro - Textos */
--light: #ecf0f1;        /* Cinza claro - Backgrounds */
--white: #ffffff;        /* Branco - Cards */

/* Aplicação */
- Headers: #3498db (azul)
- Receitas: #27ae60 (verde)
- Despesas: #e74c3c (vermelho)
- Backgrounds: #f5f5f5 (cinza clarinho)
```

---

## 🧪 Como Testar Cada Módulo

### Módulo 1: Autenticação ✅
```
1. Abra o app
2. Clique em "Cadastre-se"
3. Crie uma conta
4. Faça logout
5. Faça login novamente
```

### Módulo 2: Importação CSV ✅
```
1. Use o arquivo exemplo-extrato.csv
2. Importe uma vez → Sucesso
3. Importe de novo → Deve detectar duplicatas
```

### Módulo 3: Lançamentos Futuros ✅
```
1. Cadastre: Salário, R$ 5000, dia 5
2. Cadastre: Aluguel, R$ -1200, dia 1
3. Veja a lista atualizada
```

### Módulo 4: Projeção ✅
```
1. Com transações e recorrentes cadastradas
2. Abra a tela de Projeção
3. Veja o gráfico de 6 meses
4. Alterne para 12 meses
5. Verifique o "break-even" (se negativo)
```

---

## 🎓 Conceitos Técnicos Aplicados

| Conceito | Onde está | Por que importa |
|----------|-----------|-----------------|
| **MVC Pattern** | services/ | Separa lógica de negócio da UI |
| **Single Responsibility** | Cada arquivo tem 1 função | Código organizado e manutenível |
| **DRY (Don't Repeat Yourself)** | utils/ | Funções reutilizáveis |
| **Atomic Design** | components/ | Componentes pequenos e reutilizáveis |
| **Separation of Concerns** | services/ vs screens/ | UI separada da lógica |
| **Security by Design** | firestore.rules | Segurança no servidor, não no cliente |
| **Hash-based Deduplication** | deduplication.js | Eficiência em comparações |
| **Optimistic UI** | Transaction service | UX responsiva |

---

## 🚀 Próximos Passos de Evolução

### Nível 1 - Fácil (1-3 horas cada):
- [ ] Adicionar filtro de transações por data
- [ ] Adicionar busca de transações
- [ ] Melhorar formatação de valores
- [ ] Adicionar loading states
- [ ] Adicionar avatar do usuário

### Nível 2 - Médio (4-8 horas cada):
- [ ] Categorias personalizadas
- [ ] Gráfico de pizza por categoria
- [ ] Exportar relatório em PDF
- [ ] Modo escuro
- [ ] Múltiplas contas (pessoal, empresarial)

### Nível 3 - Avançado (1-2 semanas cada):
- [ ] Suporte para OFX
- [ ] Machine Learning para categorização automática
- [ ] Notificações push
- [ ] Orçamento familiar (múltiplos usuários)
- [ ] Integração com bancos (Open Banking)
- [ ] Widget iOS/Android
- [ ] Versão Web completa

---

## 📊 Métricas do Projeto

```
Linhas de código:     ~2.500
Arquivos:             20
Telas:                6
Services:             3
Components:           1
Utils:                2
Tempo desenvolvimento: 4-6 horas
Custo:                R$ 0,00 (free tier)
```

---

**Use este arquivo como mapa mental do projeto! 🗺️**

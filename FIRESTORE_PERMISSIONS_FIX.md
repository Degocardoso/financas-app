# Correção de Erros de Permissões do Firestore

## Problema
Você está recebendo o erro: `[FirebaseError: Missing or insufficient permissions.]`

Isso acontece porque as regras de segurança do Firestore não foram atualizadas no Firebase Console.

## Solução

Você tem **duas opções** para corrigir este problema:

---

### **Opção 1: Usar Regras Simplificadas (Recomendado para começar)**

Use o arquivo `firestore-simple.rules` que já foi criado. Estas regras são mais simples e permitem acesso a todas as subcoleções do usuário.

**Como fazer:**

1. Abra o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Regras** (Rules)
5. **Substitua todo o conteúdo** pelas regras abaixo:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Função auxiliar: verifica se o usuário está autenticado
    function isSignedIn() {
      return request.auth != null;
    }

    // Função auxiliar: verifica se o usuário é o dono do documento
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Regra para o documento do perfil do usuário
    match /users/{userId} {
      // Usuário só pode ler/escrever seu próprio perfil
      allow read, write: if isSignedIn() && isOwner(userId);

      // TODAS as subcoleções do usuário
      match /{subcollection}/{document=**} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }
    }

    // Bloqueio global
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

6. Clique em **Publicar** (Publish)
7. Aguarde alguns segundos
8. **Feche completamente o app** no seu celular e abra novamente
9. Teste as funcionalidades

---

### **Opção 2: Usar Regras Completas com Validação (Mais Seguro)**

Use o arquivo `firestore.rules` original que possui validações completas dos dados.

**Como fazer:**

1. Abra o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Regras** (Rules)
5. Abra o arquivo `firestore.rules` do seu projeto
6. **Copie todo o conteúdo** do arquivo
7. **Cole no editor** do Firebase Console
8. Clique em **Publicar** (Publish)
9. Aguarde alguns segundos
10. **Feche completamente o app** no seu celular e abra novamente
11. Teste as funcionalidades

---

## Verificando se funcionou

Após publicar as regras, teste:

1. ✅ Cadastrar uma nova receita
2. ✅ Cadastrar um orçamento diário
3. ✅ Adicionar uma despesa diária
4. ✅ Visualizar o dashboard

Se ainda assim der erro, verifique:

### 1. Usuário está autenticado?
```javascript
// No console do navegador (se estiver testando no web)
// ou no código, adicione um console.log:
console.log('User ID:', auth.currentUser?.uid);
```

Se aparecer `undefined`, o problema é de autenticação, não de permissões.

### 2. As regras foram publicadas?
- Volte ao Firebase Console > Firestore Database > Regras
- Verifique se as regras que você colou estão lá
- Verifique a data de "Última publicação" no topo da página

### 3. Cache do app
- **Android**: Vá em Configurações > Apps > Financas App > Limpar Cache
- **iOS**: Desinstale e reinstale o app
- Ou simplesmente force o fechamento do app e reabra

---

## Por que isso aconteceu?

As regras de segurança do Firestore são **sempre editadas no Firebase Console**, não no código do app.

Os arquivos `.rules` no projeto servem apenas como:
- 📝 Documentação
- 🔄 Controle de versão
- 🚀 Deployment automatizado (se configurado)

Como você provavelmente não configurou o deployment automatizado, precisa copiar manualmente as regras para o Firebase Console.

---

## Qual opção escolher?

- **Opção 1 (Simplificada)**: Comece com esta se você só quer testar o app rapidamente
- **Opção 2 (Completa)**: Use esta quando for para produção, pois valida os dados antes de salvá-los

Você pode começar com a Opção 1 agora e depois mudar para a Opção 2 quando estiver pronto para publicar o app.

---

## Precisa de ajuda?

Se ainda assim não funcionar, envie:
1. Screenshot da aba de Regras do Firebase Console
2. O erro completo que aparece no console
3. Confirme que você está logado no app (user ID não é null)

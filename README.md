# 💰 Finanças App - Guia Completo de Instalação e Uso

## 📋 Pré-requisitos Instalados

Você já deve ter instalado:
- ✅ Node.js (v18 ou superior)
- ✅ npm
- ✅ Git
- ✅ Expo CLI
- ✅ App Expo Go no celular

## 🚀 Passo 1: Configurar o Firebase

### 1.1. Criar o Projeto

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"**
3. Nome: `financas-app` (ou o nome que preferir)
4. Desative o Google Analytics
5. Clique em **"Criar projeto"**

### 1.2. Ativar Authentication

1. Menu lateral → **"Authentication"**
2. Clique em **"Começar"**
3. Ative o provedor **"Email/Senha"**
4. (Opcional) Ative o provedor **"Google"**

### 1.3. Criar o Firestore Database

1. Menu lateral → **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha: **"Iniciar no modo de produção"**
4. Localização: `southamerica-east1` (São Paulo)
5. Clique em **"Ativar"**

### 1.4. Configurar as Regras de Segurança

1. No Firestore, vá na aba **"Regras"**
2. Cole as regras do arquivo `firestore.rules`
3. Clique em **"Publicar"**

### 1.5. Pegar as Credenciais

1. Menu lateral → Ícone de **engrenagem** → **"Configurações do projeto"**
2. Role até **"Seus apps"**
3. Clique no ícone **</>** (Web)
4. Registre o app: `financas-app-web`
5. **COPIE** o objeto `firebaseConfig`

Exemplo:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "financas-app.firebaseapp.com",
  projectId: "financas-app",
  storageBucket: "financas-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## ⚙️ Passo 2: Configurar o Projeto

### 2.1. Editar o arquivo de configuração

Abra o arquivo `src/config/firebase.js` e **substitua** as credenciais:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_MESSAGING_ID",
  appId: "SEU_APP_ID"
};
```

## 🏃 Passo 3: Rodar o Projeto

### 3.1. Instalar dependências (se ainda não fez)

```bash
cd financas-app
npm install
```

### 3.2. Iniciar o servidor de desenvolvimento

```bash
npx expo start
```

### 3.3. Abrir no celular

1. Abra o app **Expo Go** no seu celular
2. Escaneie o QR Code que apareceu no terminal
3. Aguarde o app carregar

## 📱 Como Usar o App

### 1. Criar sua conta
- Na tela inicial, clique em "Cadastre-se"
- Preencha nome, email e senha
- Clique em "Cadastrar"

### 2. Importar Extrato Bancário

#### 2.1. Preparar o CSV
Crie um arquivo CSV com este formato:

```csv
Data,Descrição,Valor
05/11/2025,Salário,5000.00
04/11/2025,Supermercado,-250.50
03/11/2025,Aluguel,-1200.00
```

**Importante:**
- Despesas devem ter valor negativo (com o sinal `-`)
- Receitas devem ter valor positivo
- Use ponto (`.`) como separador decimal

#### 2.2. Importar
1. Na tela inicial, clique em **"Importar Extrato"**
2. Clique em **"Selecionar Arquivo CSV"**
3. Escolha seu arquivo
4. Aguarde a importação

**🔒 Segurança:** O app detecta duplicatas automaticamente. Você pode importar o mesmo arquivo várias vezes sem problemas!

### 3. Cadastrar Lançamentos Futuros

1. Na tela inicial, clique em **"Lançamentos Futuros"**
2. Clique no botão **"+"**
3. Preencha:
   - **Descrição:** Ex: "Salário"
   - **Valor:** Use `-` para despesas (Ex: `-1200` para aluguel, `5000` para salário)
   - **Dia do mês:** De 1 a 31
   - **Data de início:** Quando começa a recorrência
4. Clique em **"Salvar"**

**Exemplos:**
- Salário: `5000`, dia `5`
- Aluguel: `-1200`, dia `10`
- Internet: `-100`, dia `15`

### 4. Ver Projeção de Saldo

1. Na tela inicial, clique em **"Projeção de Saldo"**
2. Veja o gráfico com sua projeção
3. Alterne entre **6 meses** ou **12 meses**
4. Veja quando seu saldo ficará positivo (se estiver negativo)

## 🔒 Segurança - Perguntas e Respostas

### P: Meus dados estão seguros?
**R:** Sim! Cada usuário tem seus dados 100% isolados. As regras do Firestore garantem que você só pode acessar seus próprios dados.

### P: Outro usuário pode ver minhas transações?
**R:** Não! Mesmo que alguém tente, o Firestore vai negar o acesso. As regras verificam se o `auth.uid` do usuário logado é igual ao `userId` do documento.

### P: Posso testar a segurança?
**R:** Sim! No console do Firebase, vá em Firestore → Regras → Aba "Simulador" e teste diferentes cenários.

## 📊 Estrutura de Dados no Firestore

Assim ficam organizados seus dados:

```
users/
  └── {seuUserId}/
       ├── profile (documento)
       │    ├── name: "Seu Nome"
       │    ├── email: "seu@email.com"
       │    └── createdAt: timestamp
       │
       ├── transactions/ (subcoleção)
       │    ├── {transactionId1}
       │    │    ├── date: "2025-11-05"
       │    │    ├── description: "Salário"
       │    │    ├── amount: 5000
       │    │    ├── type: "income"
       │    │    └── importHash: "abc123..."
       │    │
       │    └── {transactionId2}
       │         └── ...
       │
       └── recurringTransactions/ (subcoleção)
            └── {recurringId1}
                 ├── description: "Aluguel"
                 ├── amount: -1200
                 ├── dayOfMonth: 10
                 └── startDate: timestamp
```

## 🐛 Solução de Problemas

### Erro: "Network request failed"
- Verifique se o Firebase está configurado corretamente
- Verifique sua conexão com a internet
- Confirme que as credenciais em `src/config/firebase.js` estão corretas

### Erro: "Permission denied"
- Verifique se você publicou as regras de segurança no Firestore
- Certifique-se de que está logado no app

### Erro ao importar CSV
- Verifique se o CSV tem as colunas: Data, Descrição, Valor
- Use o formato de data DD/MM/YYYY
- Use ponto (`.`) como separador decimal nos valores

### App não abre no celular
- Certifique-se de que o celular e o PC estão na mesma rede Wi-Fi
- Tente fechar e abrir o app Expo Go novamente
- Execute `npx expo start --clear` para limpar o cache

## 📝 Próximos Passos (Melhorias Futuras)

- [ ] Suporte para importar arquivos OFX
- [ ] Categorização automática de despesas
- [ ] Exportar relatórios em PDF
- [ ] Notificações de vencimentos
- [ ] Modo escuro
- [ ] Backup automático
- [ ] Compartilhamento de relatórios

## 💰 Custos do Firebase (Plano Gratuito)

O plano **Spark** (gratuito) oferece:
- 50.000 leituras/dia no Firestore
- 20.000 escritas/dia no Firestore
- 1 GB de armazenamento
- 10 GB de transferência/mês

**Para uso pessoal, isso é mais do que suficiente!**

## 🆘 Precisa de Ajuda?

Se encontrar problemas:
1. Verifique o console do navegador (no Expo Go, chacoalhe o celular → Debug)
2. Confira se seguiu todos os passos do Firebase
3. Revise as credenciais em `src/config/firebase.js`

## 📄 Licença

Este projeto é de uso pessoal e educacional.

---

**Desenvolvido com ❤️ para gestão financeira pessoal**

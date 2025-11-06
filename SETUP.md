# 🚀 Guia de Configuração - Finanças App

Este guia te levará passo a passo pela configuração completa do aplicativo, desde a criação do projeto no Firebase até o primeiro uso.

---

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Criar Projeto no Firebase](#1-criar-projeto-no-firebase)
3. [Configurar Firebase Authentication](#2-configurar-firebase-authentication)
4. [Configurar Cloud Firestore](#3-configurar-cloud-firestore)
5. [Publicar Regras de Segurança](#4-publicar-regras-de-segurança)
6. [Obter Credenciais do Firebase](#5-obter-credenciais-do-firebase)
7. [Configurar Variáveis de Ambiente](#6-configurar-variáveis-de-ambiente)
8. [Instalar Dependências](#7-instalar-dependências)
9. [Executar o Aplicativo](#8-executar-o-aplicativo)
10. [Testar Segurança](#9-testar-segurança)
11. [Problemas Comuns](#problemas-comuns)

---

## Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ **Node.js** instalado (versão 16 ou superior)
  - Verifique: `node --version`
  - Download: https://nodejs.org/

- ✅ **npm** ou **yarn** (vem com o Node.js)
  - Verifique: `npm --version`

- ✅ **Conta Google** (para acessar o Firebase Console)

- ✅ **Expo CLI** (opcional, mas recomendado)
  - Instalar: `npm install -g expo-cli`

---

## 1. Criar Projeto no Firebase

### Passo 1.1: Acessar o Firebase Console

1. Acesse: https://console.firebase.google.com/
2. Faça login com sua conta Google
3. Clique em **"Adicionar projeto"** (ou **"Add project"**)

### Passo 1.2: Configurar o Projeto

1. **Nome do projeto**: Digite um nome (ex: `financas-app-seu-nome`)
2. Clique em **"Continuar"**
3. **Google Analytics**: Você pode desabilitar (não é necessário para este app)
4. Clique em **"Criar projeto"**
5. Aguarde a criação (leva ~30 segundos)
6. Clique em **"Continuar"**

---

## 2. Configurar Firebase Authentication

### Passo 2.1: Ativar Authentication

1. No menu lateral, clique em **"Build"** → **"Authentication"**
2. Clique em **"Get started"** (ou **"Começar"**)
3. Clique na aba **"Sign-in method"** (ou **"Método de login"**)

### Passo 2.2: Ativar Email/Password

1. Clique em **"Email/Password"**
2. Ative a primeira opção: **"Enable"** (Email/password)
3. **NÃO** ative a segunda opção (Email link)
4. Clique em **"Save"** (ou **"Salvar"**)

### Passo 2.3: (Opcional) Ativar Google Sign-In

Se você quiser permitir login com Google no futuro:

1. Clique em **"Google"**
2. Ative o toggle **"Enable"**
3. Selecione um email de suporte
4. Clique em **"Save"**

---

## 3. Configurar Cloud Firestore

### Passo 3.1: Criar Banco de Dados

1. No menu lateral, clique em **"Build"** → **"Firestore Database"**
2. Clique em **"Create database"** (ou **"Criar banco de dados"**)

### Passo 3.2: Escolher Modo de Segurança

1. **IMPORTANTE**: Selecione **"Start in production mode"**
   - Não se preocupe, vamos configurar as regras no próximo passo
2. Clique em **"Next"** (ou **"Avançar"**)

### Passo 3.3: Escolher Localização

1. Escolha a região mais próxima de você:
   - Brasil: `southamerica-east1` (São Paulo)
   - Ou deixe o padrão: `us-central` (funcionará bem também)
2. ⚠️ **ATENÇÃO**: A localização não pode ser alterada depois!
3. Clique em **"Enable"** (ou **"Ativar"**)
4. Aguarde a criação (~1 minuto)

---

## 4. Publicar Regras de Segurança

### Passo 4.1: Acessar Regras

1. No Firestore Database, clique na aba **"Rules"** (ou **"Regras"**)
2. Você verá um editor de código

### Passo 4.2: Copiar Regras do Projeto

1. Abra o arquivo `firestore.rules` neste projeto
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no editor do Firebase Console**, substituindo o conteúdo existente

### Passo 4.3: Publicar

1. Clique em **"Publish"** (ou **"Publicar"**)
2. Aguarde a confirmação: **"Rules have been published"**

✅ **Importante**: As regras de segurança agora garantem que cada usuário só acessa seus próprios dados!

---

## 5. Obter Credenciais do Firebase

### Passo 5.1: Adicionar App Web

1. No menu lateral, clique no ícone de **engrenagem** ⚙️ → **"Project settings"**
2. Role para baixo até a seção **"Your apps"** (ou **"Seus apps"**)
3. Clique no ícone **"</>"** (Web)

### Passo 5.2: Registrar App

1. **Nickname**: Digite um nome (ex: `financas-app-web`)
2. **NÃO** marque "Firebase Hosting"
3. Clique em **"Register app"** (ou **"Registrar app"**)

### Passo 5.3: Copiar Configuração

Você verá algo assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

⚠️ **NÃO FECHE ESTA PÁGINA AINDA!** Você vai precisar dessas informações no próximo passo.

Clique em **"Continue to console"** (ou **"Continuar para o console"**)

---

## 6. Configurar Variáveis de Ambiente

### Passo 6.1: Criar Arquivo .env

1. Na raiz do projeto, copie o arquivo `.env.example`:

```bash
cp .env.example .env
```

(No Windows: `copy .env.example .env`)

### Passo 6.2: Preencher Credenciais

Abra o arquivo `.env` e preencha com os valores do Firebase:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_id
EXPO_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

**Exemplo preenchido**:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=financas-app-123.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=financas-app-123
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=financas-app-123.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

⚠️ **IMPORTANTE**: O arquivo `.env` está no `.gitignore` e **NUNCA** deve ser commitado!

---

## 7. Instalar Dependências

No terminal, na raiz do projeto:

```bash
npm install
```

(Ou se você usa yarn: `yarn install`)

Aguarde a instalação de todas as dependências (~2-3 minutos).

---

## 8. Executar o Aplicativo

### Passo 8.1: Iniciar o Servidor Expo

```bash
npm start
```

(Ou: `expo start` se você tem o Expo CLI instalado globalmente)

### Passo 8.2: Escolher Plataforma

Você verá opções no terminal:

- **a** - Abrir no Android Emulator
- **i** - Abrir no iOS Simulator (apenas Mac)
- **w** - Abrir no navegador web

Para testar rapidamente, pressione **w** (web).

### Passo 8.3: Criar Conta de Teste

1. No app, clique em **"Registrar"**
2. Preencha:
   - **Nome**: Seu nome
   - **Email**: Use um email de teste (ex: `teste@teste.com`)
   - **Senha**: Mínimo 6 caracteres
3. Clique em **"Registrar"**

Se tudo estiver correto, você será redirecionado para a tela principal! 🎉

---

## 9. Testar Segurança

### Passo 9.1: Verificar no Firebase Console

1. Volte ao Firebase Console
2. Vá em **Firestore Database**
3. Você deve ver a seguinte estrutura:

```
users/
└── {seu_user_id}/
    ├── name: "Seu Nome"
    ├── email: "teste@teste.com"
    ├── createdAt: {timestamp}
    └── (subcoleções aparecerão quando você criar transações)
```

### Passo 9.2: Executar Testes de Segurança

1. Com o app aberto no navegador (web), pressione **F12** (abrir DevTools)
2. Vá na aba **Console**
3. Cole o seguinte comando:

```javascript
// Importar e executar todos os testes
const script = document.createElement('script');
script.src = './tests/security-tests.js';
document.head.appendChild(script);

// Depois que carregar, execute:
setTimeout(() => executarTodosOsTestes(), 2000);
```

4. Aguarde os resultados dos testes

✅ **Resultado esperado**: Todos os testes devem **PASSAR** (os testes verificam que operações inválidas são bloqueadas)

---

## 10. Próximos Passos

Agora que tudo está configurado:

### Criar Dados de Teste

1. **Adicionar Transações Manualmente**:
   - Use a tela principal do app
   - Teste criar receitas e despesas

2. **Importar Extrato CSV**:
   - Use o arquivo `exemplo-extrato.csv` fornecido
   - Teste a funcionalidade de importação
   - Importe novamente para verificar de-duplicação

3. **Cadastrar Transações Recorrentes**:
   - Vá na tela de Recorrentes
   - Cadastre salário, aluguel, etc.
   - Verifique a projeção de saldo

### Verificar Segurança

1. Crie **2 contas de teste** diferentes
2. Verifique que cada uma só vê seus próprios dados
3. Execute os testes de segurança (Passo 9.2)

### Personalizar

1. Edite as telas em `src/screens/`
2. Ajuste cores e estilos
3. Adicione novas funcionalidades

---

## Problemas Comuns

### ❌ Erro: "Firebase Configuration Error"

**Causa**: Variáveis de ambiente não configuradas

**Solução**:
1. Verifique se o arquivo `.env` existe
2. Verifique se todas as variáveis estão preenchidas
3. Reinicie o servidor: `Ctrl+C` → `npm start`

---

### ❌ Erro: "PERMISSION_DENIED" ao criar transação

**Causa**: Regras de segurança não publicadas ou incorretas

**Solução**:
1. Volte ao Firebase Console → Firestore → Rules
2. Verifique se as regras estão corretas (compare com `firestore.rules`)
3. Clique em **"Publish"**

---

### ❌ Erro: "auth/invalid-email" no registro

**Causa**: Email inválido

**Solução**: Use um formato válido de email (ex: `teste@teste.com`)

---

### ❌ Erro: "auth/weak-password"

**Causa**: Senha muito curta

**Solução**: Use pelo menos 6 caracteres na senha

---

### ❌ App não abre no Android/iOS

**Causa**: Emulador não configurado ou não aberto

**Solução**:
1. **Android**: Instale Android Studio e configure um emulador
2. **iOS** (apenas Mac): Instale Xcode
3. Ou use a opção **web** (w) que sempre funciona

---

### ❌ Erro: "Module not found"

**Causa**: Dependências não instaladas

**Solução**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Plano Gratuito do Firebase

Este app foi projetado para funcionar no **plano gratuito (Spark)** do Firebase:

### Limites Gratuitos (por dia):

| Recurso | Limite Gratuito |
|---------|-----------------|
| **Authentication** | Ilimitado |
| **Firestore Leituras** | 50.000 / dia |
| **Firestore Escritas** | 20.000 / dia |
| **Armazenamento** | 1 GB |

### Estimativa de Uso Pessoal:

Para uso pessoal (1 usuário):
- ✅ **Leituras**: ~100-500 / dia (muito abaixo do limite)
- ✅ **Escritas**: ~20-100 / dia (muito abaixo do limite)
- ✅ **Armazenamento**: < 1 MB (muito abaixo do limite)

**Conclusão**: O plano gratuito é **mais do que suficiente** para uso pessoal! 🎉

---

## Suporte

Se você encontrar problemas:

1. **Revise este guia** do início ao fim
2. **Verifique a documentação de segurança**: `SECURITY.md`
3. **Execute os testes de segurança**: `tests/security-tests.js`
4. **Consulte os logs** do console (F12 no navegador)

---

## Recursos Adicionais

- 📚 [Documentação do Firebase](https://firebase.google.com/docs)
- 📚 [Documentação do Expo](https://docs.expo.dev/)
- 📚 [Documentação do React Native](https://reactnative.dev/)
- 🔐 [Guia de Segurança do App](SECURITY.md)

---

**Última atualização**: 2025-11-06

**Boa sorte com seu app de finanças! 💰📊**

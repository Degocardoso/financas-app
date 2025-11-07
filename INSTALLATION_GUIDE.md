# 🚀 Guia de Instalação e Configuração - Finanças App

**Data**: 2025-11-07
**Versão**: 1.0.0

Este documento contém todas as instruções necessárias para instalar, configurar e executar o aplicativo de gestão financeira.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação das Dependências](#instalação-das-dependências)
3. [Configuração do Firebase](#configuração-do-firebase)
4. [Configuração do Aplicativo](#configuração-do-aplicativo)
5. [Executando o Aplicativo](#executando-o-aplicativo)
6. [Testando as Funcionalidades](#testando-as-funcionalidades)
7. [Resolução de Problemas](#resolução-de-problemas)
8. [Funcionalidades Implementadas](#funcionalidades-implementadas)

---

## 1. Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### Obrigatórios:

- ✅ **Node.js** (versão 16 ou superior)
  - Verificar: `node --version`
  - Download: https://nodejs.org/

- ✅ **npm** ou **yarn**
  - Verificar: `npm --version`

- ✅ **Git**
  - Verificar: `git --version`

- ✅ **Conta no Firebase** (gratuita)
  - Criar em: https://firebase.google.com/

### Opcionais (para testar no dispositivo):

- 📱 **Expo Go** no celular (Android/iOS)
  - Download: App Store / Play Store

- 💻 **Android Studio** (para emulador Android)
- 🍎 **Xcode** (para emulador iOS - apenas Mac)

---

## 2. Instalação das Dependências

### Passo 1: Clonar o Repositório (se necessário)

```bash
git clone <url-do-repositorio>
cd financas-app
```

### Passo 2: Instalar Dependências

```bash
npm install
```

**Aguarde**: Este processo pode levar 2-3 minutos.

### Passo 3: Verificar Instalação

```bash
npm list --depth=0
```

**Dependências principais esperadas**:
- expo ~52.0.0
- firebase ^10.13.0
- @react-navigation/native ^6.1.9
- @react-native-async-storage/async-storage ~2.0.0
- react-native-chart-kit ^6.12.0
- expo-document-picker ~12.0.2
- expo-file-system ~17.0.1
- expo-media-library ~17.0.3

---

## 3. Configuração do Firebase

### Passo 1: Criar Projeto no Firebase

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"** ou **"Add project"**
3. Nome do projeto: `financas-app` (ou outro nome)
4. **Google Analytics**: Desabilite (opcional)
5. Clique em **"Criar projeto"**
6. Aguarde ~30 segundos
7. Clique em **"Continuar"**

### Passo 2: Ativar Firebase Authentication

1. No menu lateral: **Build** → **Authentication**
2. Clique em **"Get started"** ou **"Começar"**
3. Na aba **"Sign-in method"**:
   - Clique em **"Email/Password"**
   - Ative a primeira opção (**Enable**)
   - Clique em **"Save"**

### Passo 3: Criar Firestore Database

1. No menu lateral: **Build** → **Firestore Database**
2. Clique em **"Create database"** ou **"Criar banco de dados"**
3. **Modo**: Selecione **"Start in production mode"**
   - ⚠️ Não se preocupe, vamos configurar as regras de segurança no próximo passo
4. Clique em **"Next"** ou **"Avançar"**
5. **Localização**: Escolha a região mais próxima
   - Brasil: `southamerica-east1` (São Paulo)
   - Ou deixe o padrão: `us-central`
6. ⚠️ **IMPORTANTE**: A localização não pode ser alterada depois!
7. Clique em **"Enable"** ou **"Ativar"**
8. Aguarde ~1 minuto

### Passo 4: Publicar Regras de Segurança

1. No Firestore Database, clique na aba **"Rules"** ou **"Regras"**
2. Você verá um editor de código
3. **COPIE TODO o conteúdo** do arquivo `firestore.rules` do projeto
4. **COLE no editor**, substituindo o conteúdo existente
5. Clique em **"Publish"** ou **"Publicar"**
6. Aguarde a confirmação: **"Rules have been published"**

✅ **Importante**: Isso garante que cada usuário só acesse seus próprios dados!

### Passo 5: Obter Credenciais do Firebase

1. No menu lateral: Clique no ícone de **engrenagem** ⚙️
2. Clique em **"Project settings"** ou **"Configurações do projeto"**
3. Role para baixo até a seção **"Your apps"** ou **"Seus apps"**
4. Clique no ícone **"</>"** (Web)
5. **App nickname**: Digite `financas-app-web`
6. **NÃO** marque "Firebase Hosting"
7. Clique em **"Register app"** ou **"Registrar app"**
8. Você verá algo assim:

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

9. **COPIE TODOS OS VALORES** (vamos usar no próximo passo)
10. Clique em **"Continue to console"**

---

## 4. Configuração do Aplicativo

### Passo 1: Criar Arquivo .env

Na raiz do projeto, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

**Windows**:
```cmd
copy .env.example .env
```

### Passo 2: Editar o Arquivo .env

Abra o arquivo `.env` em um editor de texto e preencha com as credenciais do Firebase:

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
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyABC123def456GHI789jkl012MNO345pqr
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=financas-app-abc123.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=financas-app-abc123
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=financas-app-abc123.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789
```

### Passo 3: Verificar Configuração

Execute um teste rápido:

```bash
npm start
```

Se não aparecer erro de Firebase Configuration, está tudo certo! ✅

Pressione `Ctrl+C` para parar por enquanto.

---

## 5. Executando o Aplicativo

### Opção 1: No Navegador Web (Mais Fácil)

```bash
npm start
```

Pressione **`w`** para abrir no navegador.

### Opção 2: No Celular (Expo Go)

```bash
npm start
```

1. Abra o app **Expo Go** no celular
2. Escaneie o QR Code que apareceu no terminal
3. Aguarde o app carregar (~30 segundos)

### Opção 3: No Emulador Android

```bash
npm run android
```

### Opção 4: No Emulador iOS (apenas Mac)

```bash
npm run ios
```

---

## 6. Testando as Funcionalidades

### Passo 1: Criar Conta de Teste

1. No app, clique em **"Cadastre-se"**
2. Preencha:
   - **Nome**: Seu nome
   - **Email**: Use um email de teste (ex: `teste@teste.com`)
   - **Senha**: Mínimo 6 caracteres (ex: `123456`)
3. Clique em **"Registrar"**

✅ Se funcionou, você será redirecionado para a tela principal!

### Passo 2: Explorar o Menu

Na tela principal, você verá **6 botões principais**:

#### **Novos Recursos** (implementados por mim):

1. **💰 Receitas**
   - Cadastre receitas únicas (ex: Bônus)
   - Cadastre receitas recorrentes (ex: Salário todo dia 5)
   - Frequências: Diária, Semanal, Quinzenal, Mensal, Anual

2. **📆 Despesas Diárias**
   - Defina um orçamento diário (ex: R$ 30 por dia)
   - Lance gastos reais do dia
   - Veja comparação: orçamento vs gasto real

3. **📈 Dashboard**
   - Visualize estatísticas gerais
   - Gráfico de previsão mensal (receitas vs despesas)
   - Gráfico de fluxo de caixa (projeção diária de 6 ou 12 meses)

#### **Recursos Originais**:

4. **📥 Importar Extrato**
   - Importe arquivos CSV
   - De-duplicação automática

5. **🔄 Lançamentos Futuros**
   - Cadastre despesas e receitas recorrentes

6. **📊 Projeção de Saldo**
   - Veja quando seu saldo ficará positivo

#### **Configurações**:

7. **⚙️ Configurações**
   - Mude o tema (Claro / Escuro / Sistema)
   - Faça logout

### Passo 3: Testar Cada Funcionalidade

#### Teste 1: Cadastrar Receita

1. Clique em **"Receitas"**
2. Clique no botão **"+"** (canto inferior direito)
3. Preencha:
   - **Tipo**: Recorrente
   - **Descrição**: Salário
   - **Valor**: 5000
   - **Frequência**: Mensal
   - **Dia do mês**: 5
4. Clique em **"Salvar"**

✅ **Resultado esperado**: Receita aparece na lista com badge "Recorrente" e "Mensal"

#### Teste 2: Definir Orçamento Diário

1. Clique em **"Despesas Diárias"**
2. Clique em **"Definir Orçamento"**
3. Digite: `30` (R$ 30 por dia)
4. Clique em **"Salvar"**

✅ **Resultado esperado**: Card "Hoje" mostra orçamento de R$ 30,00

#### Teste 3: Lançar Gasto

1. Ainda em "Despesas Diárias"
2. Clique em **"+ Gasto"**
3. Preencha:
   - **Valor**: 25.50
   - **Descrição**: Almoço
4. Clique em **"Salvar"**

✅ **Resultado esperado**:
- Card "Hoje" atualiza
- Gasto: R$ 25,50
- Restante: R$ 4,50 (verde)

#### Teste 4: Visualizar Dashboard

1. Clique em **"Dashboard"**
2. Aguarde carregar

✅ **Resultado esperado**:
- Cards de estatísticas mostram dados
- Gráfico de previsão mensal aparece
- Gráfico de fluxo de caixa mostra linha

#### Teste 5: Mudar Tema

1. Clique em **"Configurações"**
2. Clique em **"Modo Noturno"**

✅ **Resultado esperado**: App fica escuro instantaneamente

3. Volte e navegue entre telas
4. Verifique que TODAS as telas adaptaram ao tema escuro

---

## 7. Resolução de Problemas

### Problema 1: "Firebase Configuration Error"

**Causa**: Variáveis de ambiente não configuradas

**Solução**:
1. Verifique se o arquivo `.env` existe
2. Verifique se todas as variáveis estão preenchidas
3. Reinicie o servidor: `Ctrl+C` → `npm start`
4. Limpe o cache: `npm start -- --clear`

### Problema 2: "PERMISSION_DENIED" ao criar receita/despesa

**Causa**: Regras de segurança não publicadas

**Solução**:
1. Volte ao Firebase Console → Firestore → Rules
2. Verifique se as regras foram publicadas
3. Compare com o arquivo `firestore.rules` do projeto
4. Publique novamente se necessário

### Problema 3: "Module not found: @react-native-async-storage"

**Causa**: Dependência não instalada

**Solução**:
```bash
npm install
npm start -- --clear
```

### Problema 4: Gráficos não aparecem

**Causa**: Dados insuficientes ou erro de renderização

**Solução**:
1. Cadastre pelo menos 1 receita e 1 despesa
2. Aguarde 5 segundos e puxe para baixo (pull-to-refresh)
3. Se persistir, reinicie o app

### Problema 5: App não abre no celular

**Causa**: Dispositivo e computador em redes diferentes

**Solução**:
1. Certifique-se de que celular e PC estão na **mesma rede Wi-Fi**
2. Feche e abra o Expo Go novamente
3. Escaneie o QR Code novamente

### Problema 6: "auth/invalid-email" no registro

**Causa**: Formato de email inválido

**Solução**: Use um formato válido: `email@dominio.com`

### Problema 7: "auth/weak-password"

**Causa**: Senha muito curta

**Solução**: Use pelo menos **6 caracteres**

---

## 8. Funcionalidades Implementadas

### ✅ Completo (100%)

#### 1. **Módulo de Receitas** (Backend + Frontend)

**Backend**: `src/services/incomeService.js`
- ✅ CRUD completo
- ✅ Receitas únicas e recorrentes
- ✅ 5 frequências: diária, semanal, quinzenal, mensal, anual
- ✅ Validações robustas
- ✅ Cálculo de totais

**Frontend**: `src/screens/IncomesScreen.js`
- ✅ Lista com filtros (todas/únicas/recorrentes)
- ✅ Modal de cadastro completo
- ✅ Exclusão com confirmação
- ✅ Pull-to-refresh
- ✅ Suporte a temas

#### 2. **Módulo de Despesas Diárias** (Backend + Frontend)

**Backend**: `src/services/dailyBudgetService.js`
- ✅ Definição de orçamento diário
- ✅ Lançamento de gastos reais
- ✅ Comparação orçamento vs gasto
- ✅ De-duplicação automática
- ✅ Agrupamento por data

**Frontend**: `src/screens/DailyBudgetScreen.js`
- ✅ Card de resumo do dia
- ✅ Formulário de orçamento
- ✅ Formulário de gasto
- ✅ Lista agrupada por data
- ✅ Indicador visual de excedente

#### 3. **Módulo de Dashboard** (Backend + Frontend)

**Backend**: `src/services/dashboardService.js`
- ✅ Estatísticas gerais
- ✅ Previsão mensal (receitas vs despesas)
- ✅ Projeção de fluxo de caixa (6 ou 12 meses)
- ✅ Resumo de orçamento diário

**Frontend**: `src/screens/DashboardScreen.js`
- ✅ Cards de estatísticas
- ✅ Gráfico de previsão mensal (Bar Chart)
- ✅ Gráfico de fluxo de caixa (Line Chart)
- ✅ Seletor de período (6 ou 12 meses)

#### 4. **Sistema de Temas** (Frontend)

**Arquivos**:
- `src/config/themes.js` - Definição de cores
- `src/context/ThemeContext.js` - Gerenciamento de estado
- `src/screens/SettingsScreen.js` - Interface

**Funcionalidades**:
- ✅ Tema Claro
- ✅ Tema Escuro
- ✅ Modo Sistema (detecta automaticamente)
- ✅ Persistência com AsyncStorage
- ✅ Todas as telas adaptadas

#### 5. **Segurança** (Backend)

**Arquivo**: `firestore.rules`
- ✅ Validações para todas as coleções
- ✅ Isolamento total de dados por usuário
- ✅ Validação de tipos, valores e datas
- ✅ Proteção contra valores absurdos
- ✅ Bloqueio global

#### 6. **Navegação e Integração** (Frontend)

- ✅ `App.js` com ThemeProvider
- ✅ Rotas para todas as telas
- ✅ `HomeScreen` atualizado com novos botões
- ✅ Navegação fluida entre telas

---

## 📚 Documentação Adicional

Consulte os seguintes documentos para mais informações:

| Documento | Descrição |
|-----------|-----------|
| **[README.md](README.md)** | Visão geral do projeto |
| **[SECURITY.md](SECURITY.md)** | Arquitetura de segurança detalhada |
| **[SETUP.md](SETUP.md)** | Guia detalhado de configuração do Firebase |
| **[DEVELOPMENT_PROGRESS.md](DEVELOPMENT_PROGRESS.md)** | Status e progresso do desenvolvimento |

---

## 🎯 Checklist de Instalação

Marque cada item conforme concluir:

### Firebase
- [ ] Projeto criado no Firebase Console
- [ ] Firebase Authentication ativado (Email/Password)
- [ ] Firestore Database criado
- [ ] Regras de segurança publicadas
- [ ] Credenciais copiadas

### Aplicativo
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` criado e preenchido
- [ ] Servidor iniciado (`npm start`)
- [ ] App abrindo sem erros

### Testes
- [ ] Conta de teste criada
- [ ] Receita cadastrada com sucesso
- [ ] Orçamento diário definido
- [ ] Gasto lançado
- [ ] Dashboard visualizado
- [ ] Tema alternado (claro/escuro)
- [ ] Todas as 7 telas testadas

---

## 🚀 Próximos Passos

Após tudo funcionar:

1. **Personalize**:
   - Altere cores em `src/config/themes.js`
   - Adicione novos recursos

2. **Produza Dados Reais**:
   - Importe seus extratos bancários
   - Cadastre suas receitas e despesas reais

3. **Monitore**:
   - Use o Dashboard diariamente
   - Ajuste orçamento conforme necessário

4. **Feedback**:
   - Reporte bugs encontrados
   - Sugira melhorias

---

## 💡 Dicas

1. **Backup**: O Firebase faz backup automático dos dados
2. **Segurança**: Nunca compartilhe o arquivo `.env`
3. **Performance**: Limpe o cache se o app ficar lento: `npm start -- --clear`
4. **Atualização**: Para atualizar dependências: `npm update`

---

## 📞 Suporte

Se encontrar problemas:

1. Consulte a seção "Resolução de Problemas" acima
2. Verifique o console de erros (F12 no navegador)
3. Revise as regras do Firestore no Firebase Console
4. Consulte `SECURITY.md` para questões de segurança

---

**Última atualização**: 2025-11-07
**Versão do App**: 1.0.0

**Boa sorte com seu gerenciamento financeiro! 💰📊**

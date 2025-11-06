# 💰 Finanças App - Gestão Financeira Pessoal

> **Aplicativo híbrido (Android/iOS/Web) para controle financeiro com foco em segurança e projeção de saldo**

[![React Native](https://img.shields.io/badge/React%20Native-0.76.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~52.0.0-black.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.13.0-orange.svg)](https://firebase.google.com/)

---

## 📋 Sobre o Projeto

O **Finanças App** é um aplicativo de gestão financeira pessoal que permite:

- 🔐 **Segurança Total**: Isolamento completo de dados entre usuários
- 📊 **Projeção de Saldo**: Visualize seu saldo futuro com base em receitas e despesas recorrentes
- 📥 **Importação de Extratos**: Importe arquivos CSV com de-duplicação automática
- 🔄 **Lançamentos Recorrentes**: Cadastre salário, aluguel e outras transações fixas
- 📈 **Gráficos Interativos**: Veja sua evolução financeira de forma visual

---

## 🚀 Início Rápido

### Instalação Completa (5 minutos)

Para configurar o projeto do zero, siga o guia detalhado:

📚 **[GUIA COMPLETO DE CONFIGURAÇÃO (SETUP.md)](SETUP.md)**

O guia inclui:
- ✅ Criação do projeto no Firebase
- ✅ Configuração de autenticação
- ✅ Configuração do Firestore
- ✅ Publicação de regras de segurança
- ✅ Configuração de variáveis de ambiente
- ✅ Testes de segurança

### Instalação Rápida (para desenvolvedores)

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/financas-app.git
cd financas-app

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Firebase

# 4. Iniciar o app
npm start
```

---

## 🔒 Segurança

Este projeto foi desenvolvido com **segurança em primeiro lugar**:

### Arquitetura de Segurança

- ✅ **Isolamento Total**: Cada usuário só acessa seus próprios dados
- ✅ **Validação em Múltiplas Camadas**: Frontend + Backend (Firestore Rules)
- ✅ **Schema Validation**: Tipos e tamanhos validados nas regras do Firestore
- ✅ **Proteção contra Injeção**: Validação e sanitização de todos os inputs
- ✅ **Variáveis de Ambiente**: Credenciais não ficam expostas no código

### Documentação de Segurança

📚 **[DOCUMENTAÇÃO COMPLETA DE SEGURANÇA (SECURITY.md)](SECURITY.md)**

Inclui:
- Arquitetura de segurança em camadas
- Como funcionam as regras do Firestore
- Proteção contra ataques comuns
- Testes de segurança automatizados
- Checklist de segurança para produção

### Testes de Segurança

Execute os testes para verificar a segurança do seu app:

```bash
# Com o app rodando no navegador (web):
# 1. Pressione F12 (DevTools)
# 2. Vá na aba Console
# 3. Execute:
executarTodosOsTestes()
```

Veja mais em: [`tests/security-tests.js`](tests/security-tests.js)

---

## 📂 Estrutura do Projeto

```
financas-app/
├── src/
│   ├── config/
│   │   └── firebase.js              # Configuração do Firebase (com .env)
│   ├── services/
│   │   ├── authService.js           # Autenticação (login, registro)
│   │   ├── transactionService.js    # CRUD de transações (com validações)
│   │   └── projectionService.js     # Cálculo de projeções
│   ├── screens/
│   │   ├── LoginScreen.js           # Tela de login
│   │   ├── RegisterScreen.js        # Tela de registro
│   │   ├── HomeScreen.js            # Dashboard principal
│   │   ├── ImportScreen.js          # Importação de CSV
│   │   ├── RecurringScreen.js       # Lançamentos recorrentes
│   │   └── ProjectionScreen.js      # Gráfico de projeção
│   ├── components/
│   │   └── ProjectionChart.js       # Componente de gráfico
│   └── utils/
│       ├── csvParser.js             # Parser de CSV
│       └── deduplication.js         # Hash para de-duplicação
├── tests/
│   └── security-tests.js            # Testes de segurança
├── firestore.rules                  # Regras de segurança do Firestore
├── .env.example                     # Exemplo de variáveis de ambiente
├── .gitignore                       # Arquivos ignorados pelo Git
├── SETUP.md                         # Guia completo de configuração
├── SECURITY.md                      # Documentação de segurança
└── README.md                        # Este arquivo
```

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React Native** 0.76.5 - Framework mobile
- **Expo** ~52.0.0 - Plataforma de desenvolvimento
- **React Navigation** 6.x - Navegação entre telas
- **React Native Chart Kit** 6.x - Gráficos
- **Papaparse** 5.x - Parser de CSV

### Backend & Database
- **Firebase Authentication** - Login seguro
- **Cloud Firestore** - Banco de dados NoSQL
- **Firebase Security Rules** - Regras de segurança no backend

### Segurança & Validação
- **Crypto-js** 4.x - Hash para de-duplicação
- **Schema Validation** - Nas Firestore Rules
- **Input Sanitization** - No transactionService.js

---

## 📖 Documentação Adicional

| Documento | Descrição |
|-----------|-----------|
| **[SETUP.md](SETUP.md)** | Guia completo de configuração (do zero) |
| **[SECURITY.md](SECURITY.md)** | Arquitetura e práticas de segurança |
| **[firestore.rules](firestore.rules)** | Regras de segurança do Firestore |
| **[tests/security-tests.js](tests/security-tests.js)** | Scripts de teste de segurança |

---

## 📊 Funcionalidades Detalhadas

### 1. 🔐 Autenticação Segura

- Login com Email/Senha
- Registro de novos usuários
- Proteção de rotas (só acessa se autenticado)
- Logout seguro

### 2. 📥 Importação de Extratos CSV

```csv
Data,Descrição,Valor
05/11/2025,Salário,5000.00
04/11/2025,Supermercado,-250.50
03/11/2025,Aluguel,-1200.00
```

**Recursos**:
- ✅ Parser robusto de CSV
- ✅ De-duplicação automática via hash
- ✅ Validação de formato e valores
- ✅ Importações múltiplas sem duplicatas

### 3. 🔄 Lançamentos Recorrentes

Cadastre transações que se repetem todo mês:
- **Salário**: R$ 5.000, dia 5
- **Aluguel**: R$ -1.200, dia 10
- **Internet**: R$ -100, dia 15

### 4. 📈 Projeção de Saldo

- Visualize seu saldo futuro (6 ou 12 meses)
- Baseado em transações reais + lançamentos recorrentes
- Gráfico interativo com cores (vermelho/verde)
- Saiba quando seu saldo ficará positivo

---

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

# 🚀 GUIA RÁPIDO DE INÍCIO - 5 MINUTOS

## 1️⃣ Configure o Firebase (2 minutos)

1. Acesse: https://console.firebase.google.com/
2. Crie um projeto chamado `financas-app`
3. Ative **Authentication** (Email/Senha)
4. Crie o **Firestore Database** (modo produção)
5. Copie as **credenciais** do projeto

## 2️⃣ Cole as Credenciais (1 minuto)

Edite o arquivo: `src/config/firebase.js`

```javascript
const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI"
};
```

## 3️⃣ Configure as Regras de Segurança (1 minuto)

No Firebase Console:
1. Firestore Database → Aba "Regras"
2. Cole o conteúdo do arquivo `firestore.rules`
3. Clique em **"Publicar"**

## 4️⃣ Instale e Rode (1 minuto)

```bash
cd financas-app
npm install
npx expo start
```

## 5️⃣ Teste no Celular

1. Abra o **Expo Go** no celular
2. Escaneie o QR Code
3. Crie sua conta
4. Importe o arquivo `exemplo-extrato.csv`
5. Cadastre lançamentos futuros
6. Veja sua projeção! 🎉

---

## ✅ Checklist Rápido

- [ ] Projeto Firebase criado
- [ ] Authentication ativado
- [ ] Firestore criado
- [ ] Regras de segurança publicadas
- [ ] Credenciais coladas em `firebase.js`
- [ ] `npm install` executado
- [ ] App rodando no celular

## 🆘 Problemas?

Consulte o `README.md` completo para troubleshooting detalhado.

## 🎯 Primeiro Teste

Use este cenário para testar:

1. **Importe** o `exemplo-extrato.csv`
2. **Cadastre** lançamentos futuros:
   - Salário: R$ 5000, todo dia 5
   - Aluguel: R$ -1200, todo dia 1
3. **Veja a projeção** de 6 meses

Pronto! Seu app de finanças está funcionando! 💰

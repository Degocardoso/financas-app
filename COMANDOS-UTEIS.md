# ⌨️ COMANDOS ÚTEIS - COPIE E COLE

## 🚀 Iniciar o Projeto

### Primeira vez:
```bash
cd financas-app
npm install
npx expo start
```

### Próximas vezes:
```bash
cd financas-app
npx expo start
```

### Limpar cache (se algo estiver bugado):
```bash
cd financas-app
npx expo start --clear
```

---

## 📱 Abrir em Diferentes Plataformas

### Android:
```bash
npx expo start --android
```

### iOS (apenas no Mac):
```bash
npx expo start --ios
```

### Web (experimental):
```bash
npx expo start --web
```

---

## 🔧 Instalar Dependências Adicionais

### Se precisar reinstalar tudo:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Atualizar o Expo:
```bash
npm install expo@latest
```

### Verificar problemas:
```bash
npx expo-doctor
```

---

## 📦 Comandos NPM Úteis

### Ver dependências instaladas:
```bash
npm list --depth=0
```

### Verificar versão do Node e npm:
```bash
node --version
npm --version
```

### Verificar versão do Expo:
```bash
npx expo --version
```

---

## 🗂️ Comandos Git (Versionamento)

### Inicializar repositório (primeira vez):
```bash
cd financas-app
git init
git add .
git commit -m "Primeira versão do app de finanças"
```

### Fazer backup de alterações:
```bash
git add .
git commit -m "Descrição das mudanças"
```

### Ver histórico:
```bash
git log --oneline
```

### Criar branch para testar algo novo:
```bash
git checkout -b teste-nova-feature
```

### Voltar para a branch principal:
```bash
git checkout main
```

---

## 🔥 Firebase CLI (Opcional - Deploy das Regras)

### Instalar Firebase CLI:
```bash
npm install -g firebase-tools
```

### Fazer login:
```bash
firebase login
```

### Inicializar projeto:
```bash
cd financas-app
firebase init firestore
```

### Deploy das regras de segurança:
```bash
firebase deploy --only firestore:rules
```

---

## 📊 Monitoramento e Debug

### Ver logs do Expo:
- O terminal já mostra os logs automaticamente
- Ou pressione `j` para abrir o debugger

### Ver logs do Firebase:
- Acesse: https://console.firebase.google.com/
- Selecione seu projeto
- Menu lateral → Firestore → Dados

---

## 🧹 Limpeza

### Limpar cache do Expo:
```bash
npx expo start --clear
```

### Limpar node_modules (se algo está muito quebrado):
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Limpar cache do npm:
```bash
npm cache clean --force
```

---

## 🔒 Backup e Restauração

### Fazer backup do projeto:
```bash
cd ..
tar -czf financas-app-backup.tar.gz financas-app/
```

### Restaurar backup:
```bash
tar -xzf financas-app-backup.tar.gz
cd financas-app
npm install
```

---

## 📱 Build para Produção (Opcional)

### Android APK (requer configuração):
```bash
eas build --platform android
```

### iOS (requer Mac e configuração):
```bash
eas build --platform ios
```

### Instalar EAS CLI:
```bash
npm install -g eas-cli
eas login
```

---

## 🐛 Troubleshooting

### Erro: "expo command not found"
```bash
npm install -g expo-cli
```

### Erro: "Could not find iPhone simulator"
- Você precisa de um Mac com Xcode instalado

### Erro: "Port 8081 already in use"
```bash
kill -9 $(lsof -ti:8081)
npx expo start
```

### Erro: "Firebase not configured"
- Verifique o arquivo `src/config/firebase.js`
- Certifique-se de colar suas credenciais

### Erro: "Permission denied" no Firestore
- Verifique se publicou as regras no Firebase Console
- Certifique-se de estar logado no app

---

## 🎓 Comandos para Aprender Mais

### Ver documentação do Expo:
```bash
npx expo --help
```

### Ver estrutura do projeto:
```bash
tree -L 3 -I node_modules
```
(instale `tree` se necessário: `brew install tree` no Mac ou `apt install tree` no Linux)

### Ver tamanho do projeto:
```bash
du -sh .
du -sh node_modules/
```

---

## 🚀 Atalhos do Terminal do Expo

Quando você roda `npx expo start`, pode usar essas teclas:

- **a** → Abrir no Android
- **i** → Abrir no iOS
- **w** → Abrir no navegador
- **r** → Recarregar o app
- **m** → Alternar entre desenvolvimento/produção
- **j** → Abrir DevTools
- **c** → Limpar cache
- **?** → Mostrar ajuda

---

## 🎯 Workflow Recomendado

### Desenvolvimento:
```bash
# Terminal 1 (servidor Expo)
cd financas-app
npx expo start

# Terminal 2 (comandos Git)
cd financas-app
git add .
git commit -m "Nova feature"
```

---

## 📋 Checklist de Comandos ao Encontrar Problemas

Se algo não está funcionando, execute nesta ordem:

```bash
# 1. Limpar cache do Expo
npx expo start --clear

# 2. Se não resolver, reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# 3. Se ainda não resolver, verificar configuração
npx expo-doctor

# 4. Como último recurso, deletar e reclonar
cd ..
rm -rf financas-app
git clone [seu-repositorio]
cd financas-app
npm install
npx expo start
```

---

## 💡 Dica Pro

Crie aliases no seu terminal para comandos frequentes:

**No Linux/Mac, adicione ao `~/.bashrc` ou `~/.zshrc`:**
```bash
alias expo-start="cd ~/financas-app && npx expo start"
alias expo-clear="cd ~/financas-app && npx expo start --clear"
alias expo-install="cd ~/financas-app && npm install"
```

**No Windows, crie um arquivo `financas.bat`:**
```bat
@echo off
cd C:\Users\SeuUsuario\financas-app
npx expo start
```

Depois é só digitar `expo-start` no terminal! 🎉

---

**Mantenha este arquivo à mão para consulta rápida!**

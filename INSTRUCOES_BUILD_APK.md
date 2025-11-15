# 🚀 INSTRUÇÕES PARA GERAR BUILD APK

## ⚠️ PROBLEMA RESOLVIDO

**Erro anterior**: Build crashava por incompatibilidade de plugins e variáveis Firebase ausentes.

**Correções aplicadas**:
- ✅ Removido plugin `expo-router` (app usa React Navigation)
- ✅ Removidas referências a assets inexistentes
- ✅ Simplificado `app.json`
- ✅ Corrigido `eas.json` com configurações corretas de Gradle
- ✅ Adicionado `expo-splash-screen` no App.js

---

## 📋 PASSO A PASSO OBRIGATÓRIO

### **PASSO 1: Configurar Variáveis do Firebase** ⚠️ **CRÍTICO**

As variáveis do Firebase **DEVEM** ser configuradas usando **EAS Secrets**.

#### **Como fazer:**

```bash
# 1. Copie suas chaves do arquivo .env local (se tiver)
# OU pegue do Firebase Console em:
# https://console.firebase.google.com/ > Configurações do Projeto

# 2. Execute os comandos abaixo substituindo pelos valores reais:

eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX" --type string

eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "seu-projeto.firebaseapp.com" --type string

eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "seu-projeto-id" --type string

eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "seu-projeto.appspot.com" --type string

eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "123456789" --type string

eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --value "1:123456789:android:xxxxx" --type string
```

#### **Verificar se foram criadas:**

```bash
eas secret:list
```

Você deve ver as 6 variáveis listadas.

---

### **PASSO 2: Gerar Build**

```bash
# Gerar build APK com profile preview
eas build --platform android --profile preview
```

**O que vai acontecer:**
1. EAS vai fazer upload do código
2. Build será executado nos servidores do Expo (~10-15 min)
3. Ao terminar, você receberá um link para baixar o APK

---

### **PASSO 3: Baixar e Instalar APK**

1. Acesse o link do build ou:
   ```bash
   eas build:list
   ```

2. Baixe o APK no seu celular Android

3. Instale (pode precisar permitir "Fontes Desconhecidas")

4. **Abra o app** ✅

---

## 🔍 SE O BUILD AINDA FALHAR

### **Erro: expo-module-gradle-plugin**

Se você ver este erro novamente:
```
Plugin [id: 'expo-module-gradle-plugin'] was not found
```

**Solução**: Adicione `expo-modules-core` explicitamente:

```bash
npm install expo-modules-core
git add package.json package-lock.json
git commit -m "add: expo-modules-core"
git push
```

Depois gere o build novamente.

---

### **Erro: Variáveis Firebase undefined**

Se o app ainda crashar ao abrir:

1. **Verifique se as secrets foram criadas**:
   ```bash
   eas secret:list
   ```

2. **Se não aparecerem as 6 variáveis**, crie novamente (PASSO 1)

3. **Gere um novo build** - variáveis só são incluídas em novos builds

---

### **Ver Logs do Build**

```bash
# Ver logs detalhados do último build
eas build:view

# Ver lista de builds
eas build:list
```

---

## 📊 CHECKLIST FINAL

Antes de gerar o build, confirme:

- [ ] Executei `eas secret:create` para as 6 variáveis Firebase
- [ ] Executei `eas secret:list` e vi as 6 variáveis
- [ ] Código foi commitado e pushed
- [ ] Executei `eas build --platform android --profile preview`
- [ ] Aguardei o build terminar (~15 min)
- [ ] Baixei o APK
- [ ] Instalei no Android
- [ ] App abre sem crashar ✅

---

## 🎯 ARQUIVOS MODIFICADOS (já commitados)

```
✅ App.js              → Splash screen corrigido
✅ app.json            → Removido expo-router, assets inexistentes
✅ eas.json            → Configuração simplificada e correta
✅ package.json        → expo-splash-screen adicionado
```

---

## 💡 DICAS

### **Desenvolvimento Local**

Para rodar em desenvolvimento (com .env local):

```bash
npm start
# OU
npx expo start
```

### **Builds Subsequentes**

Depois que configurar as secrets uma vez, para novos builds basta:

```bash
eas build --platform android --profile preview
```

As variáveis permanecem salvas no projeto!

---

## 🆘 PROBLEMAS COMUNS

### **1. "eas: command not found"**
```bash
npm install -g eas-cli
```

### **2. "Not logged in"**
```bash
eas login
```

### **3. Build demora muito**
- Normal! Pode levar 10-20 minutos
- Acompanhe em: https://expo.dev/accounts/[seu-user]/projects/financas-app/builds

### **4. App crasha imediatamente ao abrir**
- Verifique: `eas secret:list` (deve ter 6 variáveis)
- Gere NOVO build (variáveis antigas não afetam builds antigos)

---

## 📞 SUPORTE

Se o problema persistir após seguir TODOS os passos:

1. Execute: `eas build:view` e copie os logs
2. Verifique se as 6 secrets existem: `eas secret:list`
3. Confirme que está usando o APK mais recente

---

**✅ Configuração corrigida e pronta para build!**

**Próximo passo**: Execute o PASSO 1 (configurar secrets) e depois PASSO 2 (gerar build).

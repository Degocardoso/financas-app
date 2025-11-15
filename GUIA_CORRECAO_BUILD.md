# 🔧 GUIA DE CORREÇÃO - Build APK Crashando

## 🐛 PROBLEMA IDENTIFICADO

**Causa Raiz**: Variáveis de ambiente do Firebase não estão sendo incluídas no build APK.

O app crasha na linha 45 do `src/config/firebase.js` porque:
- Em desenvolvimento: `.env` existe localmente ✅
- No build APK: `.env` NÃO é incluído ❌
- Firebase detecta variáveis faltando e lança erro fatal 💥

---

## ✅ CORREÇÕES APLICADAS

### 1. Criado `app.json`
Arquivo de configuração do Expo com splash screen e ícones.

### 2. Criado `eas.json`
Configuração do EAS Build com suporte a variáveis de ambiente.

### 3. Corrigido `App.js`
- Adicionado `expo-splash-screen` para gerenciar splash corretamente
- Adicionado tratamento de erro no carregamento
- Agora o splash screen é escondido explicitamente

### 4. Instalado `expo-splash-screen`
Dependência necessária para o splash screen funcionar.

---

## 📋 PRÓXIMOS PASSOS (OBRIGATÓRIOS)

### **Passo 1: Configurar Variáveis de Ambiente no EAS**

Você tem **3 opções** para configurar as chaves do Firebase:

#### **Opção A: Usar EAS Secrets (Recomendado)**

```bash
# Copie as chaves do seu arquivo .env e execute:

eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "SUA_CHAVE_AQUI"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "SEU_VALOR_AQUI"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "SEU_VALOR_AQUI"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "SEU_VALOR_AQUI"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "SEU_VALOR_AQUI"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --value "SEU_VALOR_AQUI"
```

#### **Opção B: Editar eas.json Manualmente**

Abra `eas.json` e preencha os valores em `build.preview.env`:

```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  },
  "env": {
    "EXPO_PUBLIC_FIREBASE_API_KEY": "SUA_API_KEY_AQUI",
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN": "seu-projeto.firebaseapp.com",
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "seu-projeto-id",
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET": "seu-projeto.appspot.com",
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "123456789",
    "EXPO_PUBLIC_FIREBASE_APP_ID": "1:123456789:android:abc123"
  }
}
```

⚠️ **ATENÇÃO**: Se usar esta opção, **NÃO COMMITE** o eas.json com as chaves reais!

#### **Opção C: Usar arquivo .env no build**

Modifique `eas.json` para incluir o .env:

```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  },
  "channel": "preview",
  "env": {}
}
```

E crie um arquivo `.env.production`:
```
EXPO_PUBLIC_FIREBASE_API_KEY=sua_chave_aqui
# ... outras variáveis
```

---

### **Passo 2: Criar Assets (Ícones e Splash)**

O `app.json` referencia estes arquivos que precisam existir:

```bash
# Crie a pasta assets se não existir
mkdir -p assets

# Você precisa adicionar:
# - assets/icon.png (1024x1024)
# - assets/splash.png (qualquer resolução)
# - assets/adaptive-icon.png (1024x1024, Android)
# - assets/favicon.png (48x48, Web)
```

**Solução temporária** (se não tiver os assets agora):
```bash
# Usar ícone padrão do Expo
npx expo prebuild --clean
```

Ou edite `app.json` e remova as referências aos ícones temporariamente.

---

### **Passo 3: Commitar Mudanças**

```bash
git add App.js app.json eas.json package.json package-lock.json
git commit -m "fix: Adiciona configuração de build e corrige splash screen"
git push
```

---

### **Passo 4: Gerar Novo Build**

```bash
# Limpar cache (importante!)
eas build:configure

# Gerar novo build preview
eas build --platform android --profile preview
```

Aguarde o build (~10-15 minutos) e baixe o novo APK.

---

## 🧪 TESTAR O BUILD

1. Instale o novo APK no Android
2. Abra o app
3. **Deve funcionar agora!**

Se ainda crashar:
```bash
# Ver logs do build
eas build:view

# Ver logs específicos
adb logcat | grep -i expo
```

---

## 📊 CHECKLIST FINAL

- [ ] Variáveis de ambiente configuradas (Opção A, B ou C)
- [ ] Assets criados OU removidos do app.json
- [ ] Código commitado e pushed
- [ ] Novo build gerado com `eas build`
- [ ] APK baixado e testado
- [ ] App abre sem crashar ✅

---

## 🆘 SE AINDA CRASHAR

1. Verifique os logs:
   ```bash
   eas build:view --platform android
   ```

2. Teste localmente primeiro:
   ```bash
   npx expo start
   ```

3. Verifique se as variáveis estão definidas:
   ```bash
   eas secret:list
   ```

---

## 📝 RESUMO TÉCNICO

**Problema Original**:
- `firebase.js` valida variáveis de ambiente
- No build, `process.env.EXPO_PUBLIC_*` retorna `undefined`
- Validação lança erro e crasha o app

**Solução**:
- Configurar variáveis no EAS Secrets ou eas.json
- Corrigir splash screen no App.js
- Adicionar configuração adequada do Expo

**Arquivos Modificados**:
- ✅ App.js (splash screen)
- ✅ app.json (criado)
- ✅ eas.json (criado)
- ✅ package.json (expo-splash-screen adicionado)

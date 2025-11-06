// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ========================================
// CONFIGURAÇÃO DO FIREBASE
// ========================================
// As credenciais são carregadas de variáveis de ambiente.
// Para configurar:
// 1. Copie .env.example para .env
// 2. Preencha com suas credenciais do Firebase Console
// 3. Reinicie o servidor Expo (expo start)

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Validação: Verifica se todas as variáveis foram definidas
const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Firebase Configuration Error:');
  console.error('As seguintes variáveis de ambiente estão faltando:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('\nPara corrigir:');
  console.error('1. Copie .env.example para .env');
  console.error('2. Preencha com suas credenciais do Firebase');
  console.error('3. Reinicie o servidor Expo');

  throw new Error('Configuração do Firebase incompleta. Verifique o console para detalhes.');
}

// Inicializa o Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error.message);
  throw error;
}

// Exporta as instâncias que vamos usar
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

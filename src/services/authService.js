// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Registro com Email e Senha
export const registerWithEmail = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Cria o documento do perfil do usuário
    await setDoc(doc(db, 'users', user.uid), {
      name: name,
      email: email,
      createdAt: serverTimestamp()
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login com Email e Senha
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Logout
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login com Google (requer configuração adicional no Expo)
export const loginWithGoogle = async () => {
  // Nota: Para funcionar no React Native, você precisará configurar
  // o expo-auth-session ou @react-native-google-signin/google-signin
  // Por enquanto, vamos deixar como placeholder
  console.log('Login com Google requer configuração adicional no Expo');
  return { success: false, error: 'Não implementado ainda' };
};

// Reautenticar usuário com senha (para operações sensíveis)
export const reauthenticateUser = async (password) => {
  try {
    const user = auth.currentUser;

    if (!user || !user.email) {
      throw new Error('Usuário não autenticado');
    }

    // Criar credencial com email e senha
    const credential = EmailAuthProvider.credential(user.email, password);

    // Reautenticar
    await reauthenticateWithCredential(user, credential);

    return { success: true };
  } catch (error) {
    console.error('Erro ao reautenticar:', error);
    return { success: false, error: error.message };
  }
};

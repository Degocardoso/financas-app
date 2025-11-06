// src/services/transactionService.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Adiciona uma transação
export const addTransaction = async (transactionData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');
    
    const transactionsRef = collection(db, `users/${userId}/transactions`);
    
    await addDoc(transactionsRef, {
      ...transactionData,
      createdAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Busca todas as transações do usuário
export const getTransactions = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');
    
    const transactionsRef = collection(db, `users/${userId}/transactions`);
    const q = query(transactionsRef, orderBy('date', 'desc'));
    
    const snapshot = await getDocs(q);
    const transactions = [];
    
    snapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, transactions };
  } catch (error) {
    return { success: false, error: error.message, transactions: [] };
  }
};

// Verifica se uma transação já existe (por hash)
export const transactionExists = async (importHash) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');
    
    const transactionsRef = collection(db, `users/${userId}/transactions`);
    const q = query(transactionsRef, where('importHash', '==', importHash));
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Erro ao verificar duplicata:', error);
    return false;
  }
};

// Adiciona uma transação recorrente
export const addRecurringTransaction = async (recurringData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');
    
    const recurringRef = collection(db, `users/${userId}/recurringTransactions`);
    
    await addDoc(recurringRef, {
      ...recurringData,
      createdAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Busca todas as transações recorrentes
export const getRecurringTransactions = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');
    
    const recurringRef = collection(db, `users/${userId}/recurringTransactions`);
    const snapshot = await getDocs(recurringRef);
    
    const recurring = [];
    snapshot.forEach(doc => {
      recurring.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, recurring };
  } catch (error) {
    return { success: false, error: error.message, recurring: [] };
  }
};

// Deleta uma transação recorrente
export const deleteRecurringTransaction = async (recurringId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');
    
    await deleteDoc(doc(db, `users/${userId}/recurringTransactions`, recurringId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Calcula o saldo atual baseado nas transações
export const getCurrentBalance = async () => {
  try {
    const result = await getTransactions();
    if (!result.success) return 0;
    
    let balance = 0;
    result.transactions.forEach(transaction => {
      balance += transaction.amount;
    });
    
    return balance;
  } catch (error) {
    console.error('Erro ao calcular saldo:', error);
    return 0;
  }
};

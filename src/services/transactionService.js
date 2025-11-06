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
  doc,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// ========================================
// CONSTANTES DE VALIDAÇÃO
// ========================================
const LIMITS = {
  DESCRIPTION_MAX_LENGTH: 500,
  CATEGORY_MAX_LENGTH: 100,
  AMOUNT_MIN: -1000000000,  // -1 bilhão
  AMOUNT_MAX: 1000000000,   // +1 bilhão
  DAY_OF_MONTH_MIN: 1,
  DAY_OF_MONTH_MAX: 31
};

const VALID_TRANSACTION_TYPES = ['income', 'expense'];

// ========================================
// FUNÇÕES AUXILIARES DE VALIDAÇÃO
// ========================================

/**
 * Valida e sanitiza uma string
 * @param {string} value - Valor a ser validado
 * @param {number} maxLength - Tamanho máximo permitido
 * @param {string} fieldName - Nome do campo (para mensagens de erro)
 * @returns {string} String sanitizada
 */
const validateString = (value, maxLength, fieldName) => {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} deve ser uma string`);
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new Error(`${fieldName} não pode ser vazio`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} deve ter no máximo ${maxLength} caracteres`);
  }

  return trimmed;
};

/**
 * Valida um valor numérico
 * @param {number} value - Valor a ser validado
 * @param {string} fieldName - Nome do campo (para mensagens de erro)
 * @returns {number} Valor validado
 */
const validateAmount = (value, fieldName = 'Valor') => {
  const num = Number(value);

  if (isNaN(num)) {
    throw new Error(`${fieldName} deve ser um número válido`);
  }

  if (num < LIMITS.AMOUNT_MIN || num > LIMITS.AMOUNT_MAX) {
    throw new Error(
      `${fieldName} deve estar entre R$ ${LIMITS.AMOUNT_MIN.toLocaleString()} ` +
      `e R$ ${LIMITS.AMOUNT_MAX.toLocaleString()}`
    );
  }

  return num;
};

/**
 * Valida um tipo de transação
 * @param {string} type - Tipo da transação
 * @returns {string} Tipo validado
 */
const validateTransactionType = (type) => {
  if (!VALID_TRANSACTION_TYPES.includes(type)) {
    throw new Error(
      `Tipo de transação inválido. Use: ${VALID_TRANSACTION_TYPES.join(' ou ')}`
    );
  }
  return type;
};

/**
 * Valida uma data e converte para Timestamp do Firestore
 * @param {Date|string|Timestamp} date - Data a ser validada
 * @returns {Timestamp} Timestamp do Firestore
 */
const validateDate = (date) => {
  if (date instanceof Timestamp) {
    return date;
  }

  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    throw new Error('Data inválida');
  }

  if (isNaN(dateObj.getTime())) {
    throw new Error('Data inválida');
  }

  return Timestamp.fromDate(dateObj);
};

/**
 * Valida um dia do mês (1-31)
 * @param {number} day - Dia do mês
 * @returns {number} Dia validado
 */
const validateDayOfMonth = (day) => {
  const dayNum = Number(day);

  if (isNaN(dayNum) || !Number.isInteger(dayNum)) {
    throw new Error('Dia do mês deve ser um número inteiro');
  }

  if (dayNum < LIMITS.DAY_OF_MONTH_MIN || dayNum > LIMITS.DAY_OF_MONTH_MAX) {
    throw new Error(`Dia do mês deve estar entre ${LIMITS.DAY_OF_MONTH_MIN} e ${LIMITS.DAY_OF_MONTH_MAX}`);
  }

  return dayNum;
};

// ========================================
// FUNÇÕES DE TRANSAÇÕES
// ========================================

/**
 * Adiciona uma nova transação com validação completa
 * @param {Object} transactionData - Dados da transação
 * @param {Date|string|Timestamp} transactionData.date - Data da transação
 * @param {string} transactionData.description - Descrição
 * @param {number} transactionData.amount - Valor
 * @param {string} transactionData.type - Tipo (income ou expense)
 * @param {string} [transactionData.category] - Categoria (opcional)
 * @param {string} [transactionData.importHash] - Hash para de-duplicação (opcional)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const addTransaction = async (transactionData) => {
  try {
    // Validação de autenticação
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    // Validação dos campos obrigatórios
    if (!transactionData.date) throw new Error('Data é obrigatória');
    if (!transactionData.description) throw new Error('Descrição é obrigatória');
    if (transactionData.amount === undefined || transactionData.amount === null) {
      throw new Error('Valor é obrigatório');
    }
    if (!transactionData.type) throw new Error('Tipo é obrigatório');

    // Validação e sanitização dos dados
    const validatedData = {
      date: validateDate(transactionData.date),
      description: validateString(
        transactionData.description,
        LIMITS.DESCRIPTION_MAX_LENGTH,
        'Descrição'
      ),
      amount: validateAmount(transactionData.amount, 'Valor'),
      type: validateTransactionType(transactionData.type),
      createdAt: serverTimestamp()
    };

    // Campos opcionais
    if (transactionData.category) {
      validatedData.category = validateString(
        transactionData.category,
        LIMITS.CATEGORY_MAX_LENGTH,
        'Categoria'
      );
    }

    if (transactionData.importHash) {
      validatedData.importHash = validateString(
        transactionData.importHash,
        100,
        'Hash de importação'
      );
    }

    // Adiciona ao Firestore
    const transactionsRef = collection(db, `users/${userId}/transactions`);
    await addDoc(transactionsRef, validatedData);

    return { success: true };
  } catch (error) {
    console.error('Erro ao adicionar transação:', error);
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

// ========================================
// FUNÇÕES DE TRANSAÇÕES RECORRENTES
// ========================================

/**
 * Adiciona uma nova transação recorrente com validação completa
 * @param {Object} recurringData - Dados da transação recorrente
 * @param {string} recurringData.description - Descrição
 * @param {number} recurringData.amount - Valor
 * @param {number} recurringData.dayOfMonth - Dia do mês (1-31)
 * @param {string} recurringData.type - Tipo (income ou expense)
 * @param {Date|string} [recurringData.startDate] - Data de início (opcional)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const addRecurringTransaction = async (recurringData) => {
  try {
    // Validação de autenticação
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    // Validação dos campos obrigatórios
    if (!recurringData.description) throw new Error('Descrição é obrigatória');
    if (recurringData.amount === undefined || recurringData.amount === null) {
      throw new Error('Valor é obrigatório');
    }
    if (recurringData.dayOfMonth === undefined || recurringData.dayOfMonth === null) {
      throw new Error('Dia do mês é obrigatório');
    }
    if (!recurringData.type) throw new Error('Tipo é obrigatório');

    // Validação e sanitização dos dados
    const validatedData = {
      description: validateString(
        recurringData.description,
        LIMITS.DESCRIPTION_MAX_LENGTH,
        'Descrição'
      ),
      amount: validateAmount(recurringData.amount, 'Valor'),
      dayOfMonth: validateDayOfMonth(recurringData.dayOfMonth),
      type: validateTransactionType(recurringData.type),
      createdAt: serverTimestamp()
    };

    // Campo opcional: startDate
    if (recurringData.startDate) {
      validatedData.startDate = validateDate(recurringData.startDate);
    }

    // Adiciona ao Firestore
    const recurringRef = collection(db, `users/${userId}/recurringTransactions`);
    await addDoc(recurringRef, validatedData);

    return { success: true };
  } catch (error) {
    console.error('Erro ao adicionar transação recorrente:', error);
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

/**
 * Deleta uma transação recorrente
 * @param {string} recurringId - ID da transação recorrente
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteRecurringTransaction = async (recurringId) => {
  try {
    // Validação de autenticação
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    // Validação do ID
    if (!recurringId || typeof recurringId !== 'string' || recurringId.trim().length === 0) {
      throw new Error('ID da transação recorrente inválido');
    }

    // Deleta do Firestore
    // Nota: As regras de segurança garantem que só podemos deletar do nosso próprio userId
    await deleteDoc(doc(db, `users/${userId}/recurringTransactions`, recurringId));

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar transação recorrente:', error);
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

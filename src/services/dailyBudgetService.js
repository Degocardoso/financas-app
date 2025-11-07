// src/services/dailyBudgetService.js
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
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { generateTransactionHash } from '../utils/deduplication';

// ========================================
// SERVIÇO DE ORÇAMENTOS DIÁRIOS
// ========================================

/**
 * Define um orçamento diário
 * @param {Object} budgetData - Dados do orçamento
 * @param {number} budgetData.amount - Valor do orçamento diário
 * @param {Date|string|Timestamp} budgetData.startDate - Data de início
 * @param {Date|string|Timestamp} [budgetData.endDate] - Data de fim (opcional)
 * @returns {Promise<{success: boolean, error?: string, id?: string}>}
 */
export const setDailyBudget = async (budgetData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    // Validação dos campos obrigatórios
    if (budgetData.amount === undefined || budgetData.amount === null) {
      throw new Error('Valor do orçamento é obrigatório');
    }
    if (!budgetData.startDate) throw new Error('Data de início é obrigatória');

    // Validar que o valor é positivo
    const amount = Number(budgetData.amount);
    if (amount <= 0) {
      throw new Error('O valor do orçamento deve ser positivo');
    }

    // Construir objeto validado
    const validatedData = {
      amount: amount,
      startDate: budgetData.startDate instanceof Timestamp
        ? budgetData.startDate
        : Timestamp.fromDate(new Date(budgetData.startDate)),
      createdAt: serverTimestamp()
    };

    // Adicionar data de fim se fornecida
    if (budgetData.endDate) {
      validatedData.endDate = budgetData.endDate instanceof Timestamp
        ? budgetData.endDate
        : Timestamp.fromDate(new Date(budgetData.endDate));
    }

    const budgetsRef = collection(db, `users/${userId}/dailyBudgets`);
    const docRef = await addDoc(budgetsRef, validatedData);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao definir orçamento diário:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Busca todos os orçamentos diários do usuário
 * @returns {Promise<{success: boolean, budgets: Array, error?: string}>}
 */
export const getDailyBudgets = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    const budgetsRef = collection(db, `users/${userId}/dailyBudgets`);
    const q = query(budgetsRef, orderBy('startDate', 'desc'));

    const snapshot = await getDocs(q);
    const budgets = [];

    snapshot.forEach(doc => {
      budgets.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, budgets };
  } catch (error) {
    console.error('Erro ao buscar orçamentos diários:', error);
    return { success: false, error: error.message, budgets: [] };
  }
};

/**
 * Busca o orçamento ativo para uma data específica
 * @param {Date} date - Data para buscar o orçamento
 * @returns {Promise<{success: boolean, budget?: Object, error?: string}>}
 */
export const getActiveBudgetForDate = async (date) => {
  try {
    const result = await getDailyBudgets();
    if (!result.success) return result;

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Encontrar orçamento ativo para a data
    const activeBudget = result.budgets.find(budget => {
      const startDate = budget.startDate.toDate();
      startDate.setHours(0, 0, 0, 0);

      const endDate = budget.endDate
        ? budget.endDate.toDate()
        : new Date(2099, 11, 31); // Data muito futura se não tiver fim
      endDate.setHours(23, 59, 59, 999);

      return targetDate >= startDate && targetDate <= endDate;
    });

    if (!activeBudget) {
      return { success: false, error: 'Nenhum orçamento ativo para esta data' };
    }

    return { success: true, budget: activeBudget };
  } catch (error) {
    console.error('Erro ao buscar orçamento ativo:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Atualiza um orçamento diário
 * @param {string} budgetId - ID do orçamento
 * @param {Object} updateData - Dados a serem atualizados
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateDailyBudget = async (budgetId, updateData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    if (!budgetId) throw new Error('ID do orçamento é obrigatório');

    const validatedData = {};

    if (updateData.amount !== undefined) {
      const amount = Number(updateData.amount);
      if (amount <= 0) {
        throw new Error('O valor do orçamento deve ser positivo');
      }
      validatedData.amount = amount;
    }

    if (updateData.startDate !== undefined) {
      validatedData.startDate = updateData.startDate instanceof Timestamp
        ? updateData.startDate
        : Timestamp.fromDate(new Date(updateData.startDate));
    }

    if (updateData.endDate !== undefined) {
      validatedData.endDate = updateData.endDate instanceof Timestamp
        ? updateData.endDate
        : Timestamp.fromDate(new Date(updateData.endDate));
    }

    validatedData.updatedAt = serverTimestamp();

    const budgetRef = doc(db, `users/${userId}/dailyBudgets`, budgetId);
    await updateDoc(budgetRef, validatedData);

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar orçamento diário:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Deleta um orçamento diário
 * @param {string} budgetId - ID do orçamento
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteDailyBudget = async (budgetId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    if (!budgetId || typeof budgetId !== 'string' || budgetId.trim().length === 0) {
      throw new Error('ID do orçamento inválido');
    }

    await deleteDoc(doc(db, `users/${userId}/dailyBudgets`, budgetId));
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar orçamento diário:', error);
    return { success: false, error: error.message };
  }
};

// ========================================
// SERVIÇO DE GASTOS DIÁRIOS REAIS
// ========================================

/**
 * Adiciona um gasto diário real
 * @param {Object} expenseData - Dados do gasto
 * @param {Date|string|Timestamp} expenseData.date - Data do gasto
 * @param {number} expenseData.amount - Valor gasto
 * @param {string} [expenseData.description] - Descrição (opcional)
 * @param {string} [expenseData.importHash] - Hash para de-duplicação (opcional)
 * @returns {Promise<{success: boolean, error?: string, id?: string}>}
 */
export const addDailyExpense = async (expenseData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    // Validação dos campos obrigatórios
    if (!expenseData.date) throw new Error('Data é obrigatória');
    if (expenseData.amount === undefined || expenseData.amount === null) {
      throw new Error('Valor é obrigatório');
    }

    // Validar que o valor é positivo
    const amount = Number(expenseData.amount);
    if (amount <= 0) {
      throw new Error('O valor do gasto deve ser positivo');
    }

    // Construir objeto validado
    const validatedData = {
      date: expenseData.date instanceof Timestamp
        ? expenseData.date
        : Timestamp.fromDate(new Date(expenseData.date)),
      amount: amount,
      createdAt: serverTimestamp()
    };

    // Campos opcionais
    if (expenseData.description) {
      validatedData.description = expenseData.description.trim();
    }

    if (expenseData.importHash) {
      validatedData.importHash = expenseData.importHash;
    } else {
      // Gerar hash para de-duplicação
      validatedData.importHash = generateTransactionHash({
        date: validatedData.date.toDate().toISOString(),
        description: validatedData.description || 'Gasto diário',
        amount: validatedData.amount
      });
    }

    const expensesRef = collection(db, `users/${userId}/dailyExpenses`);
    const docRef = await addDoc(expensesRef, validatedData);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao adicionar gasto diário:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Busca todos os gastos diários do usuário
 * @returns {Promise<{success: boolean, expenses: Array, error?: string}>}
 */
export const getDailyExpenses = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    const expensesRef = collection(db, `users/${userId}/dailyExpenses`);
    const q = query(expensesRef, orderBy('date', 'desc'));

    const snapshot = await getDocs(q);
    const expenses = [];

    snapshot.forEach(doc => {
      expenses.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, expenses };
  } catch (error) {
    console.error('Erro ao buscar gastos diários:', error);
    return { success: false, error: error.message, expenses: [] };
  }
};

/**
 * Busca gastos por data específica
 * @param {Date} date - Data para buscar gastos
 * @returns {Promise<{success: boolean, expenses: Array, total: number, error?: string}>}
 */
export const getExpensesByDate = async (date) => {
  try {
    const result = await getDailyExpenses();
    if (!result.success) return { ...result, total: 0 };

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const filtered = result.expenses.filter(expense => {
      const expenseDate = expense.date.toDate();
      expenseDate.setHours(0, 0, 0, 0);
      return expenseDate.getTime() === targetDate.getTime();
    });

    const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);

    return { success: true, expenses: filtered, total };
  } catch (error) {
    console.error('Erro ao buscar gastos por data:', error);
    return { success: false, error: error.message, expenses: [], total: 0 };
  }
};

/**
 * Verifica se um gasto já existe (por hash)
 * @param {string} importHash - Hash do gasto
 * @returns {Promise<boolean>}
 */
export const dailyExpenseExists = async (importHash) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    const expensesRef = collection(db, `users/${userId}/dailyExpenses`);
    const q = query(expensesRef, where('importHash', '==', importHash));

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Erro ao verificar duplicata de gasto diário:', error);
    return false;
  }
};

/**
 * Deleta um gasto diário
 * @param {string} expenseId - ID do gasto
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteDailyExpense = async (expenseId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    if (!expenseId || typeof expenseId !== 'string' || expenseId.trim().length === 0) {
      throw new Error('ID do gasto inválido');
    }

    await deleteDoc(doc(db, `users/${userId}/dailyExpenses`, expenseId));
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar gasto diário:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Compara orçamento vs gasto real para uma data
 * @param {Date} date - Data para comparar
 * @returns {Promise<{success: boolean, budget?: number, spent: number, remaining: number, error?: string}>}
 */
export const compareBudgetVsSpent = async (date) => {
  try {
    // Buscar orçamento ativo
    const budgetResult = await getActiveBudgetForDate(date);

    // Buscar gastos da data
    const expensesResult = await getExpensesByDate(date);
    if (!expensesResult.success) {
      return { success: false, error: expensesResult.error, spent: 0, remaining: 0 };
    }

    const budget = budgetResult.success ? budgetResult.budget.amount : 0;
    const spent = expensesResult.total;
    const remaining = budget - spent;

    return {
      success: true,
      budget: budgetResult.success ? budget : undefined,
      spent,
      remaining,
      hasExceeded: remaining < 0
    };
  } catch (error) {
    console.error('Erro ao comparar orçamento vs gasto:', error);
    return { success: false, error: error.message, spent: 0, remaining: 0 };
  }
};

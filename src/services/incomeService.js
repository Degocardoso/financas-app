// src/services/incomeService.js
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// ========================================
// CONSTANTES
// ========================================
const VALID_INCOME_TYPES = ['single', 'recurring'];
const VALID_FREQUENCIES = ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'];

// ========================================
// FUNÇÕES DE VALIDAÇÃO
// ========================================

/**
 * Valida o tipo de receita
 */
const validateIncomeType = (type) => {
  if (!VALID_INCOME_TYPES.includes(type)) {
    throw new Error(
      `Tipo de receita inválido. Use: ${VALID_INCOME_TYPES.join(' ou ')}`
    );
  }
  return type;
};

/**
 * Valida a frequência de receita recorrente
 */
const validateFrequency = (frequency) => {
  if (!VALID_FREQUENCIES.includes(frequency)) {
    throw new Error(
      `Frequência inválida. Use: ${VALID_FREQUENCIES.join(', ')}`
    );
  }
  return frequency;
};

// ========================================
// FUNÇÕES DE RECEITAS
// ========================================

/**
 * Adiciona uma nova receita (única ou recorrente)
 * @param {Object} incomeData - Dados da receita
 * @param {string} incomeData.description - Descrição da receita
 * @param {number} incomeData.amount - Valor (deve ser positivo)
 * @param {string} incomeData.incomeType - Tipo: 'single' ou 'recurring'
 * @param {string} [incomeData.frequency] - Frequência (obrigatório se recurring): 'daily', 'weekly', 'biweekly', 'monthly', 'yearly'
 * @param {Date|string|Timestamp} [incomeData.date] - Data da receita única
 * @param {number} [incomeData.dayOfMonth] - Dia do mês (para receitas mensais recorrentes)
 * @returns {Promise<{success: boolean, error?: string, id?: string}>}
 */
export const addIncome = async (incomeData) => {
  try {
    // Validação de autenticação
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    // Validação dos campos obrigatórios
    if (!incomeData.description) throw new Error('Descrição é obrigatória');
    if (incomeData.amount === undefined || incomeData.amount === null) {
      throw new Error('Valor é obrigatório');
    }
    if (!incomeData.incomeType) throw new Error('Tipo de receita é obrigatório');

    // Validar que o valor é positivo
    if (incomeData.amount <= 0) {
      throw new Error('O valor da receita deve ser positivo');
    }

    // Validar tipo de receita
    const incomeType = validateIncomeType(incomeData.incomeType);

    // Validar dados específicos por tipo
    if (incomeType === 'recurring') {
      if (!incomeData.frequency) {
        throw new Error('Frequência é obrigatória para receitas recorrentes');
      }
      validateFrequency(incomeData.frequency);
    }

    // Construir objeto validado
    const validatedData = {
      description: incomeData.description.trim(),
      amount: Number(incomeData.amount),
      incomeType: incomeType,
      createdAt: serverTimestamp()
    };

    // Adicionar campos opcionais
    if (incomeData.frequency) {
      validatedData.frequency = validateFrequency(incomeData.frequency);
    }

    if (incomeData.date) {
      validatedData.date = incomeData.date instanceof Timestamp
        ? incomeData.date
        : Timestamp.fromDate(new Date(incomeData.date));
    }

    if (incomeData.dayOfMonth) {
      const day = Number(incomeData.dayOfMonth);
      if (day < 1 || day > 31) {
        throw new Error('Dia do mês deve estar entre 1 e 31');
      }
      validatedData.dayOfMonth = day;
    }

    // Adicionar ao Firestore
    const incomesRef = collection(db, `users/${userId}/incomes`);
    const docRef = await addDoc(incomesRef, validatedData);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao adicionar receita:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Busca todas as receitas do usuário
 * @returns {Promise<{success: boolean, incomes: Array, error?: string}>}
 */
export const getIncomes = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    const incomesRef = collection(db, `users/${userId}/incomes`);
    const q = query(incomesRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    const incomes = [];

    snapshot.forEach(doc => {
      incomes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, incomes };
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    return { success: false, error: error.message, incomes: [] };
  }
};

/**
 * Busca receitas por tipo
 * @param {string} incomeType - 'single' ou 'recurring'
 * @returns {Promise<{success: boolean, incomes: Array, error?: string}>}
 */
export const getIncomesByType = async (incomeType) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    validateIncomeType(incomeType);

    const result = await getIncomes();
    if (!result.success) return result;

    const filtered = result.incomes.filter(
      income => income.incomeType === incomeType
    );

    return { success: true, incomes: filtered };
  } catch (error) {
    console.error('Erro ao buscar receitas por tipo:', error);
    return { success: false, error: error.message, incomes: [] };
  }
};

/**
 * Atualiza uma receita existente
 * @param {string} incomeId - ID da receita
 * @param {Object} updateData - Dados a serem atualizados
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateIncome = async (incomeId, updateData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    if (!incomeId) throw new Error('ID da receita é obrigatório');

    // Validar campos se estiverem presentes
    const validatedData = {};

    if (updateData.description !== undefined) {
      validatedData.description = updateData.description.trim();
    }

    if (updateData.amount !== undefined) {
      const amount = Number(updateData.amount);
      if (amount <= 0) {
        throw new Error('O valor da receita deve ser positivo');
      }
      validatedData.amount = amount;
    }

    if (updateData.incomeType !== undefined) {
      validatedData.incomeType = validateIncomeType(updateData.incomeType);
    }

    if (updateData.frequency !== undefined) {
      validatedData.frequency = validateFrequency(updateData.frequency);
    }

    if (updateData.date !== undefined) {
      validatedData.date = updateData.date instanceof Timestamp
        ? updateData.date
        : Timestamp.fromDate(new Date(updateData.date));
    }

    if (updateData.dayOfMonth !== undefined) {
      const day = Number(updateData.dayOfMonth);
      if (day < 1 || day > 31) {
        throw new Error('Dia do mês deve estar entre 1 e 31');
      }
      validatedData.dayOfMonth = day;
    }

    validatedData.updatedAt = serverTimestamp();

    const incomeRef = doc(db, `users/${userId}/incomes`, incomeId);
    await updateDoc(incomeRef, validatedData);

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Deleta uma receita
 * @param {string} incomeId - ID da receita
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteIncome = async (incomeId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    if (!incomeId || typeof incomeId !== 'string' || incomeId.trim().length === 0) {
      throw new Error('ID da receita inválido');
    }

    await deleteDoc(doc(db, `users/${userId}/incomes`, incomeId));
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar receita:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calcula o total de receitas para um período
 * @param {Date} startDate - Data inicial
 * @param {Date} endDate - Data final
 * @returns {Promise<{success: boolean, total: number, error?: string}>}
 */
export const calculateTotalIncome = async (startDate, endDate) => {
  try {
    const result = await getIncomes();
    if (!result.success) return { success: false, total: 0, error: result.error };

    let total = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);

    result.incomes.forEach(income => {
      if (income.incomeType === 'single' && income.date) {
        const incomeDate = income.date.toDate();
        if (incomeDate >= start && incomeDate <= end) {
          total += income.amount;
        }
      } else if (income.incomeType === 'recurring') {
        // Para receitas recorrentes, calcular baseado na frequência
        // Aqui simplesmente incluímos no total (lógica pode ser refinada)
        total += income.amount;
      }
    });

    return { success: true, total };
  } catch (error) {
    console.error('Erro ao calcular total de receitas:', error);
    return { success: false, total: 0, error: error.message };
  }
};

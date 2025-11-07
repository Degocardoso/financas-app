// src/services/balanceService.js
// SERVIÇO UNIFICADO DE SALDO
// Integra dados de TODAS as fontes: transactions, incomes, dailyExpenses

import { getTransactions } from './transactionService';
import { getIncomes } from './incomeService';
import { getDailyExpenses } from './dailyBudgetService';

/**
 * Calcula o saldo REAL considerando TODAS as fontes de dados
 * @returns {Promise<{success: boolean, balance: number, breakdown: Object, error?: string}>}
 */
export const getUnifiedBalance = async () => {
  try {
    let totalBalance = 0;
    const breakdown = {
      fromTransactions: 0,
      fromIncomes: 0,
      fromDailyExpenses: 0
    };

    // 1. Somar transações antigas (importadas + manuais)
    const transactionsResult = await getTransactions();
    if (transactionsResult.success) {
      transactionsResult.transactions.forEach(transaction => {
        totalBalance += transaction.amount;
        breakdown.fromTransactions += transaction.amount;
      });
    }

    // 2. Somar receitas ÚNICAS já ocorridas (não recorrentes)
    const incomesResult = await getIncomes();
    if (incomesResult.success) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      incomesResult.incomes.forEach(income => {
        if (income.incomeType === 'single' && income.date) {
          const incomeDate = income.date.toDate();
          // Só somar se já ocorreu
          if (incomeDate <= today) {
            totalBalance += income.amount;
            breakdown.fromIncomes += income.amount;
          }
        }
        // Receitas recorrentes NÃO entram no saldo atual
        // Elas são usadas apenas para projeções futuras
      });
    }

    // 3. Subtrair despesas diárias reais já registradas
    const expensesResult = await getDailyExpenses();
    if (expensesResult.success) {
      expensesResult.expenses.forEach(expense => {
        totalBalance -= expense.amount;
        breakdown.fromDailyExpenses -= expense.amount;
      });
    }

    return {
      success: true,
      balance: parseFloat(totalBalance.toFixed(2)),
      breakdown: {
        fromTransactions: parseFloat(breakdown.fromTransactions.toFixed(2)),
        fromIncomes: parseFloat(breakdown.fromIncomes.toFixed(2)),
        fromDailyExpenses: parseFloat(breakdown.fromDailyExpenses.toFixed(2))
      }
    };
  } catch (error) {
    console.error('Erro ao calcular saldo unificado:', error);
    return {
      success: false,
      balance: 0,
      breakdown: {
        fromTransactions: 0,
        fromIncomes: 0,
        fromDailyExpenses: 0
      },
      error: error.message
    };
  }
};

/**
 * Calcula o total de receitas (únicas + mensalizado das recorrentes)
 * @returns {Promise<{success: boolean, total: number, details: Object, error?: string}>}
 */
export const getTotalIncomes = async () => {
  try {
    const result = await getIncomes();
    if (!result.success) {
      return { success: false, total: 0, details: {}, error: result.error };
    }

    let totalSingle = 0;
    let totalRecurring = 0;
    let monthlyProjection = 0;

    result.incomes.forEach(income => {
      if (income.incomeType === 'single') {
        totalSingle += income.amount;
      } else if (income.incomeType === 'recurring') {
        totalRecurring += income.amount;

        // Projetar valor mensal
        if (income.frequency === 'monthly') {
          monthlyProjection += income.amount;
        } else if (income.frequency === 'weekly') {
          monthlyProjection += income.amount * 4;
        } else if (income.frequency === 'biweekly') {
          monthlyProjection += income.amount * 2;
        } else if (income.frequency === 'daily') {
          monthlyProjection += income.amount * 30;
        } else if (income.frequency === 'yearly') {
          monthlyProjection += income.amount / 12;
        }
      }
    });

    return {
      success: true,
      total: parseFloat((totalSingle + totalRecurring).toFixed(2)),
      details: {
        single: parseFloat(totalSingle.toFixed(2)),
        recurring: parseFloat(totalRecurring.toFixed(2)),
        monthlyProjection: parseFloat(monthlyProjection.toFixed(2))
      }
    };
  } catch (error) {
    console.error('Erro ao calcular total de receitas:', error);
    return {
      success: false,
      total: 0,
      details: {},
      error: error.message
    };
  }
};

/**
 * Calcula o total de despesas do mês atual
 * @returns {Promise<{success: boolean, total: number, error?: string}>}
 */
export const getCurrentMonthExpenses = async () => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);

    let total = 0;

    // Despesas diárias do mês
    const expensesResult = await getDailyExpenses();
    if (expensesResult.success) {
      expensesResult.expenses.forEach(expense => {
        const expenseDate = expense.date.toDate();
        if (expenseDate >= firstDay && expenseDate <= lastDay) {
          total += expense.amount;
        }
      });
    }

    // Transações de despesa do mês
    const transactionsResult = await getTransactions();
    if (transactionsResult.success) {
      transactionsResult.transactions.forEach(transaction => {
        if (transaction.amount < 0 && transaction.date) {
          const transactionDate = transaction.date.toDate();
          if (transactionDate >= firstDay && transactionDate <= lastDay) {
            total += Math.abs(transaction.amount);
          }
        }
      });
    }

    return {
      success: true,
      total: parseFloat(total.toFixed(2))
    };
  } catch (error) {
    console.error('Erro ao calcular despesas do mês:', error);
    return {
      success: false,
      total: 0,
      error: error.message
    };
  }
};

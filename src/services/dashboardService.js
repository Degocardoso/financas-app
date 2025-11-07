// src/services/dashboardService.js
import { getIncomes } from './incomeService';
import { getTransactions } from './transactionService';
import { getRecurringTransactions } from './transactionService';
import { getDailyExpenses, getDailyBudgets } from './dailyBudgetService';

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Calcula o número de dias em um mês
 */
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Formata data para string YYYY-MM-DD
 */
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Adiciona dias a uma data
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Adiciona meses a uma data
 */
const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// ========================================
// GRÁFICO: PREVISÃO MENSAL (Receitas vs Despesas)
// ========================================

/**
 * Calcula a previsão mensal de receitas vs despesas
 * @param {number} year - Ano
 * @param {number} month - Mês (0-11)
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const getMonthlyForecast = async (year, month) => {
  try {
    // Buscar todas as receitas
    const incomesResult = await getIncomes();
    if (!incomesResult.success) {
      return { success: false, error: incomesResult.error };
    }

    // Buscar todas as transações recorrentes (despesas)
    const recurringResult = await getRecurringTransactions();
    if (!recurringResult.success) {
      return { success: false, error: recurringResult.error };
    }

    // Buscar transações únicas do mês
    const transactionsResult = await getTransactions();
    if (!transactionsResult.success) {
      return { success: false, error: transactionsResult.error };
    }

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Calcular receitas previstas
    let totalIncome = 0;

    incomesResult.incomes.forEach(income => {
      if (income.incomeType === 'single' && income.date) {
        const incomeDate = income.date.toDate();
        if (incomeDate >= firstDay && incomeDate <= lastDay) {
          totalIncome += income.amount;
        }
      } else if (income.incomeType === 'recurring') {
        // Receita recorrente: incluir no mês se aplicável
        if (income.frequency === 'monthly') {
          totalIncome += income.amount;
        } else if (income.frequency === 'weekly') {
          // ~4 semanas por mês
          totalIncome += income.amount * 4;
        } else if (income.frequency === 'biweekly') {
          // 2 vezes por mês
          totalIncome += income.amount * 2;
        } else if (income.frequency === 'daily') {
          const daysInMonth = getDaysInMonth(year, month);
          totalIncome += income.amount * daysInMonth;
        } else if (income.frequency === 'yearly') {
          // Dividir por 12 meses
          totalIncome += income.amount / 12;
        }
      }
    });

    // Calcular despesas previstas
    let totalExpenses = 0;

    // Despesas recorrentes
    recurringResult.recurring.forEach(recurring => {
      if (recurring.type === 'expense') {
        totalExpenses += Math.abs(recurring.amount);
      }
    });

    // Despesas únicas do mês
    transactionsResult.transactions.forEach(transaction => {
      if (transaction.type === 'expense' && transaction.date) {
        const transactionDate = transaction.date.toDate();
        if (transactionDate >= firstDay && transactionDate <= lastDay) {
          totalExpenses += Math.abs(transaction.amount);
        }
      }
    });

    // Calcular saldo previsto
    const balance = totalIncome - totalExpenses;

    return {
      success: true,
      data: {
        month: month + 1,
        year,
        totalIncome,
        totalExpenses,
        balance,
        isPositive: balance >= 0
      }
    };
  } catch (error) {
    console.error('Erro ao calcular previsão mensal:', error);
    return { success: false, error: error.message };
  }
};

// ========================================
// GRÁFICO: PROJEÇÃO DIÁRIA (Fluxo de Caixa)
// ========================================

/**
 * Calcula a projeção de saldo dia a dia
 * @param {number} months - Número de meses para projetar (6 ou 12)
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getDailyCashFlowProjection = async (months = 6) => {
  try {
    // Buscar saldo atual
    const transactionsResult = await getTransactions();
    if (!transactionsResult.success) {
      return { success: false, error: transactionsResult.error };
    }

    let currentBalance = 0;
    transactionsResult.transactions.forEach(transaction => {
      currentBalance += transaction.amount;
    });

    // Buscar receitas
    const incomesResult = await getIncomes();
    if (!incomesResult.success) {
      return { success: false, error: incomesResult.error };
    }

    // Buscar despesas recorrentes
    const recurringResult = await getRecurringTransactions();
    if (!recurringResult.success) {
      return { success: false, error: recurringResult.error };
    }

    // Buscar gastos diários
    const dailyExpensesResult = await getDailyExpenses();
    const dailyExpenses = dailyExpensesResult.success ? dailyExpensesResult.expenses : [];

    // Buscar orçamentos diários
    const budgetsResult = await getDailyBudgets();
    const budgets = budgetsResult.success ? budgetsResult.budgets : [];

    // Gerar projeção dia a dia
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = addMonths(today, months);
    const projection = [];

    let balance = currentBalance;
    let currentDate = new Date(today);

    while (currentDate <= endDate) {
      const dayOfMonth = currentDate.getDate();
      let dailyIncome = 0;
      let dailyExpense = 0;

      // Calcular receitas do dia
      incomesResult.incomes.forEach(income => {
        if (income.incomeType === 'single' && income.date) {
          const incomeDate = income.date.toDate();
          incomeDate.setHours(0, 0, 0, 0);
          if (incomeDate.getTime() === currentDate.getTime()) {
            dailyIncome += income.amount;
          }
        } else if (income.incomeType === 'recurring') {
          if (income.frequency === 'monthly' && income.dayOfMonth === dayOfMonth) {
            dailyIncome += income.amount;
          } else if (income.frequency === 'daily') {
            dailyIncome += income.amount;
          }
          // Outras frequências podem ser implementadas
        }
      });

      // Calcular despesas recorrentes do dia
      recurringResult.recurring.forEach(recurring => {
        if (recurring.type === 'expense' && recurring.dayOfMonth === dayOfMonth) {
          dailyExpense += Math.abs(recurring.amount);
        }
      });

      // Calcular gastos diários reais ou orçamento
      const dailyExpenseForDate = dailyExpenses.find(expense => {
        const expenseDate = expense.date.toDate();
        expenseDate.setHours(0, 0, 0, 0);
        return expenseDate.getTime() === currentDate.getTime();
      });

      if (dailyExpenseForDate) {
        dailyExpense += dailyExpenseForDate.amount;
      } else {
        // Se não houver gasto real, usar orçamento diário se existir
        const activeBudget = budgets.find(budget => {
          const startDate = budget.startDate.toDate();
          startDate.setHours(0, 0, 0, 0);
          const endDate = budget.endDate
            ? budget.endDate.toDate()
            : new Date(2099, 11, 31);
          endDate.setHours(23, 59, 59, 999);
          return currentDate >= startDate && currentDate <= endDate;
        });

        if (activeBudget) {
          dailyExpense += activeBudget.amount;
        }
      }

      // Atualizar saldo
      balance += dailyIncome - dailyExpense;

      // Adicionar ao array de projeção
      projection.push({
        date: formatDate(currentDate),
        balance: parseFloat(balance.toFixed(2)),
        income: parseFloat(dailyIncome.toFixed(2)),
        expense: parseFloat(dailyExpense.toFixed(2)),
        isPositive: balance >= 0
      });

      // Próximo dia
      currentDate = addDays(currentDate, 1);
    }

    return {
      success: true,
      data: projection
    };
  } catch (error) {
    console.error('Erro ao calcular projeção de fluxo de caixa:', error);
    return { success: false, error: error.message };
  }
};

// ========================================
// ESTATÍSTICAS GERAIS
// ========================================

/**
 * Retorna estatísticas gerais do dashboard
 * @returns {Promise<{success: boolean, stats?: Object, error?: string}>}
 */
export const getDashboardStats = async () => {
  try {
    // Saldo atual
    const transactionsResult = await getTransactions();
    if (!transactionsResult.success) {
      return { success: false, error: transactionsResult.error };
    }

    let currentBalance = 0;
    transactionsResult.transactions.forEach(transaction => {
      currentBalance += transaction.amount;
    });

    // Total de receitas
    const incomesResult = await getIncomes();
    const totalIncomes = incomesResult.success ? incomesResult.incomes.length : 0;

    // Total de despesas recorrentes
    const recurringResult = await getRecurringTransactions();
    const totalRecurring = recurringResult.success ? recurringResult.recurring.length : 0;

    // Total de transações
    const totalTransactions = transactionsResult.success
      ? transactionsResult.transactions.length
      : 0;

    // Gastos diários este mês
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const dailyExpensesResult = await getDailyExpenses();

    let monthlyDailyExpenses = 0;
    if (dailyExpensesResult.success) {
      dailyExpensesResult.expenses.forEach(expense => {
        const expenseDate = expense.date.toDate();
        if (expenseDate >= firstDayOfMonth) {
          monthlyDailyExpenses += expense.amount;
        }
      });
    }

    // Previsão do mês atual
    const monthlyForecast = await getMonthlyForecast(now.getFullYear(), now.getMonth());

    return {
      success: true,
      stats: {
        currentBalance: parseFloat(currentBalance.toFixed(2)),
        totalIncomes,
        totalRecurring,
        totalTransactions,
        monthlyDailyExpenses: parseFloat(monthlyDailyExpenses.toFixed(2)),
        monthlyForecast: monthlyForecast.success ? monthlyForecast.data : null
      }
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas do dashboard:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Retorna resumo de gastos diários vs orçamento para o mês atual
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getMonthlyDailyBudgetSummary = async () => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = getDaysInMonth(year, month);

    const summary = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);

      // Buscar orçamento do dia
      const budgetsResult = await getDailyBudgets();
      const budgets = budgetsResult.success ? budgetsResult.budgets : [];

      const activeBudget = budgets.find(budget => {
        const startDate = budget.startDate.toDate();
        startDate.setHours(0, 0, 0, 0);
        const endDate = budget.endDate
          ? budget.endDate.toDate()
          : new Date(2099, 11, 31);
        endDate.setHours(23, 59, 59, 999);
        return date >= startDate && date <= endDate;
      });

      // Buscar gastos do dia
      const dailyExpensesResult = await getDailyExpenses();
      let spent = 0;

      if (dailyExpensesResult.success) {
        dailyExpensesResult.expenses.forEach(expense => {
          const expenseDate = expense.date.toDate();
          expenseDate.setHours(0, 0, 0, 0);
          if (expenseDate.getTime() === date.getTime()) {
            spent += expense.amount;
          }
        });
      }

      const budget = activeBudget ? activeBudget.amount : 0;
      const remaining = budget - spent;

      summary.push({
        date: formatDate(date),
        day,
        budget: parseFloat(budget.toFixed(2)),
        spent: parseFloat(spent.toFixed(2)),
        remaining: parseFloat(remaining.toFixed(2)),
        hasExceeded: remaining < 0
      });
    }

    return {
      success: true,
      data: summary
    };
  } catch (error) {
    console.error('Erro ao calcular resumo de orçamento diário:', error);
    return { success: false, error: error.message };
  }
};

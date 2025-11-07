// src/services/projectionService.js
import { getRecurringTransactions, getTransactions } from './transactionService';
import { getIncomes } from './incomeService';
import { getDailyExpenses, getDailyBudgets } from './dailyBudgetService';
import { getUnifiedBalance } from './balanceService';

// Gera a projeção de saldo para os próximos meses
export const generateProjection = async (months = 6) => {
  try {
    // Pega o saldo atual UNIFICADO (consolida todas as fontes)
    const balanceResult = await getUnifiedBalance();
    if (!balanceResult.success) {
      return { success: false, error: balanceResult.error };
    }
    let balance = balanceResult.balance;

    // Buscar todas as fontes de dados
    const incomesResult = await getIncomes();
    const recurringResult = await getRecurringTransactions();
    const transactionsResult = await getTransactions();
    const budgetsResult = await getDailyBudgets();

    if (!incomesResult.success || !recurringResult.success || !transactionsResult.success) {
      return { success: false, error: 'Erro ao buscar dados' };
    }

    const incomes = incomesResult.incomes;
    const recurring = recurringResult.recurring;
    const transactions = transactionsResult.transactions;
    const budgets = budgetsResult.success ? budgetsResult.budgets : [];

    // Cria a projeção mês a mês
    const projection = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i <= months; i++) {
      const projectionDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const firstDayOfMonth = new Date(projectionDate.getFullYear(), projectionDate.getMonth(), 1);
      const lastDayOfMonth = new Date(projectionDate.getFullYear(), projectionDate.getMonth() + 1, 0);

      // Se for o mês atual (i === 0), usa o saldo atual
      if (i === 0) {
        projection.push({
          month: formatMonth(projectionDate),
          balance: parseFloat(balance.toFixed(2)),
          date: projectionDate
        });
        continue;
      }

      let monthlyIncome = 0;
      let monthlyExpense = 0;

      // 1. RECEITAS ÚNICAS FUTURAS do mês
      incomes.forEach(income => {
        if (income.incomeType === 'single' && income.date) {
          const incomeDate = income.date.toDate();
          if (incomeDate >= firstDayOfMonth && incomeDate <= lastDayOfMonth) {
            monthlyIncome += income.amount;
          }
        }
      });

      // 2. RECEITAS RECORRENTES aplicadas ao mês
      incomes.forEach(income => {
        if (income.incomeType === 'recurring') {
          if (income.frequency === 'monthly') {
            monthlyIncome += income.amount;
          } else if (income.frequency === 'weekly') {
            monthlyIncome += income.amount * 4;
          } else if (income.frequency === 'biweekly') {
            monthlyIncome += income.amount * 2;
          } else if (income.frequency === 'daily') {
            const daysInMonth = lastDayOfMonth.getDate();
            monthlyIncome += income.amount * daysInMonth;
          } else if (income.frequency === 'yearly') {
            monthlyIncome += income.amount / 12;
          }
        }
      });

      // 3. DESPESAS RECORRENTES aplicadas ao mês
      recurring.forEach(rec => {
        if (rec.type === 'expense') {
          const amount = Math.abs(rec.amount);
          const frequency = rec.frequency || 'monthly';

          if (frequency === 'monthly') {
            monthlyExpense += amount;
          } else if (frequency === 'weekly') {
            monthlyExpense += amount * 4;
          } else if (frequency === 'biweekly') {
            monthlyExpense += amount * 2;
          } else if (frequency === 'daily') {
            const daysInMonth = lastDayOfMonth.getDate();
            monthlyExpense += amount * daysInMonth;
          } else if (frequency === 'yearly') {
            monthlyExpense += amount / 12;
          }
        }
      });

      // 4. TRANSAÇÕES ÚNICAS FUTURAS do mês (despesas gerais)
      transactions.forEach(transaction => {
        if (transaction.date) {
          const transactionDate = transaction.date.toDate();
          if (transactionDate >= firstDayOfMonth && transactionDate <= lastDayOfMonth) {
            if (transaction.amount < 0 || transaction.type === 'expense') {
              monthlyExpense += Math.abs(transaction.amount);
            }
          }
        }
      });

      // 5. ORÇAMENTO DIÁRIO projetado (se não houver despesas diárias específicas)
      const activeBudget = budgets.find(budget => {
        const startDate = budget.startDate.toDate();
        startDate.setHours(0, 0, 0, 0);
        const endDate = budget.endDate ? budget.endDate.toDate() : new Date(2099, 11, 31);
        endDate.setHours(23, 59, 59, 999);
        return projectionDate >= startDate && projectionDate <= endDate;
      });

      if (activeBudget) {
        const daysInMonth = lastDayOfMonth.getDate();
        monthlyExpense += activeBudget.amount * daysInMonth;
      }

      // Aplicar mudanças ao saldo
      balance += monthlyIncome - monthlyExpense;

      projection.push({
        month: formatMonth(projectionDate),
        balance: parseFloat(balance.toFixed(2)),
        date: projectionDate,
        income: parseFloat(monthlyIncome.toFixed(2)),
        expense: parseFloat(monthlyExpense.toFixed(2))
      });
    }

    return { success: true, projection };
  } catch (error) {
    console.error('Erro ao gerar projeção:', error);
    return { success: false, error: error.message, projection: [] };
  }
};

// Formata a data para exibição (ex: "Nov/25")
const formatMonth = (date) => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${year}`;
};

// Identifica quando o saldo ficará positivo (se estiver negativo)
export const getBreakEvenMonth = async () => {
  try {
    const result = await generateProjection(12);
    if (!result.success) return null;
    
    const projection = result.projection;
    
    // Se já está positivo, retorna null
    if (projection[0].balance >= 0) {
      return { alreadyPositive: true };
    }
    
    // Procura o primeiro mês positivo
    for (let i = 1; i < projection.length; i++) {
      if (projection[i].balance >= 0) {
        return {
          alreadyPositive: false,
          month: projection[i].month,
          monthsUntil: i
        };
      }
    }
    
    // Se não encontrou, significa que ficará negativo por mais de 12 meses
    return {
      alreadyPositive: false,
      month: null,
      monthsUntil: null,
      message: 'Saldo permanecerá negativo por mais de 12 meses'
    };
  } catch (error) {
    console.error('Erro ao calcular break-even:', error);
    return null;
  }
};

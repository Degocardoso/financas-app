// src/services/projectionService.js
import { getCurrentBalance, getRecurringTransactions } from './transactionService';

// Gera a projeção de saldo para os próximos meses
export const generateProjection = async (months = 6) => {
  try {
    // Pega o saldo atual
    const currentBalance = await getCurrentBalance();
    
    // Pega as transações recorrentes
    const result = await getRecurringTransactions();
    if (!result.success) return { success: false, error: result.error };
    
    const recurring = result.recurring;
    
    // Cria a projeção mês a mês
    const projection = [];
    let balance = currentBalance;
    
    const today = new Date();
    
    for (let i = 0; i <= months; i++) {
      const projectionDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      
      // Se for o mês atual (i === 0), usa o saldo atual
      if (i === 0) {
        projection.push({
          month: formatMonth(projectionDate),
          balance: balance,
          date: projectionDate
        });
        continue;
      }
      
      // Para os próximos meses, aplica as transações recorrentes
      recurring.forEach(rec => {
        // Verifica se a recorrente está ativa neste mês
        const recStartDate = rec.startDate?.toDate ? rec.startDate.toDate() : new Date(rec.startDate);
        const recEndDate = rec.endDate?.toDate ? rec.endDate.toDate() : null;
        
        if (projectionDate >= recStartDate) {
          if (!recEndDate || projectionDate <= recEndDate) {
            balance += rec.amount;
          }
        }
      });
      
      projection.push({
        month: formatMonth(projectionDate),
        balance: parseFloat(balance.toFixed(2)),
        date: projectionDate
      });
    }
    
    return { success: true, projection };
  } catch (error) {
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

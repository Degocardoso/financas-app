// src/services/dataService.js
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Deleta TODOS os dados do usuário
 * ATENÇÃO: Esta operação é IRREVERSÍVEL!
 *
 * @returns {Promise<{success: boolean, error?: string, details?: Object}>}
 */
export const deleteAllUserData = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    const results = {
      transactions: 0,
      incomes: 0,
      recurringTransactions: 0,
      dailyExpenses: 0,
      dailyBudgets: 0,
    };

    // 1. Deletar todas as transações
    try {
      const transactionsRef = collection(db, `users/${userId}/transactions`);
      const transactionsSnapshot = await getDocs(transactionsRef);

      const deletePromises = [];
      transactionsSnapshot.forEach((docSnapshot) => {
        deletePromises.push(deleteDoc(doc(db, `users/${userId}/transactions`, docSnapshot.id)));
        results.transactions++;
      });

      await Promise.all(deletePromises);
      console.log(`Deletadas ${results.transactions} transações`);
    } catch (error) {
      console.error('Erro ao deletar transações:', error);
    }

    // 2. Deletar todas as receitas
    try {
      const incomesRef = collection(db, `users/${userId}/incomes`);
      const incomesSnapshot = await getDocs(incomesRef);

      const deletePromises = [];
      incomesSnapshot.forEach((docSnapshot) => {
        deletePromises.push(deleteDoc(doc(db, `users/${userId}/incomes`, docSnapshot.id)));
        results.incomes++;
      });

      await Promise.all(deletePromises);
      console.log(`Deletadas ${results.incomes} receitas`);
    } catch (error) {
      console.error('Erro ao deletar receitas:', error);
    }

    // 3. Deletar todas as transações recorrentes
    try {
      const recurringRef = collection(db, `users/${userId}/recurringTransactions`);
      const recurringSnapshot = await getDocs(recurringRef);

      const deletePromises = [];
      recurringSnapshot.forEach((docSnapshot) => {
        deletePromises.push(deleteDoc(doc(db, `users/${userId}/recurringTransactions`, docSnapshot.id)));
        results.recurringTransactions++;
      });

      await Promise.all(deletePromises);
      console.log(`Deletadas ${results.recurringTransactions} transações recorrentes`);
    } catch (error) {
      console.error('Erro ao deletar transações recorrentes:', error);
    }

    // 4. Deletar todas as despesas diárias
    try {
      const dailyExpensesRef = collection(db, `users/${userId}/dailyExpenses`);
      const dailyExpensesSnapshot = await getDocs(dailyExpensesRef);

      const deletePromises = [];
      dailyExpensesSnapshot.forEach((docSnapshot) => {
        deletePromises.push(deleteDoc(doc(db, `users/${userId}/dailyExpenses`, docSnapshot.id)));
        results.dailyExpenses++;
      });

      await Promise.all(deletePromises);
      console.log(`Deletadas ${results.dailyExpenses} despesas diárias`);
    } catch (error) {
      console.error('Erro ao deletar despesas diárias:', error);
    }

    // 5. Deletar todos os orçamentos diários
    try {
      const dailyBudgetsRef = collection(db, `users/${userId}/dailyBudgets`);
      const dailyBudgetsSnapshot = await getDocs(dailyBudgetsRef);

      const deletePromises = [];
      dailyBudgetsSnapshot.forEach((docSnapshot) => {
        deletePromises.push(deleteDoc(doc(db, `users/${userId}/dailyBudgets`, docSnapshot.id)));
        results.dailyBudgets++;
      });

      await Promise.all(deletePromises);
      console.log(`Deletados ${results.dailyBudgets} orçamentos diários`);
    } catch (error) {
      console.error('Erro ao deletar orçamentos diários:', error);
    }

    // Total de itens deletados
    const totalDeleted =
      results.transactions +
      results.incomes +
      results.recurringTransactions +
      results.dailyExpenses +
      results.dailyBudgets;

    console.log(`TOTAL DELETADO: ${totalDeleted} itens`);
    console.log('Detalhes:', results);

    return {
      success: true,
      details: results,
      totalDeleted
    };
  } catch (error) {
    console.error('Erro ao deletar todos os dados:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

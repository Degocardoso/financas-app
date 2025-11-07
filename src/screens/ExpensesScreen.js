// src/screens/ExpensesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTransactions, deleteTransaction } from '../services/transactionService';
import { getIncomes, deleteIncome } from '../services/incomeService';
import { getDailyExpenses, deleteDailyExpense } from '../services/dailyBudgetService';

export default function ExpensesScreen({ navigation }) {
  const { theme } = useTheme();
  const [allItems, setAllItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense'

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const consolidated = [];

    // 1. Buscar transactions (importadas do CSV)
    const transactionsResult = await getTransactions();
    if (transactionsResult.success) {
      transactionsResult.transactions.forEach(t => {
        consolidated.push({
          ...t,
          sourceType: 'transaction',
          displayDate: t.date ? (t.date.toDate ? t.date.toDate() : new Date(t.date)) : new Date()
        });
      });
    }

    // 2. Buscar receitas únicas (NÃO futuras - só passado e presente)
    const incomesResult = await getIncomes();
    if (incomesResult.success) {
      incomesResult.incomes.forEach(income => {
        if (income.incomeType === 'single' && income.date) {
          const incomeDate = income.date.toDate();
          incomeDate.setHours(0, 0, 0, 0);

          // Incluir apenas se não for futura
          if (incomeDate <= today) {
            consolidated.push({
              ...income,
              sourceType: 'income',
              displayDate: incomeDate,
              type: 'income' // Garantir que é receita
            });
          }
        }
      });
    }

    // 3. Buscar despesas diárias
    const dailyExpensesResult = await getDailyExpenses();
    if (dailyExpensesResult.success) {
      dailyExpensesResult.expenses.forEach(expense => {
        consolidated.push({
          ...expense,
          sourceType: 'dailyExpense',
          displayDate: expense.date ? (expense.date.toDate ? expense.date.toDate() : new Date(expense.date)) : new Date(),
          type: 'expense' // Garantir que é despesa
        });
      });
    }

    // Ordenar por data (mais recente primeiro)
    consolidated.sort((a, b) => b.displayDate - a.displayDate);

    setAllItems(consolidated);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleDelete = (item) => {
    const description = item.description || item.title || 'este item';
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir "${description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            let result;

            // Detectar origem e chamar service correto
            if (item.sourceType === 'transaction') {
              result = await deleteTransaction(item.id);
            } else if (item.sourceType === 'income') {
              result = await deleteIncome(item.id);
            } else if (item.sourceType === 'dailyExpense') {
              result = await deleteDailyExpense(item.id);
            }

            if (result && result.success) {
              Alert.alert('Sucesso', 'Item excluído com sucesso!');
              loadAllData();
            } else {
              Alert.alert('Erro', result?.error || 'Erro ao excluir item');
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return 'Data não disponível';

    let dateObj;
    if (date.toDate) {
      // Firestore Timestamp
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }

    return dateObj.toLocaleDateString('pt-BR');
  };

  // Filtrar itens
  const filteredItems = allItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'income') return item.type === 'income' || item.amount >= 0;
    if (filter === 'expense') return item.type === 'expense' || item.amount < 0;
    return true;
  });

  // Calcular totais
  const totalIncome = allItems
    .filter(item => item.type === 'income' || item.amount >= 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const totalExpense = allItems
    .filter(item => item.type === 'expense' || item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.colors.onPrimary }]}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onPrimary }]}>Despesas Gerais</Text>
        <Text style={[styles.subtitle, { color: theme.colors.onPrimary }]}>
          Transações importadas e cadastradas
        </Text>
      </View>

      {/* Resumo */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.success }]}>
          <Text style={[styles.summaryLabel, { color: theme.colors.onSuccess }]}>Receitas</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.onSuccess }]}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.colors.error }]}>
          <Text style={[styles.summaryLabel, { color: theme.colors.onError }]}>Despesas</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.onError }]}>
            {formatCurrency(totalExpense)}
          </Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={[styles.filterContainer, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === 'all' ? theme.colors.onPrimary : theme.colors.text }
            ]}
          >
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'income' && { backgroundColor: theme.colors.success }
          ]}
          onPress={() => setFilter('income')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === 'income' ? theme.colors.onSuccess : theme.colors.text }
            ]}
          >
            Receitas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'expense' && { backgroundColor: theme.colors.error }
          ]}
          onPress={() => setFilter('expense')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === 'expense' ? theme.colors.onError : theme.colors.text }
            ]}
          >
            Despesas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista consolidada */}
      <View style={styles.listContainer}>
        {filteredItems.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Nenhum item encontrado
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
              Cadastre receitas/despesas ou importe CSV
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => {
            // Determinar ícone e label baseado na origem
            let originIcon = '';
            let originLabel = '';

            if (item.sourceType === 'transaction') {
              originIcon = '💳';
              originLabel = item.source || 'Importado';
            } else if (item.sourceType === 'income') {
              originIcon = '💰';
              originLabel = 'Receita cadastrada';
            } else if (item.sourceType === 'dailyExpense') {
              originIcon = '📆';
              originLabel = 'Despesa diária';
            }

            return (
              <View
                key={`${item.sourceType}-${item.id}`}
                style={[styles.transactionCard, { backgroundColor: theme.colors.surface }]}
              >
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
                    {formatDate(item.displayDate || item.date)}
                  </Text>
                  <Text style={[styles.transactionDescription, { color: theme.colors.text }]}>
                    {item.description || item.title || 'Sem descrição'}
                  </Text>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color: (item.type === 'income' || item.amount >= 0)
                          ? theme.colors.success
                          : theme.colors.error
                      }
                    ]}
                  >
                    {(item.type === 'income' || item.amount >= 0) ? '+' : '-'}
                    {formatCurrency(Math.abs(item.amount))}
                  </Text>
                  <Text style={[styles.transactionSource, { color: theme.colors.textTertiary }]}>
                    {originIcon} {originLabel}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={[styles.deleteButtonText, { color: theme.colors.onError }]}>
                    🗑️
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.9,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  emptyContainer: {
    padding: 40,
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
  },
  transactionCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionSource: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    fontSize: 20,
  },
});

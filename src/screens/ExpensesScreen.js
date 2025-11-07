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

export default function ExpensesScreen({ navigation }) {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense'

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const result = await getTransactions();
    if (result.success) {
      setTransactions(result.transactions);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleDelete = (transaction) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir "${transaction.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteTransaction(transaction.id);
            if (result.success) {
              Alert.alert('Sucesso', 'Transação excluída com sucesso!');
              loadTransactions();
            } else {
              Alert.alert('Erro', result.error || 'Erro ao excluir transação');
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

  // Filtrar transações
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'income') return transaction.type === 'income';
    if (filter === 'expense') return transaction.type === 'expense';
    return true;
  });

  // Calcular totais
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

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

      {/* Lista de transações */}
      <View style={styles.listContainer}>
        {filteredTransactions.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Nenhuma transação encontrada
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
              Importe um extrato CSV para começar
            </Text>
          </View>
        ) : (
          filteredTransactions.map((transaction) => (
            <View
              key={transaction.id}
              style={[styles.transactionCard, { backgroundColor: theme.colors.surface }]}
            >
              <View style={styles.transactionInfo}>
                <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
                  {formatDate(transaction.date)}
                </Text>
                <Text style={[styles.transactionDescription, { color: theme.colors.text }]}>
                  {transaction.description}
                </Text>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color: transaction.type === 'income'
                        ? theme.colors.success
                        : theme.colors.error
                    }
                  ]}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </Text>
                {transaction.source && (
                  <Text style={[styles.transactionSource, { color: theme.colors.textTertiary }]}>
                    Origem: {transaction.source}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
                onPress={() => handleDelete(transaction)}
              >
                <Text style={[styles.deleteButtonText, { color: theme.colors.onError }]}>
                  🗑️
                </Text>
              </TouchableOpacity>
            </View>
          ))
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

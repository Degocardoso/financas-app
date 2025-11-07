// src/screens/RecurringScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  RefreshControl
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getRecurringTransactions,
  addRecurringTransaction,
  deleteRecurringTransaction,
  getTransactions,
  deleteTransaction
} from '../services/transactionService';
import { getIncomes, deleteIncome } from '../services/incomeService';
import { useTheme } from '../context/ThemeContext';

export default function RecurringScreen({ navigation }) {
  const { theme } = useTheme();
  const [recurring, setRecurring] = useState([]);
  const [futureIncomes, setFutureIncomes] = useState([]);
  const [futureTransactions, setFutureTransactions] = useState([]);
  const [allFuture, setAllFuture] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    dayOfMonth: '1',
    startDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadAllFutureTransactions();
  }, []);

  const loadAllFutureTransactions = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Carregar transações recorrentes
    const recurringResult = await getRecurringTransactions();
    const recurringList = recurringResult.success ? recurringResult.recurring : [];

    // 2. Carregar receitas únicas futuras
    const incomesResult = await getIncomes();
    const futureIncomesList = [];
    if (incomesResult.success) {
      incomesResult.incomes.forEach(income => {
        if (income.incomeType === 'single' && income.date) {
          const incomeDate = income.date.toDate();
          incomeDate.setHours(0, 0, 0, 0);
          if (incomeDate > today) {
            futureIncomesList.push({
              ...income,
              sourceType: 'futureIncome',
              displayDate: incomeDate
            });
          }
        }
        // Receitas recorrentes já estão em recurring, não duplicar
      });
    }

    // 3. Carregar transações/despesas únicas futuras
    const transactionsResult = await getTransactions();
    const futureTransactionsList = [];
    if (transactionsResult.success) {
      transactionsResult.transactions.forEach(transaction => {
        if (transaction.date) {
          const transactionDate = transaction.date.toDate();
          transactionDate.setHours(0, 0, 0, 0);
          if (transactionDate > today) {
            futureTransactionsList.push({
              ...transaction,
              sourceType: 'futureTransaction',
              displayDate: transactionDate
            });
          }
        }
      });
    }

    // 4. Consolidar e ordenar por data
    const consolidated = [
      ...recurringList.map(r => ({ ...r, sourceType: 'recurring' })),
      ...futureIncomesList,
      ...futureTransactionsList
    ].sort((a, b) => {
      // Recorrentes primeiro (não têm displayDate específica)
      if (a.sourceType === 'recurring' && b.sourceType !== 'recurring') return -1;
      if (a.sourceType !== 'recurring' && b.sourceType === 'recurring') return 1;
      if (a.sourceType === 'recurring' && b.sourceType === 'recurring') {
        return (a.dayOfMonth || 0) - (b.dayOfMonth || 0);
      }
      // Ordenar futuras por data
      return a.displayDate - b.displayDate;
    });

    setRecurring(recurringList);
    setFutureIncomes(futureIncomesList);
    setFutureTransactions(futureTransactionsList);
    setAllFuture(consolidated);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllFutureTransactions();
    setRefreshing(false);
  };

  const handleAdd = async () => {
    if (!formData.description || !formData.amount || !formData.dayOfMonth) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      Alert.alert('Erro', 'Valor inválido');
      return;
    }

    const dayOfMonth = parseInt(formData.dayOfMonth);
    if (dayOfMonth < 1 || dayOfMonth > 31) {
      Alert.alert('Erro', 'Dia do mês deve estar entre 1 e 31');
      return;
    }

    const result = await addRecurringTransaction({
      description: formData.description,
      amount: amount,
      dayOfMonth: dayOfMonth,
      startDate: formData.startDate,
      type: amount >= 0 ? 'income' : 'expense',
    });

    if (result.success) {
      Alert.alert('Sucesso', 'Lançamento recorrente cadastrado!');
      setModalVisible(false);
      setFormData({
        description: '',
        amount: '',
        dayOfMonth: '1',
        startDate: new Date(),
      });
      loadAllFutureTransactions();
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  const handleDelete = (item) => {
    const description = item.description || item.title || 'este lançamento';
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir "${description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            let result;

            if (item.sourceType === 'recurring') {
              result = await deleteRecurringTransaction(item.id);
            } else if (item.sourceType === 'futureIncome') {
              result = await deleteIncome(item.id);
            } else if (item.sourceType === 'futureTransaction') {
              result = await deleteTransaction(item.id);
            }

            if (result && result.success) {
              Alert.alert('Sucesso', 'Lançamento excluído!');
              loadAllFutureTransactions();
            } else {
              Alert.alert('Erro', result?.error || 'Erro ao excluir');
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
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const renderItem = (item) => {
    const isRecurring = item.sourceType === 'recurring';
    const isFutureIncome = item.sourceType === 'futureIncome';
    const isFutureTransaction = item.sourceType === 'futureTransaction';

    let displayInfo = '';
    if (isRecurring) {
      displayInfo = `🔄 Recorrente • Todo dia ${item.dayOfMonth}`;
    } else if (isFutureIncome) {
      displayInfo = `💰 Receita Única • ${formatDate(item.displayDate)}`;
    } else if (isFutureTransaction) {
      displayInfo = `💳 Transação Única • ${formatDate(item.displayDate)}`;
    }

    const amount = item.amount || 0;

    return (
      <View key={`${item.sourceType}-${item.id}`} style={[styles.recurringItem, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.recurringLeft}>
          <Text style={[styles.recurringDescription, { color: theme.colors.text }]}>
            {item.description || item.title || 'Sem descrição'}
          </Text>
          <Text style={[styles.recurringInfo, { color: theme.colors.textSecondary }]}>
            {displayInfo}
          </Text>
        </View>
        <View style={styles.recurringRight}>
          <Text style={[
            styles.recurringAmount,
            { color: amount >= 0 ? theme.colors.success : theme.colors.error }
          ]}>
            {formatCurrency(Math.abs(amount))}
          </Text>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.colors.onPrimary }]}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onPrimary }]}>Lançamentos Futuros</Text>
        <Text style={[styles.subtitle, { color: theme.colors.onPrimary }]}>
          Recorrentes e agendados
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            📌 Esta tela mostra:{'\n'}
            • Lançamentos recorrentes (salário, aluguel, etc.){'\n'}
            • Receitas com data futura{'\n'}
            • Despesas/transações com data futura
          </Text>
        </View>

        {allFuture.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Nenhum lançamento futuro cadastrado.{'\n'}
            Clique no botão + para adicionar recorrentes{'\n'}
            ou cadastre receitas/despesas com datas futuras.
          </Text>
        ) : (
          allFuture.map((item) => renderItem(item))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.fabText, { color: theme.colors.onPrimary }]}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Novo Lançamento Recorrente</Text>

            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.background,
                color: theme.colors.text
              }]}
              placeholder="Descrição (ex: Salário)"
              placeholderTextColor={theme.colors.textTertiary}
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
            />

            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.background,
                color: theme.colors.text
              }]}
              placeholder="Valor (use - para despesas)"
              placeholderTextColor={theme.colors.textTertiary}
              value={formData.amount}
              onChangeText={(text) => setFormData({...formData, amount: text})}
              keyboardType="numeric"
            />

            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.background,
                color: theme.colors.text
              }]}
              placeholder="Dia do mês (1-31)"
              placeholderTextColor={theme.colors.textTertiary}
              value={formData.dayOfMonth}
              onChangeText={(text) => setFormData({...formData, dayOfMonth: text})}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.dateButton, {
                backgroundColor: theme.colors.background
              }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: theme.colors.text }}>Data de início: {formatDate(formData.startDate)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={formData.startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setFormData({...formData, startDate: selectedDate});
                  }
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.disabled }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.success }]}
                onPress={handleAdd}
              >
                <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  recurringItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  recurringLeft: {
    flex: 1,
  },
  recurringDescription: {
    fontSize: 16,
    marginBottom: 5,
  },
  recurringInfo: {
    fontSize: 12,
  },
  recurringRight: {
    alignItems: 'flex-end',
  },
  recurringAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  dateButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

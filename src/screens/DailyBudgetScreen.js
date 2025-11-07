// src/screens/DailyBudgetScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import {
  setDailyBudget,
  getDailyBudgets,
  addDailyExpense,
  getDailyExpenses,
  compareBudgetVsSpent,
  getExpensesByDate,
} from '../services/dailyBudgetService';

const DailyBudgetScreen = () => {
  const { theme } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('expense'); // 'expense' ou 'budget'

  // Estados do formulário de gasto
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date());

  // Estados do formulário de orçamento
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetStartDate, setBudgetStartDate] = useState(new Date());

  // Estado de comparação do dia
  const [todayComparison, setTodayComparison] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    await Promise.all([
      loadExpenses(),
      loadBudgets(),
      loadTodayComparison(),
    ]);
    setRefreshing(false);
  };

  const loadExpenses = async () => {
    const result = await getDailyExpenses();
    if (result.success) {
      setExpenses(result.expenses);
    }
  };

  const loadBudgets = async () => {
    const result = await getDailyBudgets();
    if (result.success) {
      setBudgets(result.budgets);
    }
  };

  const loadTodayComparison = async () => {
    const result = await compareBudgetVsSpent(new Date());
    if (result.success) {
      setTodayComparison(result);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      Alert.alert('Erro', 'Valor deve ser maior que zero');
      return;
    }

    const result = await addDailyExpense({
      date: expenseDate,
      amount: parseFloat(expenseAmount),
      description: expenseDescription.trim() || 'Gasto diário',
    });

    if (result.success) {
      Alert.alert('Sucesso', 'Gasto adicionado!');
      setModalVisible(false);
      resetExpenseForm();
      loadData();
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  const handleSetBudget = async () => {
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) {
      Alert.alert('Erro', 'Valor deve ser maior que zero');
      return;
    }

    const result = await setDailyBudget({
      amount: parseFloat(budgetAmount),
      startDate: budgetStartDate,
    });

    if (result.success) {
      Alert.alert('Sucesso', 'Orçamento definido!');
      setModalVisible(false);
      resetBudgetForm();
      loadData();
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  const resetExpenseForm = () => {
    setExpenseAmount('');
    setExpenseDescription('');
    setExpenseDate(new Date());
  };

  const resetBudgetForm = () => {
    setBudgetAmount('');
    setBudgetStartDate(new Date());
  };

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const formatDate = (date) => {
    if (!date || !date.toDate) return '';
    const d = date.toDate();
    return d.toLocaleDateString('pt-BR');
  };

  const groupExpensesByDate = () => {
    const grouped = {};
    expenses.forEach((expense) => {
      const date = formatDate(expense.date);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(expense);
    });
    return Object.keys(grouped).map((date) => ({
      date,
      expenses: grouped[date],
      total: grouped[date].reduce((sum, e) => sum + e.amount, 0),
    }));
  };

  const renderExpenseGroup = ({ item }) => (
    <View style={[styles.expenseGroup, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.expenseGroupHeader}>
        <Text style={[styles.expenseGroupDate, { color: theme.colors.text }]}>
          {item.date}
        </Text>
        <Text style={[styles.expenseGroupTotal, { color: theme.colors.error }]}>
          R$ {item.total.toFixed(2)}
        </Text>
      </View>
      {item.expenses.map((expense, index) => (
        <View key={expense.id} style={styles.expenseItem}>
          <Text style={[styles.expenseDescription, { color: theme.colors.textSecondary }]}>
            {expense.description || 'Gasto diário'}
          </Text>
          <Text style={[styles.expenseAmount, { color: theme.colors.text }]}>
            R$ {expense.amount.toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Card de Resumo do Dia */}
      {todayComparison && (
        <View style={[styles.todayCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.todayTitle, { color: theme.colors.text }]}>
            Hoje
          </Text>
          <View style={styles.todayContent}>
            <View style={styles.todayRow}>
              <Text style={[styles.todayLabel, { color: theme.colors.textSecondary }]}>
                Orçamento:
              </Text>
              <Text style={[styles.todayValue, { color: theme.colors.text }]}>
                R$ {todayComparison.budget?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.todayRow}>
              <Text style={[styles.todayLabel, { color: theme.colors.textSecondary }]}>
                Gasto:
              </Text>
              <Text style={[styles.todayValue, { color: theme.colors.error }]}>
                R$ {todayComparison.spent.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.todayDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.todayRow}>
              <Text style={[styles.todayLabel, { color: theme.colors.text, fontWeight: '600' }]}>
                Restante:
              </Text>
              <Text
                style={[
                  styles.todayValue,
                  styles.todayRemaining,
                  {
                    color: todayComparison.hasExceeded
                      ? theme.colors.error
                      : theme.colors.success,
                  },
                ]}
              >
                R$ {todayComparison.remaining.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Botões de Ação */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={() => openModal('expense')}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.onError }]}>
            + Gasto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => openModal('budget')}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
            Definir Orçamento
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Gastos */}
      <FlatList
        data={groupExpensesByDate()}
        renderItem={renderExpenseGroup}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadData}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Nenhum gasto registrado ainda.
            </Text>
          </View>
        }
      />

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <ScrollView>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {modalType === 'expense' ? 'Novo Gasto' : 'Definir Orçamento Diário'}
              </Text>

              {modalType === 'expense' ? (
                <>
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                    Valor
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={expenseAmount}
                    onChangeText={setExpenseAmount}
                    keyboardType="numeric"
                  />

                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                    Descrição (opcional)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder="Ex: Almoço, Combustível..."
                    placeholderTextColor={theme.colors.textTertiary}
                    value={expenseDescription}
                    onChangeText={setExpenseDescription}
                  />
                </>
              ) : (
                <>
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                    Valor do Orçamento Diário
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder="Ex: 30.00"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={budgetAmount}
                    onChangeText={setBudgetAmount}
                    keyboardType="numeric"
                  />

                  <Text style={[styles.helperText, { color: theme.colors.textTertiary }]}>
                    Este valor será aplicado a partir de hoje.
                  </Text>
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.colors.surface },
                  ]}
                  onPress={() => {
                    setModalVisible(false);
                    if (modalType === 'expense') {
                      resetExpenseForm();
                    } else {
                      resetBudgetForm();
                    }
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: theme.colors.textSecondary }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.colors.success },
                  ]}
                  onPress={modalType === 'expense' ? handleAddExpense : handleSetBudget}
                >
                  <Text style={[styles.modalButtonText, { color: theme.colors.onSuccess }]}>
                    Salvar
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  todayCard: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  todayContent: {
    gap: 12,
  },
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayLabel: {
    fontSize: 16,
  },
  todayValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayRemaining: {
    fontSize: 20,
  },
  todayDivider: {
    height: 1,
    marginVertical: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  expenseGroup: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  expenseGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  expenseGroupDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseGroupTotal: {
    fontSize: 16,
    fontWeight: '700',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  expenseDescription: {
    fontSize: 14,
    flex: 1,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DailyBudgetScreen;

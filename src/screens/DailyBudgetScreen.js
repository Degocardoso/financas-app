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
  deleteDailyExpense,
  getActiveBudgetForDate,
} from '../services/dailyBudgetService';

const DailyBudgetScreen = () => {
  const { theme } = useTheme();
  const [monthlyData, setMonthlyData] = useState([]);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editDayModal, setEditDayModal] = useState(false);

  // Estado para orçamento
  const [budgetAmount, setBudgetAmount] = useState('');

  // Estado para edição de dia específico
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayAmount, setDayAmount] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    await loadMonthlyData();
    setRefreshing(false);
  };

  // Carrega dados do mês atual
  const loadMonthlyData = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = now.getDate(); // Dia atual

    // Buscar orçamento ativo
    const budgetResult = await getActiveBudgetForDate(now);
    const budget = budgetResult.success ? budgetResult.budget.amount : 0;
    setCurrentBudget(budget);

    // Buscar todas as despesas do mês
    const expensesResult = await getDailyExpenses();
    const expensesMap = {};

    if (expensesResult.success) {
      expensesResult.expenses.forEach(expense => {
        const expenseDate = expense.date.toDate();
        if (expenseDate.getMonth() === month && expenseDate.getFullYear() === year) {
          const day = expenseDate.getDate();
          expensesMap[day] = expense;
        }
      });
    }

    // Gerar array com todos os dias do mês (do dia atual até o fim)
    const days = [];
    for (let day = startDay; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const expense = expensesMap[day];

      days.push({
        day,
        date,
        budgetAmount: budget,
        realAmount: expense ? Math.abs(expense.amount) : null, // Valor absoluto (banco salva negativo)
        expenseId: expense ? expense.id : null,
        hasRealExpense: !!expense,
      });
    }

    setMonthlyData(days);
  };

  const handleSetBudget = async () => {
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) {
      Alert.alert('Erro', 'Valor do orçamento deve ser maior que zero');
      return;
    }

    const result = await setDailyBudget({
      amount: parseFloat(budgetAmount),
      startDate: new Date(),
    });

    if (result.success) {
      Alert.alert('Sucesso', 'Orçamento diário definido!');
      setModalVisible(false);
      setBudgetAmount('');
      loadData();
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  const openEditDay = (dayData) => {
    setSelectedDay(dayData);
    setDayAmount(dayData.realAmount ? dayData.realAmount.toString() : '');
    setEditDayModal(true);
  };

  const handleSaveDayExpense = async () => {
    if (!selectedDay) return;

    const amount = parseFloat(dayAmount);

    // Se valor = 0 ou vazio, deletar a despesa
    if (!dayAmount || amount === 0) {
      if (selectedDay.expenseId) {
        const result = await deleteDailyExpense(selectedDay.expenseId);
        if (result.success) {
          Alert.alert('Sucesso', 'Despesa removida!');
          setEditDayModal(false);
          loadData();
        } else {
          Alert.alert('Erro', result.error);
        }
      } else {
        setEditDayModal(false);
      }
      return;
    }

    if (amount < 0) {
      Alert.alert('Erro', 'Digite apenas o valor positivo (será convertido para despesa)');
      return;
    }

    // Salvar valor real
    const result = await addDailyExpense({
      date: selectedDay.date,
      amount: amount,
      description: `Gasto dia ${selectedDay.day}`,
    });

    if (result.success) {
      Alert.alert('Sucesso', 'Gasto atualizado!');
      setEditDayModal(false);
      loadData();
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  const renderDayItem = ({ item }) => {
    // Determinar valor a mostrar: real ou orçamento
    const displayAmount = item.hasRealExpense ? item.realAmount : item.budgetAmount;
    const isReal = item.hasRealExpense;
    const isOverBudget = isReal && item.realAmount > item.budgetAmount;
    const isUnderBudget = isReal && item.realAmount < item.budgetAmount;

    return (
      <TouchableOpacity
        style={[styles.dayCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => openEditDay(item)}
      >
        <View style={styles.dayHeader}>
          <Text style={[styles.dayNumber, { color: theme.colors.text }]}>
            Dia {item.day}
          </Text>
          {isReal && (
            <Text style={[styles.dayBadge, {
              backgroundColor: isOverBudget ? theme.colors.error + '20' : theme.colors.success + '20',
              color: isOverBudget ? theme.colors.error : theme.colors.success,
            }]}>
              {isOverBudget ? 'Acima' : 'Abaixo'}
            </Text>
          )}
        </View>

        <Text style={[styles.dayAmount, { color: theme.colors.error }]}>
          -R$ {displayAmount.toFixed(2)}
        </Text>

        {!isReal && item.budgetAmount > 0 && (
          <Text style={[styles.dayLabel, { color: theme.colors.textTertiary }]}>
            (Orçamento)
          </Text>
        )}
        {isReal && (
          <Text style={[styles.dayLabel, { color: theme.colors.textSecondary }]}>
            Orçamento: R$ {item.budgetAmount.toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header com Orçamento Atual */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Orçamento Diário
          </Text>
          <Text style={[styles.headerValue, { color: theme.colors.primary }]}>
            R$ {currentBudget ? currentBudget.toFixed(2) : '0.00'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.editBudgetButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.editBudgetText, { color: theme.colors.onPrimary }]}>
            {currentBudget ? 'Alterar' : 'Definir'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        Despesas do Mês (Toque em um dia para editar)
      </Text>

      {/* Lista de Dias do Mês */}
      <FlatList
        data={monthlyData}
        renderItem={renderDayItem}
        keyExtractor={(item) => item.day.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
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
              {currentBudget
                ? 'Carregando dias do mês...'
                : 'Defina um orçamento diário para começar'}
            </Text>
          </View>
        }
      />

      {/* Modal de Definir Orçamento */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Definir Orçamento Diário
            </Text>

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Valor do Orçamento por Dia
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
              Este valor será aplicado a partir de hoje até o fim do mês. Você pode editar o gasto real de cada dia individualmente.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.surface }]}
                onPress={() => {
                  setModalVisible(false);
                  setBudgetAmount('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.textSecondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.success }]}
                onPress={handleSetBudget}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.onSuccess }]}>
                  Salvar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Editar Dia */}
      <Modal
        visible={editDayModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditDayModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Editar Dia {selectedDay?.day}
            </Text>

            <View style={[styles.infoBox, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Orçamento planejado:
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                R$ {selectedDay?.budgetAmount.toFixed(2) || '0.00'}
              </Text>
            </View>

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Gasto Real
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
              placeholder="Digite o valor gasto (ou 0 para remover)"
              placeholderTextColor={theme.colors.textTertiary}
              value={dayAmount}
              onChangeText={setDayAmount}
              keyboardType="numeric"
            />

            <Text style={[styles.helperText, { color: theme.colors.textTertiary }]}>
              • Se gastou mais ou menos que o orçamento, digite o valor real{'\n'}
              • Digite 0 ou deixe vazio para usar o orçamento padrão
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.surface }]}
                onPress={() => {
                  setEditDayModal(false);
                  setDayAmount('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.textSecondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.success }]}
                onPress={handleSaveDayExpense}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.onSuccess }]}>
                  Salvar
                </Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  editBudgetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editBudgetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  listContent: {
    padding: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  dayCard: {
    flex: 0.48,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayBadge: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayAmount: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  dayLabel: {
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
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
    fontSize: 13,
    marginTop: 12,
    lineHeight: 20,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '700',
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

// src/screens/IncomesScreen.js
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
  addIncome,
  getIncomes,
  deleteIncome,
  getIncomesByType,
} from '../services/incomeService';

const IncomesScreen = () => {
  const { theme } = useTheme();
  const [incomes, setIncomes] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'single', 'recurring'

  // Estados do formulário
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [incomeType, setIncomeType] = useState('single'); // 'single' ou 'recurring'
  const [frequency, setFrequency] = useState('monthly'); // Para receitas recorrentes
  const [dayOfMonth, setDayOfMonth] = useState('');

  useEffect(() => {
    loadIncomes();
  }, []);

  useEffect(() => {
    filterIncomes();
  }, [incomes, filterType]);

  const loadIncomes = async () => {
    setRefreshing(true);
    const result = await getIncomes();
    if (result.success) {
      setIncomes(result.incomes);
    } else {
      Alert.alert('Erro', result.error);
    }
    setRefreshing(false);
  };

  const filterIncomes = () => {
    if (filterType === 'all') {
      setFilteredIncomes(incomes);
    } else {
      const filtered = incomes.filter(income => income.incomeType === filterType);
      setFilteredIncomes(filtered);
    }
  };

  const handleAddIncome = async () => {
    if (!description.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Erro', 'Valor deve ser maior que zero');
      return;
    }

    // Validações específicas para receita recorrente
    if (incomeType === 'recurring') {
      if (!frequency) {
        Alert.alert('Erro', 'Frequência é obrigatória para receitas recorrentes');
        return;
      }

      if (frequency === 'monthly' && (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31)) {
        Alert.alert('Erro', 'Para receitas mensais, o dia do mês deve estar entre 1 e 31');
        return;
      }
    }

    const incomeData = {
      description: description.trim(),
      amount: parseFloat(amount),
      incomeType: incomeType,
    };

    if (incomeType === 'recurring') {
      incomeData.frequency = frequency;
      if (frequency === 'monthly' && dayOfMonth) {
        incomeData.dayOfMonth = parseInt(dayOfMonth);
      }
    } else {
      incomeData.date = new Date(); // Data atual para receita única
    }

    const result = await addIncome(incomeData);

    if (result.success) {
      Alert.alert('Sucesso', 'Receita cadastrada com sucesso!');
      setModalVisible(false);
      resetForm();
      loadIncomes();
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  const handleDeleteIncome = (incomeId, description) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir a receita "${description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteIncome(incomeId);
            if (result.success) {
              loadIncomes();
            } else {
              Alert.alert('Erro', result.error);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setIncomeType('single');
    setFrequency('monthly');
    setDayOfMonth('');
  };

  const getFrequencyLabel = (freq) => {
    const labels = {
      daily: 'Diária',
      weekly: 'Semanal',
      biweekly: 'Quinzenal',
      monthly: 'Mensal',
      yearly: 'Anual',
    };
    return labels[freq] || freq;
  };

  const renderIncomeItem = ({ item }) => (
    <View style={[styles.incomeItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.incomeItemContent}>
        <View style={styles.incomeItemHeader}>
          <Text style={[styles.incomeDescription, { color: theme.colors.text }]}>
            {item.description}
          </Text>
          <Text style={[styles.incomeAmount, { color: theme.colors.success }]}>
            R$ {item.amount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.incomeItemDetails}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  item.incomeType === 'single'
                    ? theme.colors.infoLight
                    : theme.colors.secondaryLight,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color:
                    item.incomeType === 'single'
                      ? theme.colors.infoDark
                      : theme.colors.secondaryDark,
                },
              ]}
            >
              {item.incomeType === 'single' ? 'Única' : 'Recorrente'}
            </Text>
          </View>

          {item.incomeType === 'recurring' && item.frequency && (
            <View style={[styles.badge, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                {getFrequencyLabel(item.frequency)}
              </Text>
            </View>
          )}

          {item.incomeType === 'recurring' && item.dayOfMonth && (
            <View style={[styles.badge, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                Dia {item.dayOfMonth}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: theme.colors.errorLight }]}
        onPress={() => handleDeleteIncome(item.id, item.description)}
      >
        <Text style={[styles.deleteButtonText, { color: theme.colors.onError }]}>
          🗑️
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Receitas</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Gerenc gerencie suas receitas únicas e recorrentes
        </Text>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor:
                filterType === 'all' ? theme.colors.primary : theme.colors.surface,
            },
          ]}
          onPress={() => setFilterType('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              {
                color:
                  filterType === 'all' ? theme.colors.onPrimary : theme.colors.textSecondary,
              },
            ]}
          >
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor:
                filterType === 'single' ? theme.colors.primary : theme.colors.surface,
            },
          ]}
          onPress={() => setFilterType('single')}
        >
          <Text
            style={[
              styles.filterButtonText,
              {
                color:
                  filterType === 'single' ? theme.colors.onPrimary : theme.colors.textSecondary,
              },
            ]}
          >
            Únicas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor:
                filterType === 'recurring' ? theme.colors.primary : theme.colors.surface,
            },
          ]}
          onPress={() => setFilterType('recurring')}
        >
          <Text
            style={[
              styles.filterButtonText,
              {
                color:
                  filterType === 'recurring'
                    ? theme.colors.onPrimary
                    : theme.colors.textSecondary,
              },
            ]}
          >
            Recorrentes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de receitas */}
      <FlatList
        data={filteredIncomes}
        renderItem={renderIncomeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadIncomes}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Nenhuma receita cadastrada ainda.
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
              Toque no botão + para adicionar.
            </Text>
          </View>
        }
      />

      {/* Botão flutuante de adicionar */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.fabText, { color: theme.colors.onPrimary }]}>+</Text>
      </TouchableOpacity>

      {/* Modal de adicionar receita */}
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
                Nova Receita
              </Text>

              {/* Tipo de receita */}
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Tipo de Receita
              </Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        incomeType === 'single'
                          ? theme.colors.primary
                          : theme.colors.surface,
                    },
                  ]}
                  onPress={() => setIncomeType('single')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color:
                          incomeType === 'single'
                            ? theme.colors.onPrimary
                            : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    Única
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        incomeType === 'recurring'
                          ? theme.colors.primary
                          : theme.colors.surface,
                    },
                  ]}
                  onPress={() => setIncomeType('recurring')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color:
                          incomeType === 'recurring'
                            ? theme.colors.onPrimary
                            : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    Recorrente
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Descrição */}
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Descrição
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
                placeholder="Ex: Salário, Freelance, etc."
                placeholderTextColor={theme.colors.textTertiary}
                value={description}
                onChangeText={setDescription}
              />

              {/* Valor */}
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Valor</Text>
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
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />

              {/* Campos para receita recorrente */}
              {incomeType === 'recurring' && (
                <>
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                    Frequência
                  </Text>
                  <View style={styles.frequencyButtons}>
                    {['daily', 'weekly', 'biweekly', 'monthly', 'yearly'].map((freq) => (
                      <TouchableOpacity
                        key={freq}
                        style={[
                          styles.frequencyButton,
                          {
                            backgroundColor:
                              frequency === freq
                                ? theme.colors.secondary
                                : theme.colors.surface,
                          },
                        ]}
                        onPress={() => setFrequency(freq)}
                      >
                        <Text
                          style={[
                            styles.frequencyButtonText,
                            {
                              color:
                                frequency === freq
                                  ? theme.colors.onSecondary
                                  : theme.colors.textSecondary,
                            },
                          ]}
                        >
                          {getFrequencyLabel(freq)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {frequency === 'monthly' && (
                    <>
                      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                        Dia do Mês (1-31)
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
                        placeholder="Ex: 5"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={dayOfMonth}
                        onChangeText={setDayOfMonth}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </>
                  )}
                </>
              )}

              {/* Botões */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalButtonCancel,
                    { backgroundColor: theme.colors.surface },
                  ]}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: theme.colors.textSecondary }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalButtonSave,
                    { backgroundColor: theme.colors.success },
                  ]}
                  onPress={handleAddIncome}
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
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  incomeItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  incomeItemContent: {
    flex: 1,
  },
  incomeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incomeDescription: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  incomeItemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
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
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  frequencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  modalButtonCancel: {},
  modalButtonSave: {},
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IncomesScreen;

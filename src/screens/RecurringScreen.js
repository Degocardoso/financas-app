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
  Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getRecurringTransactions,
  addRecurringTransaction,
  deleteRecurringTransaction
} from '../services/transactionService';
import { useTheme } from '../context/ThemeContext';

export default function RecurringScreen({ navigation }) {
  const { theme } = useTheme();
  const [recurring, setRecurring] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    dayOfMonth: '1',
    startDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadRecurring();
  }, []);

  const loadRecurring = async () => {
    const result = await getRecurringTransactions();
    if (result.success) {
      setRecurring(result.recurring);
    }
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
      loadRecurring();
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  const handleDelete = (id, description) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir "${description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteRecurringTransaction(id);
            if (result.success) {
              loadRecurring();
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.colors.onPrimary }]}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onPrimary }]}>Lançamentos Futuros</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.infoCard, { backgroundColor: theme.colors.warningContainer }]}>
          <Text style={[styles.infoText, { color: theme.colors.onWarningContainer }]}>
            Cadastre receitas e despesas recorrentes (salário, aluguel, etc.)
            ou pontuais (IPVA, IPTU) para projetar seu saldo futuro.
          </Text>
        </View>

        {recurring.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Nenhum lançamento cadastrado.{'\n'}
            Clique no botão + para adicionar.
          </Text>
        ) : (
          recurring.map((item) => (
            <View key={item.id} style={[styles.recurringItem, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.recurringLeft}>
                <Text style={[styles.recurringDescription, { color: theme.colors.text }]}>
                  {item.description}
                </Text>
                <Text style={[styles.recurringInfo, { color: theme.colors.textSecondary }]}>
                  Todo dia {item.dayOfMonth} • Desde {formatDate(item.startDate)}
                </Text>
              </View>
              <View style={styles.recurringRight}>
                <Text style={[
                  styles.recurringAmount,
                  { color: item.amount >= 0 ? theme.colors.success : theme.colors.error }
                ]}>
                  {formatCurrency(item.amount)}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id, item.description)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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

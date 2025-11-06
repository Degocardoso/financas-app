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

export default function RecurringScreen({ navigation }) {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lançamentos Futuros</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Cadastre receitas e despesas recorrentes (salário, aluguel, etc.) 
            ou pontuais (IPVA, IPTU) para projetar seu saldo futuro.
          </Text>
        </View>

        {recurring.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhum lançamento cadastrado.{'\n'}
            Clique no botão + para adicionar.
          </Text>
        ) : (
          recurring.map((item) => (
            <View key={item.id} style={styles.recurringItem}>
              <View style={styles.recurringLeft}>
                <Text style={styles.recurringDescription}>
                  {item.description}
                </Text>
                <Text style={styles.recurringInfo}>
                  Todo dia {item.dayOfMonth} • Desde {formatDate(item.startDate)}
                </Text>
              </View>
              <View style={styles.recurringRight}>
                <Text style={[
                  styles.recurringAmount,
                  item.amount >= 0 ? styles.income : styles.expense
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
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Lançamento Recorrente</Text>

            <TextInput
              style={styles.input}
              placeholder="Descrição (ex: Salário)"
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Valor (use - para despesas)"
              value={formData.amount}
              onChangeText={(text) => setFormData({...formData, amount: text})}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Dia do mês (1-31)"
              value={formData.dayOfMonth}
              onChangeText={(text) => setFormData({...formData, dayOfMonth: text})}
              keyboardType="numeric"
            />

            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>Data de início: {formatDate(formData.startDate)}</Text>
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
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAdd}
              >
                <Text style={styles.buttonText}>Salvar</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 16,
    marginTop: 40,
  },
  recurringItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
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
    color: '#2c3e50',
    marginBottom: 5,
  },
  recurringInfo: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  recurringRight: {
    alignItems: 'flex-end',
  },
  recurringAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  income: {
    color: '#27ae60',
  },
  expense: {
    color: '#e74c3c',
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
    backgroundColor: '#3498db',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: {
    color: 'white',
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
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: '#f5f5f5',
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
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

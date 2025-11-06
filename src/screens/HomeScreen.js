// src/screens/HomeScreen.js
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
import { logout } from '../services/authService';
import { getCurrentBalance, getTransactions } from '../services/transactionService';

export default function HomeScreen({ navigation }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentBalance = await getCurrentBalance();
    setBalance(currentBalance);

    const result = await getTransactions();
    if (result.success) {
      setTransactions(result.transactions.slice(0, 10)); // Mostra últimas 10
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          onPress: async () => {
            await logout();
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
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finanças App</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.balanceCard, balance < 0 ? styles.negativeBalance : styles.positiveBalance]}>
        <Text style={styles.balanceLabel}>Saldo Atual</Text>
        <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
      </View>

      <View style={styles.menuGrid}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('Import')}
        >
          <Text style={styles.menuIcon}>📥</Text>
          <Text style={styles.menuText}>Importar{'\n'}Extrato</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('Recurring')}
        >
          <Text style={styles.menuIcon}>🔄</Text>
          <Text style={styles.menuText}>Lançamentos{'\n'}Futuros</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('Projection')}
        >
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuText}>Projeção de{'\n'}Saldo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Últimas Transações</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhuma transação encontrada.{'\n'}
            Importe um extrato para começar!
          </Text>
        ) : (
          transactions.map((transaction, index) => (
            <View key={index} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.date)}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                transaction.amount >= 0 ? styles.income : styles.expense
              ]}>
                {formatCurrency(transaction.amount)}
              </Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3498db',
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
  },
  balanceCard: {
    margin: 20,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  positiveBalance: {
    backgroundColor: '#27ae60',
  },
  negativeBalance: {
    backgroundColor: '#e74c3c',
  },
  balanceLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  balanceValue: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  menuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  menuButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '30%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  menuText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#2c3e50',
  },
  transactionsSection: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  transactionDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  income: {
    color: '#27ae60',
  },
  expense: {
    color: '#e74c3c',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 16,
    marginTop: 20,
  },
});

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
import { useTheme, THEME_MODES } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // getCurrentBalance agora retorna saldo UNIFICADO de todas as fontes
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

  const toggleTheme = () => {
    // Alterna entre claro e escuro (pula o sistema por simplicidade)
    setThemeMode(isDark ? THEME_MODES.LIGHT : THEME_MODES.DARK);
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>Finanças App</Text>
        <View style={styles.headerButtons}>
          {/* Botão de alternar tema */}
          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.themeButton}
          >
            <Text style={styles.themeButtonText}>
              {isDark ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout}>
            <Text style={[styles.logoutText, { color: theme.colors.onPrimary }]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[
        styles.balanceCard,
        { backgroundColor: balance < 0 ? theme.colors.error : theme.colors.success }
      ]}>
        <Text style={[styles.balanceLabel, { color: theme.colors.onPrimary }]}>Saldo Atual</Text>
        <Text style={[styles.balanceValue, { color: theme.colors.onPrimary }]}>{formatCurrency(balance)}</Text>
        <Text style={[styles.balanceHint, { color: theme.colors.onPrimary }]}>
          (inclui transações, receitas e despesas)
        </Text>
      </View>

      {/* Novos Recursos */}
      <View style={styles.menuGrid}>
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Incomes')}
        >
          <Text style={styles.menuIcon}>💰</Text>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Receitas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Expenses')}
        >
          <Text style={styles.menuIcon}>💳</Text>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Despesas{'\n'}Gerais</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('DailyBudget')}
        >
          <Text style={styles.menuIcon}>📆</Text>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Despesas{'\n'}Diárias</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.menuIcon}>📈</Text>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Dashboard</Text>
        </TouchableOpacity>
      </View>

      {/* Recursos Originais */}
      <View style={styles.menuGrid}>
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Import')}
        >
          <Text style={styles.menuIcon}>📥</Text>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Importar{'\n'}Extrato</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Recurring')}
        >
          <Text style={styles.menuIcon}>🔄</Text>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Lançamentos{'\n'}Futuros</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Projection')}
        >
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Projeção de{'\n'}Saldo</Text>
        </TouchableOpacity>
      </View>

      {/* Configurações */}
      <View style={styles.settingsSection}>
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
          <Text style={[styles.settingsText, { color: theme.colors.text }]}>Configurações</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Últimas Transações</Text>
        {transactions.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Nenhuma transação encontrada.{'\n'}
            Importe um extrato para começar!
          </Text>
        ) : (
          transactions.map((transaction, index) => (
            <View key={index} style={[styles.transactionItem, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.transactionLeft}>
                <Text style={[styles.transactionDescription, { color: theme.colors.text }]}>
                  {transaction.description}
                </Text>
                <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
                  {formatDate(transaction.date)}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.amount >= 0 ? theme.colors.success : theme.colors.error }
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  themeButton: {
    padding: 5,
  },
  themeButtonText: {
    fontSize: 24,
  },
  logoutText: {
    fontSize: 16,
  },
  balanceCard: {
    margin: 20,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  balanceHint: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.8,
  },
  menuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  menuButton: {
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
  },
  transactionsSection: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginBottom: 5,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  settingsSection: {
    padding: 20,
    paddingTop: 10,
  },
  settingsButton: {
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

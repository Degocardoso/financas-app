// src/screens/ProjectionScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { generateProjection, getBreakEvenMonth } from '../services/projectionService';
import { getCurrentBalance } from '../services/transactionService';
import ProjectionChart from '../components/ProjectionChart';
import { useTheme } from '../context/ThemeContext';

export default function ProjectionScreen({ navigation }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [projection, setProjection] = useState([]);
  const [breakEven, setBreakEven] = useState(null);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    loadProjection();
  }, [months]);

  const loadProjection = async () => {
    setLoading(true);

    const balance = await getCurrentBalance();
    setCurrentBalance(balance);

    const result = await generateProjection(months);
    if (result.success) {
      setProjection(result.projection);
    }

    const breakEvenResult = await getBreakEvenMonth();
    setBreakEven(breakEvenResult);

    setLoading(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getFinalBalance = () => {
    if (projection.length === 0) return 0;
    return projection[projection.length - 1].balance;
  };

  const getBalanceDifference = () => {
    return getFinalBalance() - currentBalance;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.colors.onPrimary }]}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onPrimary }]}>Projeção de Saldo</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Calculando projeção...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Card de Saldo Atual */}
          <View style={[
            styles.balanceCard,
            { backgroundColor: currentBalance < 0 ? theme.colors.error : theme.colors.success }
          ]}>
            <Text style={[styles.balanceLabel, { color: theme.colors.onPrimary }]}>Saldo Atual</Text>
            <Text style={[styles.balanceValue, { color: theme.colors.onPrimary }]}>{formatCurrency(currentBalance)}</Text>
          </View>

          {/* Seletor de Período */}
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                {
                  backgroundColor: months === 6 ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.primary
                }
              ]}
              onPress={() => setMonths(6)}
            >
              <Text style={[
                styles.periodButtonText,
                { color: months === 6 ? theme.colors.onPrimary : theme.colors.primary }
              ]}>
                6 meses
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                {
                  backgroundColor: months === 12 ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.primary
                }
              ]}
              onPress={() => setMonths(12)}
            >
              <Text style={[
                styles.periodButtonText,
                { color: months === 12 ? theme.colors.onPrimary : theme.colors.primary }
              ]}>
                12 meses
              </Text>
            </TouchableOpacity>
          </View>

          {/* Gráfico */}
          {projection.length > 0 && (
            <View style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
              <ProjectionChart projectionData={projection} />
            </View>
          )}

          {/* Card de Previsão Final */}
          <View style={[styles.predictionCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.predictionTitle, { color: theme.colors.textSecondary }]}>
              Previsão para {projection.length > 0 ? projection[projection.length - 1].month : ''}
            </Text>
            <Text style={[
              styles.predictionValue,
              { color: getFinalBalance() < 0 ? theme.colors.error : theme.colors.success }
            ]}>
              {formatCurrency(getFinalBalance())}
            </Text>
            <Text style={[styles.differenceText, { color: theme.colors.textSecondary }]}>
              {getBalanceDifference() >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(getBalanceDifference()))}
              {' '}em relação ao saldo atual
            </Text>
          </View>

          {/* Card de Break-Even */}
          {breakEven && !breakEven.alreadyPositive && breakEven.month && (
            <View style={[styles.breakEvenCard, { backgroundColor: theme.colors.warningContainer }]}>
              <Text style={[styles.breakEvenTitle, { color: theme.colors.text }]}>🎯 Meta de Saldo Positivo</Text>
              <Text style={[styles.breakEvenText, { color: theme.colors.text }]}>
                Seu saldo ficará positivo em {breakEven.month}
              </Text>
              <Text style={[styles.breakEvenSubtext, { color: theme.colors.textSecondary }]}>
                Faltam {breakEven.monthsUntil} {breakEven.monthsUntil === 1 ? 'mês' : 'meses'}!
              </Text>
            </View>
          )}

          {breakEven && breakEven.alreadyPositive && (
            <View style={[styles.breakEvenCard, { backgroundColor: theme.colors.successContainer }]}>
              <Text style={[styles.breakEvenTitle, { color: theme.colors.text }]}>✅ Parabéns!</Text>
              <Text style={[styles.breakEvenText, { color: theme.colors.text }]}>
                Seu saldo já está positivo!
              </Text>
            </View>
          )}

          {/* Lista de Projeções */}
          <View style={[styles.listCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.listTitle, { color: theme.colors.text }]}>Detalhamento Mensal</Text>
            {projection.map((item, index) => (
              <View key={index} style={[styles.listItem, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.listMonth, { color: theme.colors.text }]}>{item.month}</Text>
                <Text style={[
                  styles.listBalance,
                  { color: item.balance < 0 ? theme.colors.error : theme.colors.success }
                ]}>
                  {formatCurrency(item.balance)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  balanceCard: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 2,
  },
  periodButtonText: {
    fontSize: 16,
  },
  chartCard: {
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    elevation: 3,
  },
  predictionCard: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  predictionTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  predictionValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  differenceText: {
    fontSize: 14,
  },
  breakEvenCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  breakEvenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  breakEvenText: {
    fontSize: 16,
    marginBottom: 5,
  },
  breakEvenSubtext: {
    fontSize: 14,
  },
  listCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  listMonth: {
    fontSize: 16,
  },
  listBalance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

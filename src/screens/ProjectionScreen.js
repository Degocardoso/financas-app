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

export default function ProjectionScreen({ navigation }) {
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Projeção de Saldo</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Calculando projeção...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Card de Saldo Atual */}
          <View style={[styles.balanceCard, currentBalance < 0 ? styles.negative : styles.positive]}>
            <Text style={styles.balanceLabel}>Saldo Atual</Text>
            <Text style={styles.balanceValue}>{formatCurrency(currentBalance)}</Text>
          </View>

          {/* Seletor de Período */}
          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[styles.periodButton, months === 6 && styles.periodButtonActive]}
              onPress={() => setMonths(6)}
            >
              <Text style={[styles.periodButtonText, months === 6 && styles.periodButtonTextActive]}>
                6 meses
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, months === 12 && styles.periodButtonActive]}
              onPress={() => setMonths(12)}
            >
              <Text style={[styles.periodButtonText, months === 12 && styles.periodButtonTextActive]}>
                12 meses
              </Text>
            </TouchableOpacity>
          </View>

          {/* Gráfico */}
          {projection.length > 0 && (
            <View style={styles.chartCard}>
              <ProjectionChart projectionData={projection} />
            </View>
          )}

          {/* Card de Previsão Final */}
          <View style={styles.predictionCard}>
            <Text style={styles.predictionTitle}>
              Previsão para {projection.length > 0 ? projection[projection.length - 1].month : ''}
            </Text>
            <Text style={[
              styles.predictionValue,
              getFinalBalance() < 0 ? styles.negativeText : styles.positiveText
            ]}>
              {formatCurrency(getFinalBalance())}
            </Text>
            <Text style={styles.differenceText}>
              {getBalanceDifference() >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(getBalanceDifference()))} 
              {' '}em relação ao saldo atual
            </Text>
          </View>

          {/* Card de Break-Even */}
          {breakEven && !breakEven.alreadyPositive && breakEven.month && (
            <View style={styles.breakEvenCard}>
              <Text style={styles.breakEvenTitle}>🎯 Meta de Saldo Positivo</Text>
              <Text style={styles.breakEvenText}>
                Seu saldo ficará positivo em {breakEven.month}
              </Text>
              <Text style={styles.breakEvenSubtext}>
                Faltam {breakEven.monthsUntil} {breakEven.monthsUntil === 1 ? 'mês' : 'meses'}!
              </Text>
            </View>
          )}

          {breakEven && breakEven.alreadyPositive && (
            <View style={[styles.breakEvenCard, styles.positiveBreakEvenCard]}>
              <Text style={styles.breakEvenTitle}>✅ Parabéns!</Text>
              <Text style={styles.breakEvenText}>
                Seu saldo já está positivo!
              </Text>
            </View>
          )}

          {/* Lista de Projeções */}
          <View style={styles.listCard}>
            <Text style={styles.listTitle}>Detalhamento Mensal</Text>
            {projection.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listMonth}>{item.month}</Text>
                <Text style={[
                  styles.listBalance,
                  item.balance < 0 ? styles.negativeText : styles.positiveText
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
    color: '#7f8c8d',
  },
  balanceCard: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  positive: {
    backgroundColor: '#27ae60',
  },
  negative: {
    backgroundColor: '#e74c3c',
  },
  balanceLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  balanceValue: {
    color: 'white',
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
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#3498db',
  },
  periodButtonActive: {
    backgroundColor: '#3498db',
  },
  periodButtonText: {
    color: '#3498db',
    fontSize: 16,
  },
  periodButtonTextActive: {
    color: 'white',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    elevation: 3,
  },
  predictionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  predictionTitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  predictionValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  positiveText: {
    color: '#27ae60',
  },
  negativeText: {
    color: '#e74c3c',
  },
  differenceText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  breakEvenCard: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  positiveBreakEvenCard: {
    backgroundColor: '#d4edda',
  },
  breakEvenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  breakEvenText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  breakEvenSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  listCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  listMonth: {
    fontSize: 16,
    color: '#2c3e50',
  },
  listBalance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

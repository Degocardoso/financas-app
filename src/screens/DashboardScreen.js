// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LineChart, BarChart } from 'react-native-chart-kit';
import {
  getDashboardStats,
  getMonthlyForecast,
  getDailyCashFlowProjection,
} from '../services/dashboardService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DashboardScreen = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [monthlyForecast, setMonthlyForecast] = useState(null);
  const [cashFlowProjection, setCashFlowProjection] = useState([]);
  const [projectionMonths, setProjectionMonths] = useState(6);

  useEffect(() => {
    loadDashboardData();
  }, [projectionMonths]);

  const loadDashboardData = async () => {
    setLoading(true);

    // Carregar estatísticas
    const statsResult = await getDashboardStats();
    if (statsResult.success) {
      setStats(statsResult.stats);
    }

    // Carregar previsão mensal
    const now = new Date();
    const forecastResult = await getMonthlyForecast(now.getFullYear(), now.getMonth());
    if (forecastResult.success) {
      setMonthlyForecast(forecastResult.data);
    }

    // Carregar projeção de fluxo de caixa
    const projectionResult = await getDailyCashFlowProjection(projectionMonths);
    if (projectionResult.success) {
      setCashFlowProjection(projectionResult.data);
    }

    setLoading(false);
  };

  const StatCard = ({ title, value, color, subtitle }) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>
        {title}
      </Text>
      <Text style={[styles.statValue, { color: color || theme.colors.text }]}>
        {value}
      </Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: theme.colors.textTertiary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  // Preparar dados do gráfico de previsão mensal
  const getMonthlyChartData = () => {
    if (!monthlyForecast) {
      return {
        labels: ['Receitas', 'Despesas'],
        datasets: [{ data: [0, 0] }],
      };
    }

    return {
      labels: ['Receitas', 'Despesas'],
      datasets: [
        {
          data: [monthlyForecast.totalIncome, monthlyForecast.totalExpenses],
        },
      ],
    };
  };

  // Preparar dados do gráfico de fluxo de caixa
  const getCashFlowChartData = () => {
    if (cashFlowProjection.length === 0) {
      return {
        labels: [''],
        datasets: [{ data: [0] }],
      };
    }

    // Pegar uma amostra de dados (ex: a cada 7 dias)
    const sampleInterval = Math.ceil(cashFlowProjection.length / 10);
    const sampledData = cashFlowProjection.filter((_, index) => index % sampleInterval === 0);

    return {
      labels: sampledData.map((item) => {
        const date = new Date(item.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [
        {
          data: sampledData.map((item) => item.balance),
        },
      ],
    };
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={loadDashboardData}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Cards de Estatísticas */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Saldo Atual"
          value={`R$ ${stats?.currentBalance.toFixed(2) || '0.00'}`}
          color={
            stats?.currentBalance >= 0 ? theme.colors.success : theme.colors.error
          }
        />
        <StatCard
          title="Receitas Cadastradas"
          value={stats?.totalIncomes || 0}
          subtitle="receitas"
        />
        <StatCard
          title="Despesas Recorrentes"
          value={stats?.totalRecurring || 0}
          subtitle="despesas"
        />
        <StatCard
          title="Gastos do Mês"
          value={`R$ ${stats?.monthlyDailyExpenses.toFixed(2) || '0.00'}`}
          color={theme.colors.error}
        />
      </View>

      {/* Previsão Mensal */}
      {monthlyForecast && (
        <View style={[styles.chartSection, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            Previsão Mensal - {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </Text>

          <BarChart
            data={getMonthlyChartData()}
            width={SCREEN_WIDTH - 60}
            height={220}
            yAxisLabel="R$ "
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => theme.colors.text,
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 12,
              },
            }}
            style={styles.chart}
            showValuesOnTopOfBars={true}
          />

          <View style={styles.forecastSummary}>
            <View style={styles.forecastRow}>
              <Text style={[styles.forecastLabel, { color: theme.colors.textSecondary }]}>
                Total Receitas:
              </Text>
              <Text style={[styles.forecastValue, { color: theme.colors.success }]}>
                R$ {monthlyForecast.totalIncome.toFixed(2)}
              </Text>
            </View>
            <View style={styles.forecastRow}>
              <Text style={[styles.forecastLabel, { color: theme.colors.textSecondary }]}>
                Total Despesas:
              </Text>
              <Text style={[styles.forecastValue, { color: theme.colors.error }]}>
                R$ {monthlyForecast.totalExpenses.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.forecastDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.forecastRow}>
              <Text style={[styles.forecastLabel, { color: theme.colors.text, fontWeight: '700' }]}>
                Saldo Previsto:
              </Text>
              <Text
                style={[
                  styles.forecastValue,
                  styles.forecastBalance,
                  {
                    color: monthlyForecast.isPositive
                      ? theme.colors.success
                      : theme.colors.error,
                  },
                ]}
              >
                R$ {monthlyForecast.balance.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Projeção de Fluxo de Caixa */}
      {cashFlowProjection.length > 0 && (
        <View style={[styles.chartSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              Projeção de Fluxo de Caixa
            </Text>
            <View style={styles.periodButtons}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  projectionMonths === 6 && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                onPress={() => setProjectionMonths(6)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    {
                      color:
                        projectionMonths === 6
                          ? theme.colors.onPrimary
                          : theme.colors.textSecondary,
                    },
                  ]}
                >
                  6 meses
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  projectionMonths === 12 && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                onPress={() => setProjectionMonths(12)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    {
                      color:
                        projectionMonths === 12
                          ? theme.colors.onPrimary
                          : theme.colors.textSecondary,
                    },
                  ]}
                >
                  12 meses
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <LineChart
            data={getCashFlowChartData()}
            width={SCREEN_WIDTH - 60}
            height={220}
            yAxisLabel="R$ "
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              labelColor: (opacity = 1) => theme.colors.text,
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 10,
              },
            }}
            bezier
            style={styles.chart}
          />

          <Text style={[styles.chartDescription, { color: theme.colors.textSecondary }]}>
            Projeção baseada em receitas, despesas e orçamento diário.
          </Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Carregando...
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    padding: 16,
    borderRadius: 12,
  },
  statTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  chartSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartDescription: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  forecastSummary: {
    marginTop: 16,
    gap: 8,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forecastLabel: {
    fontSize: 14,
  },
  forecastValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  forecastBalance: {
    fontSize: 18,
  },
  forecastDivider: {
    height: 1,
    marginVertical: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
  },
});

export default DashboardScreen;

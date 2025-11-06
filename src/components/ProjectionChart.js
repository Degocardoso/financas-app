// src/components/ProjectionChart.js
import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function ProjectionChart({ projectionData }) {
  const screenWidth = Dimensions.get('window').width;

  if (!projectionData || projectionData.length === 0) {
    return null;
  }

  const chartData = {
    labels: projectionData.map(item => item.month),
    datasets: [
      {
        data: projectionData.map(item => item.balance),
        color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
        strokeWidth: 3,
      }
    ],
    legend: ['Saldo Projetado']
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3498db'
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // solid background lines
      stroke: '#e0e0e0'
    }
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        fromZero={false}
        segments={4}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  chart: {
    borderRadius: 16,
  }
});

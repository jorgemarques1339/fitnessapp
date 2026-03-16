import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface TonnageChartProps {
  title: string;
  labels: string[]; // e.g. ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4']
  data: number[];   // e.g. [12000, 12500, 13200, 14000]
}

export default function TonnageChart({ title, labels, data }: TonnageChartProps) {
  const { width } = useWindowDimensions();
  // Safe max width based on Dashboard architecture
  const contentMaxWidth = 768;
  // Account for container padding left&right 24px each (48px total)
  const chartWidth = Math.min(width - 48, contentMaxWidth - 48);

  // Simple check to avoid crashing if empty
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: data,
            }
          ]
        }}
        width={chartWidth}
        height={220}
        yAxisLabel=""
        yAxisSuffix="k"
        yAxisInterval={1} 
        chartConfig={{
          backgroundColor: '#0A0A0A',
          backgroundGradientFrom: '#151515',
          backgroundGradientTo: '#151515',
          decimalPlaces: 1, // e.g. 14.5k
          color: (opacity = 1) => `rgba(229, 57, 53, ${opacity})`, // The Premium Red
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#0A0A0A"
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    backgroundColor: '#151515',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 5,
    marginLeft: 10,
    textTransform: 'uppercase',
  }
});

import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { theme } from '../theme/theme';
import SimpleWebChart from './common/SimpleWebChart';

interface TonnageChartProps {
  title: string;
  labels: string[];
  data: number[];
}

export default function TonnageChart({ title, labels, data }: TonnageChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((val, i) => ({
    x: i,
    y: val,
  }));

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const chartHeight = isSmallScreen ? 180 : 220;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={{ height: chartHeight, marginTop: 10 }}>
        <SimpleWebChart 
          data={chartData}
          labels={labels}
          height={chartHeight}
          ySuffix="k"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.radii.lg,
    padding: theme.spacing.cardPadding,
    ...theme.shadows.soft,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.bold,
    marginBottom: 5,
    marginLeft: 10,
    textTransform: 'uppercase',
  }
});

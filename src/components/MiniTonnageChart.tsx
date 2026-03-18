import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface MiniTonnageChartProps {
  data: number[]; // Tonnage in tons
}

export default function MiniTonnageChart({ data }: MiniTonnageChartProps) {
  const theme = useAppTheme();
  
  const maxVal = Math.max(...data, 0.1);
  const lastVal = data[data.length - 1] || 0;
  const prevVal = data[data.length - 2] || 0;
  const isUp = lastVal >= prevVal;
  const diffPercent = prevVal > 0 ? Math.round(((lastVal - prevVal) / prevVal) * 100) : 0;

  return (
    <BlurView 
      intensity={theme.isDark ? 20 : 40} 
      tint={theme.isDark ? "dark" : "light"} 
      style={[styles.container, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>TENDÊNCIA DE CARGA</Text>
          <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{lastVal.toFixed(1)}t</Text>
        </View>
        <View style={[styles.trendBadge, { backgroundColor: isUp ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 51, 102, 0.1)' }]}>
          {isUp ? <TrendingUp size={12} color="#00E676" /> : <TrendingDown size={12} color="#FF3366" />}
          <Text style={[styles.trendText, { color: isUp ? '#00E676' : '#FF3366' }]}>
            {isUp ? '+' : ''}{diffPercent}%
          </Text>
        </View>
      </View>

      <View style={styles.chartArea}>
        {data.map((val, i) => (
          <View key={i} style={styles.barContainer}>
            <View 
              style={[
                styles.bar, 
                { 
                  height: `${Math.max(10, (val / maxVal) * 100)}%`, 
                  backgroundColor: i === data.length - 1 ? theme.colors.secondary : theme.colors.textMuted,
                  opacity: i === data.length - 1 ? 1 : 0.3
                }
              ]} 
            />
          </View>
        ))}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: 8,
  },
  barContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
});

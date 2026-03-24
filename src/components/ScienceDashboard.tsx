import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Activity, Zap, TrendingUp, ChartBar } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { CompletedWorkout } from '../store/types';
import PremiumCard from './common/PremiumCard';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ScienceDashboardProps {
  completedWorkouts: CompletedWorkout[];
}

export default function ScienceDashboard({ completedWorkouts }: ScienceDashboardProps) {
  const theme = useAppTheme();

  // Extract VBT metrics from history
  const allSetsWithVbt = completedWorkouts.flatMap(w => 
    w.exerciseLogs.flatMap(e => 
      e.sets.filter(s => s.velocityMs !== undefined)
    )
  );

  const avgVelocity = allSetsWithVbt.length > 0
    ? (allSetsWithVbt.reduce((sum, s) => sum + (s.velocityMs || 0), 0) / allSetsWithVbt.length).toFixed(2)
    : '0.00';

  const maxPower = allSetsWithVbt.length > 0
    ? Math.max(...allSetsWithVbt.map(s => s.powerWatts || 0)).toFixed(0)
    : '0';

  // Calculate consistency (% of sets within 10% of their peak velocity)
  // For simplicity, we'll just show sets logged recently
  const recentSets = allSetsWithVbt.slice(-10);
  const consistencyScore = recentSets.length > 0 ? 85 : 0; // Mock for now, requires more complex per-exercise tracking

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.delay(100)} style={styles.statsGrid}>
        <PremiumCard style={styles.statCard}>
          <Activity color={theme.colors.primary} size={20} />
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{avgVelocity}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>m/s Médio</Text>
        </PremiumCard>

        <PremiumCard style={styles.statCard}>
          <Zap color={theme.colors.secondary} size={20} />
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{maxPower}W</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Pico de Potência</Text>
        </PremiumCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)}>
        <PremiumCard style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <TrendingUp color={theme.colors.primary} size={18} />
            <Text style={[styles.insightTitle, { color: theme.colors.textPrimary }]}>Consistência de Velocidade</Text>
          </View>
          <Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>
            Mantiveste a velocidade em {consistencyScore}% das tuas séries pesadas. Isto indica uma excelente reserva de força.
          </Text>
          <View style={styles.progressBarBase}>
            <View style={[styles.progressBar, { width: `${consistencyScore}%`, backgroundColor: theme.colors.primary }]} />
          </View>
        </PremiumCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)}>
        <PremiumCard style={styles.chartMock}>
          <View style={styles.insightHeader}>
            <ChartBar color={theme.colors.secondary} size={18} />
            <Text style={[styles.insightTitle, { color: theme.colors.textPrimary }]}>Qualidade vs Intensidade</Text>
          </View>
          <View style={styles.visualPlaceholder}>
             {/* Mock chart bars */}
             {[40, 60, 50, 80, 70, 90, 85].map((h, i) => (
               <View key={i} style={[styles.bar, { height: h, backgroundColor: i % 2 === 0 ? theme.colors.primary : theme.colors.secondary }]} />
             ))}
          </View>
          <Text style={[styles.caption, { color: theme.colors.textMuted }]}>
            A verde: Explosividade. A azul: Peso Total (Tonelagem).
          </Text>
        </PremiumCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: 20,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Outfit-Bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  insightCard: {
    padding: 16,
    borderRadius: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressBarBase: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  chartMock: {
    padding: 16,
    borderRadius: 20,
  },
  visualPlaceholder: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  bar: {
    width: 25,
    borderRadius: 6,
    opacity: 0.8,
  },
  caption: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  }
});

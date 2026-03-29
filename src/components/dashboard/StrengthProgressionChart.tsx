import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CompletedWorkout } from '../../store/types';
import { useAppTheme } from '../../hooks/useAppTheme';

interface StrengthProgressionChartProps {
  completedWorkouts: CompletedWorkout[];
}

export default function StrengthProgressionChart({ completedWorkouts }: StrengthProgressionChartProps) {
  const theme = useAppTheme();

  // Find the top 3 most frequently performed exercises for tracking 1RM
  const topExercises = useMemo(() => {
    const counts: Record<string, { id: string, name: string, count: number, max1RM: number }> = {};
    
    completedWorkouts.forEach(workout => {
      workout.exerciseLogs.forEach(log => {
        if (!counts[log.exerciseId]) {
          counts[log.exerciseId] = { id: log.exerciseId, name: log.exerciseName, count: 0, max1RM: 0 };
        }
        counts[log.exerciseId].count++;
        
        // Calculate 1RM (Epley formula: W * (1 + R/30))
        log.sets.forEach(set => {
          if (set.weightKg && set.reps) {
            const w = typeof set.weightKg === 'string' ? parseFloat(set.weightKg) : set.weightKg;
            const r = typeof set.reps === 'string' ? parseInt(set.reps, 10) : set.reps;
            if (!isNaN(w) && !isNaN(r)) {
              const oneRM = w * (1 + r / 30);
              if (oneRM > counts[log.exerciseId].max1RM) {
                counts[log.exerciseId].max1RM = oneRM;
              }
            }
          }
        });
      });
    });

    return Object.values(counts)
      .filter(ex => ex.max1RM > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [completedWorkouts]);

  if (topExercises.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.headerText, { color: theme.colors.textMuted }]}>Força Bruta (1RM Estimado)</Text>
      
      <View style={styles.list}>
        {topExercises.map((ex, index) => (
          <View key={ex.id} style={[styles.row, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={styles.exInfo}>
              <Text style={[styles.exName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {ex.name}
              </Text>
              <Text style={[styles.exLabel, { color: theme.colors.textMuted }]}>
                Mais Frequente
              </Text>
            </View>
            <View style={styles.rmBox}>
              <Text style={[styles.rmValue, { color: '#38BDF8' }]}>
                {Math.round(ex.max1RM)}<Text style={{ fontSize: 12 }}>kg</Text>
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
  exInfo: {
    flex: 1,
  },
  exName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  exLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  rmBox: {
    backgroundColor: 'rgba(56,189,248,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
  },
  rmValue: {
    fontSize: 16,
    fontWeight: '900',
  }
});

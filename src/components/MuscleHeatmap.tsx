import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { CompletedWorkout, ExerciseLog } from '../store/useWorkoutStore';
import { EXERCISE_DATABASE, MuscleGroup } from '../data/exercises';
import { theme } from '../theme/theme';
import { useAppTheme } from '../hooks/useAppTheme';

interface MuscleHeatmapProps {
  completedWorkouts: CompletedWorkout[];
}

interface MuscleVolume {
  muscle: MuscleGroup;
  volume: number;
}

export default function MuscleHeatmap({ completedWorkouts }: MuscleHeatmapProps) {
  const theme = useAppTheme();
  const muscleVolumes = useMemo(() => {
    const volumes: Record<MuscleGroup, number> = {
      Chest: 0,
      Back: 0,
      Shoulders: 0,
      Biceps: 0,
      Triceps: 0,
      Quads: 0,
      Hamstrings: 0,
      Glutes: 0,
      Calves: 0,
      Core: 0,
    };

    // Only consider workouts from the last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentWorkouts = completedWorkouts.filter(w => parseInt(w.id) > thirtyDaysAgo);

    recentWorkouts.forEach(workout => {
      workout.exerciseLogs.forEach(log => {
        const exercise = EXERCISE_DATABASE.find(e => e.id === log.exerciseId);
        if (exercise && exercise.category) {
          const muscle = exercise.category;
          log.sets.forEach(set => {
            const weight = parseFloat(set.weightKg) || 0;
            const reps = parseInt(set.reps, 10) || 0;
            volumes[muscle] += weight * reps;
          });
        }
      });
    });

    return Object.entries(volumes)
      .map(([muscle, volume]) => ({ muscle: muscle as MuscleGroup, volume }))
      .sort((a, b) => b.volume - a.volume);
  }, [completedWorkouts]);

  const maxVolume = Math.max(...muscleVolumes.map(mv => mv.volume)) || 1;

  const getMuscleTranslation = (m: MuscleGroup): string => {
    const map: Record<MuscleGroup, string> = {
      Chest: 'Peito',
      Back: 'Costas',
      Shoulders: 'Ombros',
      Biceps: 'Bíceps',
      Triceps: 'Tríceps',
      Quads: 'Quadríceps',
      Hamstrings: 'Isquiotibiais',
      Glutes: 'Glúteos',
      Calves: 'Gémeos',
      Core: 'Core',
    };
    return map[m];
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>Volume de treino acumulado nos últimos 30 dias (KG).</Text>
      
      {muscleVolumes.map((mv, i) => {
        const percentage = (mv.volume / maxVolume) * 100;
        const isActive = mv.volume > 0;

        return (
          <View key={mv.muscle} style={styles.muscleRow}>
            <View style={styles.labelRow}>
              <Text style={[styles.muscleName, { color: theme.colors.textPrimary }, !isActive && { color: theme.colors.textMuted, opacity: 0.5 }]}>
                {getMuscleTranslation(mv.muscle)}
              </Text>
              <Text style={[styles.volumeText, { color: theme.colors.textPrimary }, !isActive && { color: theme.colors.textMuted, opacity: 0.5 }]}>
                {mv.volume.toLocaleString('pt-PT')} <Text style={[styles.kgLabel, { color: theme.colors.textMuted }]}>kg</Text>
              </Text>
            </View>
            
            <View style={[styles.track, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
              <View 
                style={[
                  styles.progress, 
                  { 
                    width: `${Math.max(percentage, 2)}%`,
                    backgroundColor: isActive ? theme.colors.primary : (theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')
                  }
                ]} 
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  sectionDesc: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  muscleRow: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  muscleName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.md,
  },
  volumeText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fonts.black,
    fontSize: theme.typography.sizes.md,
  },
  kgLabel: {
      fontSize: 10,
      color: theme.colors.textMuted,
  },
  mutedText: {
    color: theme.colors.textMuted,
    opacity: 0.5,
  },
  track: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
});

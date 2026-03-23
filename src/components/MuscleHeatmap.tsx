import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CompletedWorkout, ExerciseLog } from '../store/useWorkoutStore';
import { MuscleGroup } from '../data/exercises';
import { useAllExercises } from '../utils/exerciseSelectors';
import { useAppTheme } from '../hooks/useAppTheme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

const ALLEX = useAllExercises();

interface MuscleHeatmapProps {
  completedWorkouts: CompletedWorkout[];
}

export default function MuscleHeatmap({ completedWorkouts }: MuscleHeatmapProps) {
  const theme = useAppTheme();
  
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

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

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentWorkouts = completedWorkouts.filter(w => parseInt(w.id) > thirtyDaysAgo);

    recentWorkouts.forEach(workout => {
      workout.exerciseLogs.forEach(log => {
        const exercise = ALLEX.find(e => e.id === log.exerciseId);
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
        const isCritical = percentage > 70;

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
              <AnimatedProgress 
                percentage={percentage}
                isActive={isActive}
                isCritical={isCritical}
                pulse={pulse}
                theme={theme}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function AnimatedProgress({ percentage, isActive, isCritical, pulse, theme }: any) {
  const animatedStyle = useAnimatedStyle(() => {
    if (!isCritical) return {};
    return {
      opacity: pulse.value,
    };
  });

  return (
    <Animated.View 
      style={[
        styles.progress, 
        { 
          width: `${Math.max(percentage, 2)}%`,
          backgroundColor: isActive ? theme.colors.primary : (theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')
        },
        isCritical && animatedStyle
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  sectionDesc: {
    fontSize: 12,
    marginBottom: 20,
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
    fontWeight: '700',
    fontSize: 14,
  },
  volumeText: {
    fontWeight: '900',
    fontSize: 14,
  },
  kgLabel: {
      fontSize: 10,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
});

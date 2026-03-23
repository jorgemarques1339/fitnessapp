import { CompletedWorkout } from '../store/useWorkoutStore';
import { EXERCISE_DATABASE, MuscleGroup } from '../data/exercises';
import { getAllExercisesStatic } from './exerciseSelectors';

export interface MuscleVolume {
  muscle: MuscleGroup;
  sets: number;
}

export interface RecoveryScore {
  muscle: MuscleGroup;
  score: number; // 0 to 100
  status: 'fully_recovered' | 'partially_recovered' | 'fatigued';
}

export const getMuscleVolumeLast30Days = (workouts: CompletedWorkout[]): MuscleVolume[] => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const volumeMap: Record<string, number> = {
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

  workouts.forEach(workout => {
    if (new Date(workout.date) >= thirtyDaysAgo) {
      workout.exerciseLogs.forEach(log => {
        const exercise = EXERCISE_DATABASE.find(e => e.id === log.exerciseId);
        if (exercise && exercise.category) {
          volumeMap[exercise.category] += log.sets.length;
        }
      });
    }
  });

  return Object.entries(volumeMap).map(([muscle, sets]) => ({
    muscle: muscle as MuscleGroup,
    sets,
  }));
};

export const getUnderTrainedMuscles = (workouts: CompletedWorkout[]): MuscleGroup[] => {
  const volumes = getMuscleVolumeLast30Days(workouts);
  
  // Filter out muscles with 0 volume (maybe they don't train them at all?)
  // But actually, those are the ones that NEED training the most.
  // We'll look for muscles with significantly lower volume than the average of top 3.
  const sorted = [...volumes].sort((a, b) => b.sets - a.sets);
  const topThreeAvg = (sorted[0].sets + sorted[1].sets + sorted[2].sets) / 3;

  if (topThreeAvg === 0) return [];

  // Muscles with less than 30% of the top average are considered "Under-trained"
  return volumes
    .filter(v => v.sets < topThreeAvg * 0.3)
    .map(v => v.muscle);
};

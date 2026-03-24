import { CompletedWorkout, ExerciseLog } from '../store/useWorkoutStore';
import { getAllExercisesStatic } from './exerciseSelectors';

export interface MuscleFatigue {
  muscle: string;
  status: 'Ready' | 'Recovering' | 'Fatigued';
  recoveryPercent: number; // 0 to 100
  lastTrained: Date | null;
}

/**
 * Calculates recovery state for all muscle groups based on recent history.
 */
export function calculateMuscleFatigue(workouts: CompletedWorkout[]): MuscleFatigue[] {
  const muscles = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
    'Quads', 'Hamstrings', 'Glutes', 'Calves'
  ];

  const result: MuscleFatigue[] = muscles.map(m => ({
    muscle: m,
    status: 'Ready',
    recoveryPercent: 100,
    lastTrained: null
  }));

  const now = new Date();

  workouts.forEach(workout => {
    const workoutDate = new Date(workout.date);
    const hoursAgo = (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60);

    if (hoursAgo > 96) return;

    workout.exerciseLogs.forEach(log => {
      const ex = getAllExercisesStatic().find(e => e.id === log.exerciseId);
      if (!ex) return;

      const affects = [ex.category, ...(ex.secondaryMuscles || [])];
      
      affects.forEach((muscle, index) => {
        const state = result.find(r => r.muscle === muscle);
        if (!state) return;

        if (!state.lastTrained || workoutDate > state.lastTrained) {
          state.lastTrained = workoutDate;
        }

        const intensityWeight = index === 0 ? 1 : 0.5;
        const numSets = log.sets.length;
        const avgRpe = log.sets.reduce((sum, s) => sum + (parseFloat(s.rpe || '8') || 8), 0) / numSets;
        
        const hoursRemaining = Math.max(0, 72 - hoursAgo);
        const decayFactor = hoursRemaining / 72;
        const fatigueAdded = (numSets * 0.12) * (avgRpe / 8) * intensityWeight * decayFactor;

        state.recoveryPercent = Math.max(0, Math.min(100, state.recoveryPercent - (fatigueAdded * 100)));
      });
    });
  });

  return result.map(m => ({
    ...m,
    recoveryPercent: Math.round(m.recoveryPercent),
    status: (m.recoveryPercent > 80 ? 'Ready' : m.recoveryPercent > 40 ? 'Recovering' : 'Fatigued') as MuscleFatigue['status']
  })).sort((a, b) => a.recoveryPercent - b.recoveryPercent);
}

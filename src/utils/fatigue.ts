import { CompletedWorkout } from '../store/useWorkoutStore';
import { MuscleGroup, EXERCISE_DATABASE } from '../data/exercises';

export interface MuscleFatigue {
  muscle: MuscleGroup;
  status: 'Ready' | 'Recovering' | 'Fatigued';
  recoveryPercent: number; // 0 to 100
  lastWorked: string | null;
}

const RECOVERY_TIME_HOURS = 72; // Full recovery in 3 days

export function calculateMuscleFatigue(completedWorkouts: CompletedWorkout[]): MuscleFatigue[] {
  const muscles: MuscleGroup[] = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
    'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'
  ];

  const fatigueMap: Record<MuscleGroup, MuscleFatigue> = muscles.reduce((acc, muscle) => {
    acc[muscle] = {
      muscle,
      status: 'Ready',
      recoveryPercent: 100,
      lastWorked: null
    };
    return acc;
  }, {} as Record<MuscleGroup, MuscleFatigue>);

  // Sort workouts by date descending
  const sortedWorkouts = [...completedWorkouts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const now = new Date().getTime();

  muscles.forEach(muscle => {
    // Find the last time this muscle was worked
    const lastWorkoutWithMuscle = sortedWorkouts.find(w => 
      w.exerciseLogs?.some(log => {
        const exercise = EXERCISE_DATABASE.find(e => e.id === log.exerciseId);
        return exercise?.category === muscle;
      })
    );

    if (lastWorkoutWithMuscle) {
      const lastDate = new Date(lastWorkoutWithMuscle.date).getTime();
      const hoursSince = (now - lastDate) / (1000 * 60 * 60);
      
      let recovery = Math.min(100, (hoursSince / RECOVERY_TIME_HOURS) * 100);
      
      fatigueMap[muscle].lastWorked = lastWorkoutWithMuscle.date;
      fatigueMap[muscle].recoveryPercent = Math.round(recovery);

      if (recovery < 40) {
        fatigueMap[muscle].status = 'Fatigued';
      } else if (recovery < 95) {
        fatigueMap[muscle].status = 'Recovering';
      } else {
        fatigueMap[muscle].status = 'Ready';
      }
    }
  });

  return Object.values(fatigueMap);
}

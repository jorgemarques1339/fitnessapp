import { CompletedWorkout, ExerciseLog } from '../store/useWorkoutStore';
import { EXERCISE_DATABASE } from '../data/exercises';
import { calculateEpley1RM } from './math';
import { calculateMuscleFatigue } from './fatigue';

export interface PRPrediction {
  exerciseId: string;
  exerciseName: string;
  predicted1RM: number;
  currentBest1RM: number;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export interface DynamicRPEAdvice {
  muscle: string;
  musclePt: string;
  advice: 'increase_load' | 'increase_reps' | 'maintain' | 'rest';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

const MUSCLE_NAMES_PT: Record<string, string> = {
  Chest: 'Peito', Back: 'Costas', Shoulders: 'Ombros',
  Biceps: 'Bíceps', Triceps: 'Tríceps', Quads: 'Quadríceps',
  Hamstrings: 'Isquios', Glutes: 'Glúteos', Calves: 'Gémeos', Core: 'Core',
};

/**
 * Detects exercises where the user is potentially ready for a new PR attempt.
 */
export function getPRPredictions(completedWorkouts: CompletedWorkout[]): PRPrediction[] {
  if (completedWorkouts.length < 3) return [];

  const fatigueData = calculateMuscleFatigue(completedWorkouts);
  const fatigueMap: Record<string, number> = {};
  fatigueData.forEach(f => { fatigueMap[f.muscle] = 100 - f.recoveryPercent; });

  const predictions: PRPrediction[] = [];
  const exerciseHistory: Record<string, number[]> = {};

  // Group 1RM history by exercise
  completedWorkouts.forEach(workout => {
    workout.exerciseLogs.forEach(log => {
      let best1RM = 0;
      log.sets.forEach(s => {
        const w = parseFloat(s.weightKg) || 0;
        const r = parseInt(s.reps, 10) || 0;
        if (r > 0) {
          const rm = calculateEpley1RM(w, r);
          if (rm > best1RM) best1RM = rm;
        }
      });
      if (best1RM > 0) {
        if (!exerciseHistory[log.exerciseId]) exerciseHistory[log.exerciseId] = [];
        exerciseHistory[log.exerciseId].push(best1RM);
      }
    });
  });

  Object.entries(exerciseHistory).forEach(([id, history]) => {
    if (history.length < 3) return;

    const recent = history.slice(-3); // Last 3 sessions
    const oldest = recent[0];
    const middle = recent[1];
    const newest = recent[2];

    // Progression trend: check if increasing or stable
    const isProgressing = (newest >= middle && middle >= oldest) || (newest > oldest * 1.03);
    
    if (isProgressing) {
      const dbEx = EXERCISE_DATABASE.find(e => e.id === id);
      const category = dbEx?.category as string;
      const fatigue = fatigueMap[category] ?? 0;

      // Ready for PR if fatigue is low and trend is up
      if (fatigue < 15) {
        const currentBest = Math.max(...history);
        const predictedPossible = Math.round(newest * 1.025); // Target 2.5% increase

        predictions.push({
          exerciseId: id,
          exerciseName: dbEx?.name || 'Exercício',
          predicted1RM: predictedPossible,
          currentBest1RM: Math.round(currentBest),
          confidence: fatigue < 5 ? 'high' : 'medium',
          reason: `Progressão consistente e fadiga baixa (${Math.round(fatigue)}%) detectada para ${category}.`
        });
      }
    }
  });

  return predictions.sort((a, b) => b.predicted1RM - a.predicted1RM).slice(0, 2);
}

/**
 * Suggests load/RPE adjustments based on weekly volume and recent session intensity.
 */
export function getDynamicRPEAdvice(completedWorkouts: CompletedWorkout[]): DynamicRPEAdvice[] {
  if (completedWorkouts.length < 1) return [];

  const fatigueData = calculateMuscleFatigue(completedWorkouts);
  const adviceList: DynamicRPEAdvice[] = [];

  // Get volume for the last 7 days
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentWorkouts = completedWorkouts.filter(w => new Date(w.date).getTime() > weekAgo);

  const muscleSets: Record<string, number> = {};
  recentWorkouts.forEach(w => {
    w.exerciseLogs.forEach(log => {
      const dbEx = EXERCISE_DATABASE.find(e => e.id === log.exerciseId);
      if (dbEx) {
        const category = dbEx.category as string;
        muscleSets[category] = (muscleSets[category] ?? 0) + log.sets.length;
      }
    });
  });

  Object.entries(muscleSets).forEach(([muscle, sets]) => {
    const fatigue = 100 - (fatigueData.find(f => f.muscle === muscle)?.recoveryPercent ?? 100);
    
    // Hypertrophy zone: 10-20 sets per week
    if (sets < 8 && fatigue < 10) {
      adviceList.push({
        muscle,
        musclePt: MUSCLE_NAMES_PT[muscle] || muscle,
        advice: 'increase_load',
        message: `Volume de ${MUSCLE_NAMES_PT[muscle] || muscle} está baixo (${sets} séries). Tenta aumentar a carga ou fazer +2 reps para estimular hipertrofia.`,
        priority: 'medium'
      });
    } else if (sets > 22 && fatigue > 40) {
      adviceList.push({
        muscle,
        musclePt: MUSCLE_NAMES_PT[muscle] || muscle,
        advice: 'rest',
        message: `Volume excessivo de ${MUSCLE_NAMES_PT[muscle] || muscle} (${sets} séries). Fadiga acumulada pode prejudicar ganhos. Considera reduzir 2 séries.`,
        priority: 'high'
      });
    }
  });

  return adviceList.sort((a, b) => {
    const prioMap = { high: 3, medium: 2, low: 1 };
    return prioMap[b.priority] - prioMap[a.priority];
  }).slice(0, 3);
}

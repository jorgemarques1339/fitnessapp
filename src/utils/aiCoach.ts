/**
 * aiCoach.ts
 * 
 * Central AI coaching engine providing three intelligent systems:
 * 1. WORKOUT RECOMMENDATION — best routine for today based on muscle recovery
 * 2. INTELLIGENT DELOAD DETECTION — stagnation-based (not fixed 5-week cycle)
 * 3. VOLUME ADJUSTMENT — per-muscle increase/decrease suggestions based on progression rate
 */

import { CompletedWorkout } from '../store/useWorkoutStore';
import { RoutineDef } from '../data/routines';
import { EXERCISE_DATABASE } from '../data/exercises';
import { getAllExercisesStatic } from './exerciseSelectors';
import { calculateMuscleFatigue } from './fatigue';
import { calculateEpley1RM } from './math';
import { getWorkoutsForWeek, getWeekStart } from './weeklyStats';

// ─────────────────────────────────────────────────────────────────────────────
// Feature 1: Daily Workout Recommendation
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkoutRecommendation {
  bestRoutine: RoutineDef | null;
  reason: string;
  recoverySnapshot: { muscle: string; pct: number }[];
  fatiguredMuscleNames: string[];
}

const MUSCLE_NAMES_PT: Record<string, string> = {
  Chest: 'Peito', Back: 'Costas', Shoulders: 'Ombros',
  Biceps: 'Bíceps', Triceps: 'Tríceps', Quads: 'Quadríceps',
  Hamstrings: 'Isquios', Glutes: 'Glúteos', Calves: 'Gémeos', Core: 'Core',
};

function getMusclesForRoutine(routine: RoutineDef): string[] {
  const muscles = new Set<string>();
  routine.exercises.forEach(ex => {
    if (ex.category) muscles.add(ex.category);
  });
  return [...muscles];
}

export function getWorkoutRecommendation(
  completedWorkouts: CompletedWorkout[],
  availableRoutines: RoutineDef[]
): WorkoutRecommendation {
  const fatigueData = calculateMuscleFatigue(completedWorkouts);
  const recoveryMap: Record<string, number> = {};
  fatigueData.forEach(f => { recoveryMap[f.muscle] = f.recoveryPercent; });

  const fatiguedMuscles = fatigueData
    .filter(f => f.status === 'Fatigued' || f.status === 'Recovering')
    .map(f => f.muscle);

  // Score each routine: higher score = muscles are more recovered
  const scored = availableRoutines.map(routine => {
    const muscles = getMusclesForRoutine(routine);
    const avgRecovery = muscles.length > 0
      ? muscles.reduce((sum, m) => sum + (recoveryMap[m] ?? 100), 0) / muscles.length
      : 100;
    return { routine, avgRecovery, muscles };
  });

  scored.sort((a, b) => b.avgRecovery - a.avgRecovery);
  const best = scored[0];

  if (!best) {
    return {
      bestRoutine: null,
      reason: 'Adiciona routines para receber recomendações diárias.',
      recoverySnapshot: [],
      fatiguredMuscleNames: [],
    };
  }

  const bestMusclePt = best.muscles.map(m => MUSCLE_NAMES_PT[m] ?? m).join(', ');
  const fatiguedPt = fatiguedMuscles.map(m => MUSCLE_NAMES_PT[m] ?? m);

  let reason: string;
  if (best.avgRecovery >= 85) {
    reason = `Músculos totalmente recuperados para este treino. Óptimo dia para ${bestMusclePt}.`;
  } else if (best.avgRecovery >= 60) {
    reason = `${bestMusclePt} já estão suficientemente recuperados. Boa escolha para hoje.`;
  } else {
    reason = `Todos os músculso precisam de mais recuperação. Considera um dia de descanso activo.`;
  }

  return {
    bestRoutine: best.routine,
    reason,
    recoverySnapshot: best.muscles.map(m => ({
      muscle: MUSCLE_NAMES_PT[m] ?? m,
      pct: recoveryMap[m] ?? 100,
    })),
    fatiguredMuscleNames: fatiguedPt,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature 2: Intelligent Deload Detection
// ─────────────────────────────────────────────────────────────────────────────

export interface DeloadAnalysis {
  needsDeload: boolean;
  stagnatedExercises: { name: string; weeksStagnant: number }[];
  reason: string;
  recommendation: string;
}

/**
 * Gets the best 1RM achieved for a given exercise in a specific week.
 * Returns 0 if the exercise wasn't done that week.
 */
function getBest1RMForWeek(
  allWorkouts: CompletedWorkout[],
  exerciseId: string,
  weeksAgo: number
): number {
  const start = getWeekStart(weeksAgo);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const weekWorkouts = allWorkouts.filter(w => {
    const d = new Date(w.date);
    return d >= start && d < end;
  });

  let best1RM = 0;
  weekWorkouts.forEach(workout => {
    workout.exerciseLogs.forEach(log => {
      if (log.exerciseId !== exerciseId) return;
      log.sets.forEach(s => {
        const w = parseFloat(s.weightKg) || 0;
        const r = parseInt(s.reps, 10) || 0;
        if (r > 0) {
          const rm = calculateEpley1RM(w, r);
          if (rm > best1RM) best1RM = rm;
        }
      });
    });
  });

  return best1RM;
}

export function analyzeDeloadNeed(completedWorkouts: CompletedWorkout[]): DeloadAnalysis {
  if (completedWorkouts.length < 3) {
    return {
      needsDeload: false,
      stagnatedExercises: [],
      reason: 'Histórico insuficiente para análise de deload.',
      recommendation: 'Continua a treinar! Os dados de progressão vão aparecer em breve.',
    };
  }

  // Find all unique exercises trained in the last 4 weeks
  const recentExercises = new Map<string, string>(); // id → name
  for (let w = 0; w < 4; w++) {
    const start = getWeekStart(w);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    completedWorkouts
      .filter(workout => { const d = new Date(workout.date); return d >= start && d < end; })
      .forEach(workout => {
        workout.exerciseLogs.forEach(log => {
          recentExercises.set(log.exerciseId, log.exerciseName);
        });
      });
  }

  const stagnated: { name: string; weeksStagnant: number }[] = [];

  recentExercises.forEach((exerciseName, exerciseId) => {
    // Compare 1RM across last 4 weeks
    const weeklyBests: number[] = [];
    for (let w = 0; w < 4; w++) {
      const best = getBest1RMForWeek(completedWorkouts, exerciseId, w);
      if (best > 0) weeklyBests.unshift(best); // unshift = chronological order (oldest first)
    }

    if (weeklyBests.length < 3) return; // Need at least 3 data points

    // Count consecutive weeks without meaningful progress (< 1% improvement)
    let consecutiveNoProgress = 0;
    for (let i = weeklyBests.length - 1; i > 0; i--) {
      const improvement = (weeklyBests[i] - weeklyBests[i - 1]) / weeklyBests[i - 1];
      if (improvement <= 0.01) {
        consecutiveNoProgress++;
      } else {
        break; // Progress happened, reset counter
      }
    }

    if (consecutiveNoProgress >= 3) {
      stagnated.push({ name: exerciseName, weeksStagnant: consecutiveNoProgress });
    }
  });

  const needsDeload = stagnated.length >= 2; // At least 2 stagnant exercises → systemic fatigue

  let reason = '';
  let recommendation = '';

  if (needsDeload) {
    const names = stagnated.map(e => e.name).join(', ');
    reason = `Sem progressão há ≥ 3 semanas em: ${names}.`;
    recommendation = 'Esta semana: reduz o peso 15–20% e o volume 40%. Foca na técnica. Na próxima semana vais superar os teus máximos.';
  } else if (stagnated.length === 1) {
    reason = `"${stagnated[0].name}" estagna há ${stagnated[0].weeksStagnant} semanas.`;
    recommendation = 'Considera reduzir o peso neste exercício específico e aumentar as repetições por 1 semana.';
  } else {
    reason = 'Progressão saudável detectada em todos os exercícios.';
    recommendation = 'Continua! Os teus músculos estão a responder bem ao estímulo.';
  }

  return { needsDeload, stagnatedExercises: stagnated, reason, recommendation };
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature 3: Volume Adjustment per Muscle
// ─────────────────────────────────────────────────────────────────────────────

export type VolumeAdvice = 'increase' | 'maintain' | 'decrease';

export interface MuscleVolumeAdvice {
  muscle: string;
  musclePt: string;
  weeklySets: number;
  advice: VolumeAdvice;
  message: string;
  progressionTrend: number; // average 1RM change % per week, can be negative
}

/**
 * For each muscle group trained in the last 4 weeks, compute the average
 * 1RM trend and suggest whether to increase, maintain, or decrease volume.
 */
export function getMuscleVolumeAdvice(
  completedWorkouts: CompletedWorkout[]
): MuscleVolumeAdvice[] {
  if (completedWorkouts.length < 2) return [];

  const ALL_EXERCISES = getAllExercisesStatic();

  // Collect per-muscle: { exerciseId, weeklyBest1RM[] }
  const muscleExercises: Record<string, { exerciseId: string; bests: (number | null)[] }[]> = {};

  ALL_EXERCISES.forEach(ex => {
    const category = ex.category as string;
    if (!muscleExercises[category]) muscleExercises[category] = [];

    const weeklyBests: (number | null)[] = [];
    for (let w = 3; w >= 0; w--) { // oldest → newest
      const best = getBest1RMForWeek(completedWorkouts, ex.id, w);
      weeklyBests.push(best > 0 ? best : null);
    }

    const hasData = weeklyBests.some(b => b !== null);
    if (hasData) {
      muscleExercises[category].push({ exerciseId: ex.id, bests: weeklyBests });
    }
  });

  // Count current weekly sets (this week)
  const thisWeekVolume: Record<string, number> = {};
  const thisWeekWorkouts = getWorkoutsForWeek(completedWorkouts, 0);
  thisWeekWorkouts.forEach(workout => {
    workout.exerciseLogs.forEach(log => {
      const ex = ALL_EXERCISES.find(e => e.id === log.exerciseId);
      if (!ex) return;
      const category = ex.category as string;
      thisWeekVolume[category] = (thisWeekVolume[category] ?? 0) + log.sets.length;
    });
  });

  const results: MuscleVolumeAdvice[] = [];

  Object.entries(muscleExercises).forEach(([category, exercises]) => {
    // Average 1RM trend across all exercises in this muscle
    const trends: number[] = [];

    exercises.forEach(({ bests }) => {
      // Compute % change from first non-null to last non-null
      const filled = bests.filter(b => b !== null) as number[];
      if (filled.length < 2) return;

      const first = filled[0];
      const last = filled[filled.length - 1];
      if (first > 0) {
        trends.push(((last - first) / first) * 100);
      }
    });

    if (trends.length === 0) return;

    const avgTrend = trends.reduce((a, b) => a + b, 0) / trends.length;
    const weeklySets = thisWeekVolume[category] ?? 0;

    let advice: VolumeAdvice;
    let message: string;

    if (avgTrend >= 2) {
      // Good progress → can handle more volume
      advice = weeklySets < 20 ? 'increase' : 'maintain';
      message = avgTrend >= 5
        ? `Progressão excelente (+${avgTrend.toFixed(1)}%). Podes adicionar 1–2 séries semanais.`
        : `Boa progressão (+${avgTrend.toFixed(1)}%). Mantém o volume e sobe o peso.`;
    } else if (avgTrend >= -1) {
      // Plateau — same weight, no change
      advice = weeklySets > 12 ? 'decrease' : 'maintain';
      message = weeklySets > 12
        ? `Estagnação detectada. Reduz 2 séries e aumenta a intensidade.`
        : `Progresso estável. Mantém o volume e tenta aumentar o peso.`;
    } else {
      // Regression — reduce junk volume
      advice = 'decrease';
      message = `Regressão (${avgTrend.toFixed(1)}%). Reduz o volume a 10 séries e foca na recuperação.`;
    }

    results.push({
      muscle: category,
      musclePt: MUSCLE_NAMES_PT[category] ?? category,
      weeklySets,
      advice,
      message,
      progressionTrend: Math.round(avgTrend * 10) / 10,
    });
  });

  return results.sort((a, b) => a.progressionTrend - b.progressionTrend);
}

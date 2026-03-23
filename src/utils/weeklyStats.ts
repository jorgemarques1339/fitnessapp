import { CompletedWorkout } from '../store/useWorkoutStore';
import { getAllExercisesStatic } from './exerciseSelectors';
import { calculateEpley1RM } from './math';

// ── Week helpers ──────────────────────────────────────────────────────────────

/** Returns the Monday 00:00 of the week that is `weeksAgo` weeks before today. */
export function getWeekStart(weeksAgo = 0): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday - weeksAgo * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Returns workouts that fall within the given week (0 = this week, 1 = last week). */
export function getWorkoutsForWeek(
  workouts: CompletedWorkout[],
  weeksAgo = 0
): CompletedWorkout[] {
  const start = getWeekStart(weeksAgo);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return workouts.filter(w => {
    const d = new Date(w.date);
    return d >= start && d < end;
  });
}

// ── Streak ────────────────────────────────────────────────────────────────────

/** Returns the number of consecutive calendar days (ending today or yesterday) with at least one workout. */
export function getStreakDays(workouts: CompletedWorkout[]): number {
  if (workouts.length === 0) return 0;

  const workoutDays = new Set(
    workouts.map(w => {
      const d = new Date(w.date);
      d.setHours(0, 0, 0, 0);
      return d.toDateString();
    })
  );

  let streak = 0;
  const check = new Date();
  check.setHours(0, 0, 0, 0);

  // If no workout today, start checking from yesterday
  if (!workoutDays.has(check.toDateString())) {
    check.setDate(check.getDate() - 1);
  }

  while (workoutDays.has(check.toDateString())) {
    streak++;
    check.setDate(check.getDate() - 1);
  }

  return streak;
}

/** Returns mini-calendar dots for the last 7 days (true = trained, false = rest). */
export function getLast7DaysActivity(workouts: CompletedWorkout[]): { date: Date; trained: boolean }[] {
  const workoutDays = new Set(
    workouts.map(w => {
      const d = new Date(w.date);
      d.setHours(0, 0, 0, 0);
      return d.toDateString();
    })
  );

  const days: { date: Date; trained: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push({ date: d, trained: workoutDays.has(d.toDateString()) });
  }
  return days;
}

// ── Volume by Muscle ──────────────────────────────────────────────────────────

const MUSCLE_NAMES_PT: Record<string, string> = {
  Chest: 'Peito',
  Back: 'Costas',
  Shoulders: 'Ombros',
  Biceps: 'Bíceps',
  Triceps: 'Tríceps',
  Quads: 'Quadríceps',
  Hamstrings: 'Isquios',
  Glutes: 'Glúteos',
  Calves: 'Gémeos',
  Core: 'Core',
};

export interface MuscleVolume {
  muscle: string; // English key
  musclePt: string; // Portuguese label
  sets: number;
  status: 'below' | 'optimal' | 'above'; // relative to 10-20 hypertrophy zone
}

/** Returns weekly sets per muscle group, cross-referenced with EXERCISE_DATABASE.category. */
export function getWeeklyVolumeByMuscle(workouts: CompletedWorkout[]): MuscleVolume[] {
  const raw: Record<string, number> = {};

  workouts.forEach(workout => {
    workout.exerciseLogs.forEach(log => {
      const ex = getAllExercisesStatic().find(e => e.id === log.exerciseId);
      const muscle = ex?.category ?? 'Core';
      raw[muscle] = (raw[muscle] ?? 0) + log.sets.length;
    });
  });

  return Object.entries(raw)
    .map(([muscle, sets]) => ({
      muscle,
      musclePt: MUSCLE_NAMES_PT[muscle] ?? muscle,
      sets,
      status: (sets < 10 ? 'below' : sets <= 20 ? 'optimal' : 'above') as MuscleVolume['status'],
    }))
    .sort((a, b) => b.sets - a.sets);
}

// ── PR Detection ──────────────────────────────────────────────────────────────

export interface PR {
  exerciseName: string;
  type: 'weight' | '1rm';
  newValue: number;
  previousBest: number;
}

/** Compares the new workout against all previous workouts and returns a list of broken PRs. */
export function detectPRs(
  allWorkouts: CompletedWorkout[],
  newWorkout: CompletedWorkout
): PR[] {
  const prs: PR[] = [];
  const previousWorkouts = allWorkouts.filter(w => w.id !== newWorkout.id);

  newWorkout.exerciseLogs.forEach(log => {
    // Best weight and 1RM in new workout
    let newBestWeight = 0;
    let newBest1RM = 0;

    log.sets.forEach(s => {
      const w = parseFloat(s.weightKg) || 0;
      const r = parseInt(s.reps, 10) || 0;
      if (w > newBestWeight) newBestWeight = w;
      const rm = r > 0 ? calculateEpley1RM(w, r) : 0;
      if (rm > newBest1RM) newBest1RM = rm;
    });

    if (newBestWeight === 0) return;

    // Historical best weight and 1RM for this exercise
    let prevBestWeight = 0;
    let prevBest1RM = 0;

    previousWorkouts.forEach(w => {
      w.exerciseLogs.forEach(prevLog => {
        if (prevLog.exerciseId !== log.exerciseId) return;
        prevLog.sets.forEach(s => {
          const w2 = parseFloat(s.weightKg) || 0;
          const r2 = parseInt(s.reps, 10) || 0;
          if (w2 > prevBestWeight) prevBestWeight = w2;
          const rm = r2 > 0 ? calculateEpley1RM(w2, r2) : 0;
          if (rm > prevBest1RM) prevBest1RM = rm;
        });
      });
    });

    if (newBestWeight > prevBestWeight) {
      // Weight PR (includes first-ever lift where prevBest = 0)
      if (prevBestWeight > 0) {
        prs.push({
          exerciseName: log.exerciseName,
          type: 'weight',
          newValue: newBestWeight,
          previousBest: prevBestWeight,
        });
      }
    } else if (newBest1RM > prevBest1RM && prevBest1RM > 0) {
      // 1RM PR without weight PR (more reps at same weight, for example)
      prs.push({
        exerciseName: log.exerciseName,
        type: '1rm',
        newValue: Math.round(newBest1RM),
        previousBest: Math.round(prevBest1RM),
      });
    }
  });

  return prs;
}

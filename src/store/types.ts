export interface SetLog {
  setNumber: number;
  weightKg: string;
  reps: string;
  isCompleted: boolean;
  rpe?: string;
  note?: string;
  mediaUri?: string;
  mediaType?: 'photo' | 'video';
  velocityMs?: number; // m/s
  powerWatts?: number;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

export interface CompletedWorkout {
  id: string;
  routineId: string;
  routineTitle: string;
  exerciseLogs: ExerciseLog[];
  date: string;
  durationMs: number;
  totalTonnageKg: number;
  totalSets: number;
}

export interface BodyWeightLog {
  date: string;
  weightKg: number;
  mediaUri?: string;
}

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoutineDef } from '../data/routines';

const isWeb = typeof window !== 'undefined';

// Safe storage for web fallback
const webStorage = {
  getItem: (name: string) => {
    const value = localStorage.getItem(name);
    return Promise.resolve(value);
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, value);
    return Promise.resolve();
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
    return Promise.resolve();
  },
};

export interface SetLog {
  setNumber: number;
  weightKg: string;
  reps: string;
  rpe: string;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

export interface CompletedWorkout {
  id: string; // timestamp string
  date: string;
  routineId: string;
  routineTitle: string;
  totalSets: number;
  totalTonnageKg: number;
  exerciseLogs: ExerciseLog[];
}

interface WorkoutState {
  isInLogger: boolean;
  setIsInLogger: (val: boolean) => void;

  activeRoutine: RoutineDef | null;
  currentExerciseIndex: number;
  currentExerciseSets: SetLog[];
  
  sessionLogs: ExerciseLog[];
  completedWorkouts: CompletedWorkout[];
  lastCompletedWorkout: CompletedWorkout | null;

  startWorkout: (routine: RoutineDef) => void;
  finishWorkout: () => void;
  abortWorkout: () => void; 
  logSet: (set: Omit<SetLog, 'setNumber'>) => void;
  nextExercise: () => void;
  clearHistory: () => void;
  clearLastCompletedWorkout: () => void;

  getPreviousExerciseLog: (exerciseId: string) => ExerciseLog | null;
}

export const useWorkoutStore = create<WorkoutState>()((set, get) => ({
      isInLogger: false,
      setIsInLogger: (val) => set({ isInLogger: val }),

      activeRoutine: null,
      currentExerciseIndex: 0,
      currentExerciseSets: [],
      sessionLogs: [],
      completedWorkouts: [],
      lastCompletedWorkout: null,

      startWorkout: (routine) => set({
        activeRoutine: routine,
        isInLogger: true,
        currentExerciseIndex: 0,
        currentExerciseSets: [],
        sessionLogs: [],
      }),

      abortWorkout: () => set({
        activeRoutine: null,
        isInLogger: false,
        currentExerciseIndex: 0,
        currentExerciseSets: [],
        sessionLogs: [],
      }),

      nextExercise: () => {
        const { activeRoutine, currentExerciseIndex, currentExerciseSets, sessionLogs } = get();
        if (!activeRoutine) return;

        const currentExercise = activeRoutine.exercises[currentExerciseIndex];
        const newSessionLogs = [...sessionLogs, { 
          exerciseId: currentExercise.id, 
          exerciseName: currentExercise.name,
          sets: [...currentExerciseSets] 
        }];

        if (currentExerciseIndex < activeRoutine.exercises.length - 1) {
          set({
            currentExerciseIndex: currentExerciseIndex + 1,
            currentExerciseSets: [],
            sessionLogs: newSessionLogs,
          });
        }
      },

      logSet: (log) => {
        const { currentExerciseSets } = get();
        set({
          currentExerciseSets: [...currentExerciseSets, {
            setNumber: currentExerciseSets.length + 1,
            ...log
          }]
        });
      },

      finishWorkout: () => {
        const { activeRoutine, currentExerciseIndex, currentExerciseSets, sessionLogs, completedWorkouts } = get();
        if (!activeRoutine) return;

        const finalLogs = [...sessionLogs];
        if (currentExerciseSets.length > 0) {
          finalLogs.push({
            exerciseId: activeRoutine.exercises[currentExerciseIndex].id,
            exerciseName: activeRoutine.exercises[currentExerciseIndex].name,
            sets: [...currentExerciseSets]
          });
        }

        let sessionTotalSets = 0;
        let sessionTotalTonnage = 0;
        finalLogs.forEach(log => {
          sessionTotalSets += log.sets.length;
          log.sets.forEach(s => {
            sessionTotalTonnage += parseFloat(s.weightKg) * parseInt(s.reps, 10);
          });
        });

        const newWorkout: CompletedWorkout = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          routineId: activeRoutine.id,
          routineTitle: activeRoutine.title,
          totalSets: sessionTotalSets,
          totalTonnageKg: sessionTotalTonnage,
          exerciseLogs: finalLogs,
        };

        set({
          completedWorkouts: [...completedWorkouts, newWorkout],
          lastCompletedWorkout: newWorkout,
          isInLogger: false,
          activeRoutine: null,
          currentExerciseIndex: 0,
          currentExerciseSets: [],
          sessionLogs: [],
        });
      },

      clearLastCompletedWorkout: () => set({ lastCompletedWorkout: null }),

      getPreviousExerciseLog: (exerciseId) => {
        const { completedWorkouts } = get();
        for (let i = completedWorkouts.length - 1; i >= 0; i--) {
          const workout = completedWorkouts[i];
          const log = workout.exerciseLogs?.find(l => l.exerciseId === exerciseId);
          if (log && log.sets.length > 0) return log;
        }
        return null;
      },

      clearHistory: () => {
        set({ completedWorkouts: [] });
      }
    })
);

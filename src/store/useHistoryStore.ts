import { create } from 'zustand';
import { Platform } from 'react-native';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RoutineDef, ExerciseDef } from '../data/routines';
import { safeStorage } from './storage';
import { CompletedWorkout, BodyWeightLog } from './types';
import { getCompletedWorkoutsFromDB, saveWorkoutToDB, clearAllWorkoutsFromDB, initDatabase } from './database';

interface HistoryState {
  completedWorkouts: CompletedWorkout[];
  lastCompletedWorkout: CompletedWorkout | null;

  customRoutines: RoutineDef[];
  customExercises: ExerciseDef[];
  bodyWeightLogs: BodyWeightLog[];

  saveCustomRoutine: (routine: RoutineDef) => void;
  deleteCustomRoutine: (id: string) => void;

  addCustomExercise: (ex: ExerciseDef) => void;
  updateCustomExercise: (ex: ExerciseDef) => void;
  deleteCustomExercise: (id: string) => void;

  logBodyWeight: (weightKg: number, mediaUri?: string) => void;
  addCompletedWorkout: (workout: CompletedWorkout) => void;
  clearHistory: () => void;
  clearLastCompletedWorkout: () => void;
  importData: (data: any) => void;
  initHistory: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      completedWorkouts: [],
      lastCompletedWorkout: null,
      customRoutines: [],
      customExercises: [],
      bodyWeightLogs: [],

      saveCustomRoutine: (routine) => {
        const { customRoutines } = get();
        const existingIndex = customRoutines.findIndex(r => r.id === routine.id);
        if (existingIndex >= 0) {
          const newRoutines = [...customRoutines];
          newRoutines[existingIndex] = routine;
          set({ customRoutines: newRoutines });
        } else {
          set({ customRoutines: [...customRoutines, routine] });
        }
      },

      deleteCustomRoutine: (id) => {
        const { customRoutines } = get();
        set({ customRoutines: customRoutines.filter(r => r.id.toString() !== id.toString()) });
      },

      addCustomExercise: (ex) => {
        const { customExercises } = get();
        set({ customExercises: [...customExercises, ex] });
      },

      updateCustomExercise: (ex) => {
        const { customExercises } = get();
        set({ customExercises: customExercises.map(e => e.id === ex.id ? ex : e) });
      },

      deleteCustomExercise: (id) => {
        const { customExercises } = get();
        set({ customExercises: customExercises.filter(e => e.id !== id) });
      },

      logBodyWeight: (weightKg, mediaUri) => {
        const { bodyWeightLogs } = get();
        const newLog: BodyWeightLog = {
          date: new Date().toISOString(),
          weightKg,
          mediaUri
        };
        const updatedLogs = [...bodyWeightLogs, newLog].slice(-30);
        set({ bodyWeightLogs: updatedLogs });
      },

      addCompletedWorkout: (workout) => {
        set((state) => ({ 
          completedWorkouts: [...state.completedWorkouts, workout],
          lastCompletedWorkout: workout
        }));
        saveWorkoutToDB(workout).catch(console.error);
      },

      clearLastCompletedWorkout: () => set({ lastCompletedWorkout: null }),

      clearHistory: () => {
        set({ 
          completedWorkouts: [],
          customRoutines: [],
          customExercises: [],
          bodyWeightLogs: [],
          lastCompletedWorkout: null
        });
        clearAllWorkoutsFromDB().catch(console.error);
      },

      initHistory: async () => {
        if (Platform.OS === 'web') return;
        try {
          await initDatabase();
          const workouts = await getCompletedWorkoutsFromDB();
          if (workouts.length > 0) {
            set({ completedWorkouts: workouts });
          }
        } catch (error) {
          console.error('Failed to init SQLite history:', error);
        }
      },

      importData: (data) => {
        if (!data) return;
        set({
          completedWorkouts: data.completedWorkouts || [],
          customRoutines: data.customRoutines || [],
          customExercises: data.customExercises || [],
          bodyWeightLogs: data.bodyWeightLogs || [],
        });
        // Sync imported workouts to DB
        (data.completedWorkouts || []).forEach((w: CompletedWorkout) => {
           saveWorkoutToDB(w).catch(console.error);
        });
      }
    }),
    {
      name: 'history-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);

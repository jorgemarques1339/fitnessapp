import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RoutineDef, ExerciseDef } from '../data/routines';
import { safeStorage } from './storage';
import { saveWorkoutToHealth } from '../utils/healthSync';

export interface SetLog {
  setNumber: number;
  weightKg: string;
  reps: string;
  rpe: string;
  note?: string;
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
  durationMs?: number;
  exerciseLogs: ExerciseLog[];
}

export interface BodyWeightLog {
  date: string; // ISO String
  weightKg: number;
}

interface WorkoutState {
  isInLogger: boolean;
  setIsInLogger: (val: boolean) => void;

  activeRoutine: RoutineDef | null;
  currentExerciseIndex: number;
  currentExerciseSets: SetLog[];
  
  isExerciseSelectionMode: boolean;

  sessionLogs: ExerciseLog[];
  completedWorkouts: CompletedWorkout[];
  lastCompletedWorkout: CompletedWorkout | null;

  customRoutines: RoutineDef[];
  customExercises: ExerciseDef[];
  bodyWeightLogs: BodyWeightLog[];

  // Settings
  healthSyncEnabled: boolean;
  setHealthSyncEnabled: (val: boolean) => void;
  sessionStartTime: number | null;

  themeMode: 'oled' | 'frosted';
  setThemeMode: (mode: 'oled' | 'frosted') => void;
  
  lastBackupDate: string | null;
  setLastBackupDate: (date: string) => void;

  availablePlates: number[];
  setAvailablePlates: (plates: number[]) => void;

  startWorkout: (routine: RoutineDef) => void;
  finishWorkout: () => void;
  abortWorkout: () => void; 
  logSet: (set: Omit<SetLog, 'setNumber'>) => void;
  
  selectExercise: (index: number) => void;
  returnToSelection: () => void;
  swapExerciseInActiveRoutine: (oldExerciseId: string, newExercise: ExerciseDef) => void;

  saveCustomRoutine: (routine: RoutineDef) => void;
  deleteCustomRoutine: (id: string) => void;

  addCustomExercise: (ex: ExerciseDef) => void;
  updateCustomExercise: (ex: ExerciseDef) => void;
  deleteCustomExercise: (id: string) => void;

  logBodyWeight: (weightKg: number) => void;

  clearHistory: () => void;
  clearLastCompletedWorkout: () => void;

  getPreviousExerciseLog: (exerciseId: string) => ExerciseLog | null;
  importData: (data: any) => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      isInLogger: false,
      setIsInLogger: (val) => set({ isInLogger: val }),

      activeRoutine: null,
      currentExerciseIndex: 0,
      currentExerciseSets: [],
      isExerciseSelectionMode: false,
      sessionLogs: [],
      completedWorkouts: [],
      lastCompletedWorkout: null,

      customRoutines: [],
      customExercises: [],
      bodyWeightLogs: [],

      healthSyncEnabled: true,
      setHealthSyncEnabled: (val) => set({ healthSyncEnabled: val }),
      sessionStartTime: null,

      themeMode: 'oled',
      setThemeMode: (mode) => set({ themeMode: mode }),

      lastBackupDate: null,
      setLastBackupDate: (date) => set({ lastBackupDate: date }),

      availablePlates: [25, 20, 15, 10, 5, 2.5, 1.25],
      setAvailablePlates: (plates) => set({ availablePlates: plates }),

      startWorkout: (routine) => set({
        activeRoutine: routine,
        isInLogger: true,
        currentExerciseIndex: 0,
        currentExerciseSets: [],
        sessionLogs: [],
        isExerciseSelectionMode: true,
        sessionStartTime: Date.now()
      }),

      abortWorkout: () => set({
        activeRoutine: null,
        isInLogger: false,
        currentExerciseIndex: 0,
        currentExerciseSets: [],
        sessionLogs: [],
        isExerciseSelectionMode: false,
        sessionStartTime: null
      }),

      selectExercise: (index) => {
        const { activeRoutine, sessionLogs } = get();
        if (!activeRoutine) return;
        
        const exercise = activeRoutine.exercises[index];
        const existingLog = sessionLogs.find(log => log.exerciseId === exercise.id);

        set({
          isExerciseSelectionMode: false,
          currentExerciseIndex: index,
          currentExerciseSets: existingLog ? [...existingLog.sets] : [],
        });
      },

      returnToSelection: () => {
        const { activeRoutine, currentExerciseIndex, currentExerciseSets, sessionLogs } = get();
        if (!activeRoutine) return;

        const currentExercise = activeRoutine.exercises[currentExerciseIndex];
        
        const filteredLogs = sessionLogs.filter(log => log.exerciseId !== currentExercise.id);
        
        let newSessionLogs = filteredLogs;
        if (currentExerciseSets.length > 0) {
          newSessionLogs = [...filteredLogs, { 
            exerciseId: currentExercise.id, 
            exerciseName: currentExercise.name,
            sets: [...currentExerciseSets] 
          }];
        }

        set({
          isExerciseSelectionMode: true,
          sessionLogs: newSessionLogs,
          currentExerciseSets: [],
        });
      },

      swapExerciseInActiveRoutine: (oldExerciseId: string, newExercise: ExerciseDef) => {
        const { activeRoutine, sessionLogs } = get();
        if (!activeRoutine) return;

        const newActiveRoutine = { ...activeRoutine };
        newActiveRoutine.exercises = [...activeRoutine.exercises];
        
        const exerciseIndex = newActiveRoutine.exercises.findIndex(e => e.id === oldExerciseId);
        if (exerciseIndex >= 0) {
          const existingTargetSets = newActiveRoutine.exercises[exerciseIndex].targetSets;
          newActiveRoutine.exercises[exerciseIndex] = {
            ...newExercise,
            targetSets: existingTargetSets
          };
          const cleanedLogs = sessionLogs.filter(log => log.exerciseId !== oldExerciseId);
          set({ 
            activeRoutine: newActiveRoutine,
            sessionLogs: cleanedLogs
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
        const { activeRoutine, currentExerciseIndex, currentExerciseSets, sessionLogs, completedWorkouts, isExerciseSelectionMode, sessionStartTime } = get();
        if (!activeRoutine) return;

        let finalLogs = [...sessionLogs];
        
        if (!isExerciseSelectionMode && currentExerciseSets.length > 0) {
          const currentExercise = activeRoutine.exercises[currentExerciseIndex];
          const filteredLogs = finalLogs.filter(log => log.exerciseId !== currentExercise.id);
          
          finalLogs = [...filteredLogs, {
            exerciseId: currentExercise.id,
            exerciseName: currentExercise.name,
            sets: [...currentExerciseSets]
          }];
        }

        let sessionTotalSets = 0;
        let sessionTotalTonnage = 0;
        finalLogs.forEach(log => {
          sessionTotalSets += log.sets.length;
          log.sets.forEach(s => {
            sessionTotalTonnage += parseFloat(s.weightKg) * parseInt(s.reps, 10);
          });
        });

        const durationMs = sessionStartTime ? (Date.now() - sessionStartTime) : 0;

        const newWorkout: CompletedWorkout = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          routineId: activeRoutine.id,
          routineTitle: activeRoutine.title,
          totalSets: sessionTotalSets,
          totalTonnageKg: sessionTotalTonnage,
          durationMs,
          exerciseLogs: finalLogs,
        };

        if (get().healthSyncEnabled) {
          const minutes = durationMs ? durationMs / 60000 : 45;
          const calories = Math.round(minutes * 6); // Rough estimate: 6 kcal per minute for strength training
          const endDate = new Date();
          const startDate = new Date(Date.now() - (durationMs || 45 * 60000));
          
          saveWorkoutToHealth(
            activeRoutine.title,
            calories,
            startDate,
            endDate
          );
        }

        set({
          completedWorkouts: [...completedWorkouts, newWorkout],
          lastCompletedWorkout: newWorkout,
          isInLogger: false,
          isExerciseSelectionMode: false,
          activeRoutine: null,
          currentExerciseIndex: 0,
          currentExerciseSets: [],
          sessionLogs: [],
          sessionStartTime: null,
        });
      },

      clearLastCompletedWorkout: () => set({ lastCompletedWorkout: null }),

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

      logBodyWeight: (weightKg) => {
        const { bodyWeightLogs } = get();
        const newLog: BodyWeightLog = {
          date: new Date().toISOString(),
          weightKg
        };
        const updatedLogs = [...bodyWeightLogs, newLog].slice(-30);
        set({ bodyWeightLogs: updatedLogs });
      },

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
        set({ 
          completedWorkouts: [],
          customRoutines: [],
          customExercises: [],
          bodyWeightLogs: [],
          lastCompletedWorkout: null
        });
      },

      importData: (data) => {
        if (!data) return;
        set({
          completedWorkouts: data.completedWorkouts || [],
          customRoutines: data.customRoutines || [],
          customExercises: data.customExercises || [],
          bodyWeightLogs: data.bodyWeightLogs || [],
          lastBackupDate: data.exportDate || data.lastBackupDate || null
        });
      }
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        completedWorkouts: state.completedWorkouts,
        customRoutines: state.customRoutines,
        customExercises: state.customExercises,
        bodyWeightLogs: state.bodyWeightLogs,
        healthSyncEnabled: state.healthSyncEnabled,
        themeMode: state.themeMode,
        lastBackupDate: state.lastBackupDate,
        availablePlates: state.availablePlates,
      }),
    }
  )
);

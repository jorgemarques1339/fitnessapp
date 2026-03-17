import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoutineDef, ExerciseDef } from '../data/routines';

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
  
  isExerciseSelectionMode: boolean;

  sessionLogs: ExerciseLog[];
  completedWorkouts: CompletedWorkout[];
  lastCompletedWorkout: CompletedWorkout | null;

  customRoutines: RoutineDef[];

  startWorkout: (routine: RoutineDef) => void;
  finishWorkout: () => void;
  abortWorkout: () => void; 
  logSet: (set: Omit<SetLog, 'setNumber'>) => void;
  
  selectExercise: (index: number) => void;
  returnToSelection: () => void;
  swapExerciseInActiveRoutine: (oldExerciseId: string, newExercise: ExerciseDef) => void;

  saveCustomRoutine: (routine: RoutineDef) => void;
  deleteCustomRoutine: (id: string) => void;

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
      isExerciseSelectionMode: false,
      sessionLogs: [],
      completedWorkouts: [],
      lastCompletedWorkout: null,

      customRoutines: [],

      startWorkout: (routine) => set({
        activeRoutine: routine,
        isInLogger: true,
        currentExerciseIndex: 0,
        currentExerciseSets: [],
        sessionLogs: [],
        isExerciseSelectionMode: true,
      }),

      abortWorkout: () => set({
        activeRoutine: null,
        isInLogger: false,
        currentExerciseIndex: 0,
        currentExerciseSets: [],
        sessionLogs: [],
        isExerciseSelectionMode: false,
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

        // Ensure we don't accidentally mutate the original reference if it's from predefined/custom lists
        const newActiveRoutine = { ...activeRoutine };
        newActiveRoutine.exercises = [...activeRoutine.exercises];
        
        const exerciseIndex = newActiveRoutine.exercises.findIndex(e => e.id === oldExerciseId);
        if (exerciseIndex >= 0) {
          // Keep the same target sets if possible, or fallback to new
          const existingTargetSets = newActiveRoutine.exercises[exerciseIndex].targetSets;
          newActiveRoutine.exercises[exerciseIndex] = {
            ...newExercise,
            targetSets: existingTargetSets
          };

          // Also remove any existing logs for the old exercise in this session, 
          // because it's been replaced.
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
        const { activeRoutine, currentExerciseIndex, currentExerciseSets, sessionLogs, completedWorkouts, isExerciseSelectionMode } = get();
        if (!activeRoutine) return;

        let finalLogs = [...sessionLogs];
        
        // Se ainda estiver num exercício ativo e houver sets, temos de guardar antes de fechar
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
          isExerciseSelectionMode: false,
          activeRoutine: null,
          currentExerciseIndex: 0,
          currentExerciseSets: [],
          sessionLogs: [],
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
        set({ customRoutines: customRoutines.filter(r => r.id !== id) });
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
        set({ completedWorkouts: [] });
      }
    })
);

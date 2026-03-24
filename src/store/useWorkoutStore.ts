import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RoutineDef, ExerciseDef } from '../data/routines';
import { safeStorage } from './storage';
import { saveWorkoutToHealth } from '../utils/healthSync';
import { useChallengeStore } from './useChallengeStore';
import { useHistoryStore } from './useHistoryStore';
import { useConfigStore } from './useConfigStore';
import { useSocialStore } from './useSocialStore';

import { SetLog, ExerciseLog, CompletedWorkout, BodyWeightLog } from './types';

export { SetLog, ExerciseLog, CompletedWorkout, BodyWeightLog };

interface WorkoutState {
  isInLogger: boolean;
  setIsInLogger: (val: boolean) => void;

  activeRoutine: RoutineDef | null;
  currentExerciseIndex: number;
  currentExerciseSets: SetLog[];
  
  isExerciseSelectionMode: boolean;

  sessionLogs: ExerciseLog[];
  sessionStartTime: number | null;

  startWorkout: (routine: RoutineDef) => void;
  finishWorkout: () => void;
  abortWorkout: () => void; 
  logSet: (set: Omit<SetLog, 'setNumber'>) => void;
  
  selectExercise: (index: number) => void;
  returnToSelection: () => void;
  swapExerciseInActiveRoutine: (oldExerciseId: string, newExercise: ExerciseDef) => void;

  updateCurrentSetLog: (setNumber: number, mediaUri: string, mediaType: 'photo' | 'video') => void;
  getPreviousExerciseLog: (exerciseId: string) => ExerciseLog | null;
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
      sessionStartTime: null,

      startWorkout: (routine) => set({
        activeRoutine: routine,
        isInLogger: true,
        currentExerciseIndex: 0,
        currentExerciseSets: [],
        sessionLogs: [],
        sessionStartTime: Date.now(),
        isExerciseSelectionMode: false,
      }),

      abortWorkout: () => set({
        isInLogger: false,
        activeRoutine: null,
        sessionLogs: [],
        sessionStartTime: null,
      }),

      logSet: (setLog) => {
        const weight = parseFloat(setLog.weightKg);
        const reps = parseInt(setLog.reps, 10);
        
        if (isNaN(weight) || isNaN(reps) || reps <= 0) {
          console.warn('Invalid set data ignored:', setLog);
          return;
        }

        const { currentExerciseSets } = get();
        const newSet: SetLog = {
          ...setLog,
          setNumber: currentExerciseSets.length + 1,
        };
        set({ currentExerciseSets: [...currentExerciseSets, newSet] });
      },

      selectExercise: (index) => {
        const { activeRoutine, sessionLogs, currentExerciseSets, currentExerciseIndex } = get();
        if (!activeRoutine) return;

        const updatedLogs = [...sessionLogs];
        const currentEx = activeRoutine.exercises[currentExerciseIndex];
        
        const existingLogIndex = updatedLogs.findIndex(l => l.exerciseId === currentEx.id);
        const newLog = {
          exerciseId: currentEx.id,
          exerciseName: currentEx.name,
          sets: [...currentExerciseSets],
        };

        if (existingLogIndex >= 0) {
          updatedLogs[existingLogIndex] = newLog;
        } else {
          updatedLogs.push(newLog);
        }

        const nextEx = activeRoutine.exercises[index];
        const nextExLog = updatedLogs.find(l => l.exerciseId === nextEx.id);

        set({
          sessionLogs: updatedLogs,
          currentExerciseIndex: index,
          currentExerciseSets: nextExLog ? [...nextExLog.sets] : [],
          isExerciseSelectionMode: false,
        });
      },

      returnToSelection: () => {
        const { activeRoutine, sessionLogs, currentExerciseSets, currentExerciseIndex } = get();
        if (!activeRoutine) return;

        const updatedLogs = [...sessionLogs];
        const currentEx = activeRoutine.exercises[currentExerciseIndex];
        const newLog = {
          exerciseId: currentEx.id,
          exerciseName: currentEx.name,
          sets: [...currentExerciseSets],
        };

        const existingLogIndex = updatedLogs.findIndex(l => l.exerciseId === currentEx.id);
        if (existingLogIndex >= 0) {
          updatedLogs[existingLogIndex] = newLog;
        } else {
          updatedLogs.push(newLog);
        }

        set({
          sessionLogs: updatedLogs,
          isExerciseSelectionMode: true,
        });
      },

      swapExerciseInActiveRoutine: (oldId, newEx) => {
        const { activeRoutine } = get();
        if (!activeRoutine) return;

        const updatedExs = activeRoutine.exercises.map(ex => 
          ex.id === oldId ? newEx : ex
        );

        set({
          activeRoutine: {
            ...activeRoutine,
            exercises: updatedExs
          }
        });
      },

      finishWorkout: () => {
        const { activeRoutine, sessionLogs, currentExerciseSets, currentExerciseIndex, sessionStartTime } = get();
        if (!activeRoutine) return;

        // Save current exercise before finishing
        const finalLogs = [...sessionLogs];
        const currentEx = activeRoutine.exercises[currentExerciseIndex];
        const existingLogIndex = finalLogs.findIndex(l => l.exerciseId === currentEx.id);
        const currentLog = {
          exerciseId: currentEx.id,
          exerciseName: currentEx.name,
          sets: [...currentExerciseSets],
        };

        if (existingLogIndex >= 0) {
          finalLogs[existingLogIndex] = currentLog;
        } else {
          finalLogs.push(currentLog);
        }

        const durationMs = sessionStartTime ? Date.now() - sessionStartTime : 0;
        let sessionTotalTonnage = 0;
        let sessionTotalSets = 0;
        finalLogs.forEach(log => {
          const exercise = activeRoutine.exercises.find(ex => ex.id === log.exerciseId);
          log.sets.forEach(s => {
            if (s.isCompleted) {
              const baseTonnage = (parseFloat(s.weightKg) || 0) * (parseInt(s.reps, 10) || 0);
              sessionTotalTonnage += exercise?.unilateral ? baseTonnage * 2 : baseTonnage;
              sessionTotalSets++;
            }
          });
        });

        const newWorkout: CompletedWorkout = {
          id: Date.now().toString(),
          routineId: activeRoutine.id,
          routineTitle: activeRoutine.title,
          date: new Date().toISOString(),
          durationMs,
          totalTonnageKg: sessionTotalTonnage,
          totalSets: sessionTotalSets,
          exerciseLogs: finalLogs,
        };

        // Health Sync
        if (useConfigStore.getState().healthSyncEnabled) {
          const minutes = durationMs ? durationMs / 60000 : 45;
          const calories = Math.round(minutes * 6);
          const endDate = new Date();
          const startDate = new Date(Date.now() - (durationMs || 45 * 60000));
          
          saveWorkoutToHealth(
            activeRoutine.title,
            calories,
            startDate,
            endDate
          );
        }

        // Update Challenges
        const challengeStore = useChallengeStore.getState();
        finalLogs.forEach(log => {
          let totalReps = 0;
          log.sets.forEach(s => totalReps += parseInt(s.reps, 10) || 0);

          if (log.exerciseId === 'ex-squat' || log.exerciseName.toLowerCase().includes('agachamento')) {
            challengeStore.updateProgress('challenge-squat-30', totalReps);
          }
        });
        
        challengeStore.updateProgress('challenge-volume-50k', sessionTotalTonnage);
        challengeStore.updateProgress('challenge-consistency', 1);

        // Save to History Store
        useHistoryStore.getState().addCompletedWorkout(newWorkout);

        // Update Social Duels
        useSocialStore.getState().updateDuelTonnage(sessionTotalTonnage);

        set({
          isInLogger: false,
          activeRoutine: null,
          sessionLogs: [],
          sessionStartTime: null,
        });
      },

      updateCurrentSetLog: (setNumber, mediaUri, mediaType) => {
        const { currentExerciseSets } = get();
        const updatedSets = currentExerciseSets.map(s => 
          s.setNumber === setNumber ? { ...s, mediaUri, mediaType } : s
        );
        set({ currentExerciseSets: updatedSets });
      },

      getPreviousExerciseLog: (exerciseId) => {
        const { completedWorkouts } = useHistoryStore.getState();
        for (let i = completedWorkouts.length - 1; i >= 0; i--) {
          const workout = completedWorkouts[i];
          const log = workout.exerciseLogs?.find(l => l.exerciseId === exerciseId);
          if (log && log.sets.length > 0) return log;
        }
        return null;
      },
    }),
    {
      name: 'active-workout-storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        isInLogger: state.isInLogger,
        activeRoutine: state.activeRoutine,
        currentExerciseIndex: state.currentExerciseIndex,
        currentExerciseSets: state.currentExerciseSets,
        sessionLogs: state.sessionLogs,
        isExerciseSelectionMode: state.isExerciseSelectionMode,
        sessionStartTime: state.sessionStartTime,
      }),
    }
  )
);

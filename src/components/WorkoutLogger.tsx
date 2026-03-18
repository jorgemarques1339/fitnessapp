import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { calculateProgression, SetData } from '../utils/progression';
import { ExerciseDef } from '../data/routines';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { useWorkoutStore } from '../store/useWorkoutStore';
import TechnicalModal from './TechnicalModal';
import ExerciseSwapModal from './ExerciseSwapModal';
import { useAppTheme } from '../hooks/useAppTheme';
import { soundManager } from '../utils/SoundManager';

// Refactored Sub-Components
import ExerciseSelector from './logger/ExerciseSelector';
import RestTimerOverlay from './logger/RestTimerOverlay';
import LoggingInterface from './logger/LoggingInterface';

export default function WorkoutLogger() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const contentMaxWidth = 768;

  const theme = useAppTheme();
  
  // Store State
  const activeRoutine = useWorkoutStore(state => state.activeRoutine);
  const currentExerciseIndex = useWorkoutStore(state => state.currentExerciseIndex);
  const currentExerciseSets = useWorkoutStore(state => state.currentExerciseSets);
  const isExerciseSelectionMode = useWorkoutStore(state => state.isExerciseSelectionMode);
  const sessionLogs = useWorkoutStore(state => state.sessionLogs);
  const completedWorkouts = useWorkoutStore(state => state.completedWorkouts);

  // Store Actions
  const selectExercise = useWorkoutStore(state => state.selectExercise);
  const returnToSelection = useWorkoutStore(state => state.returnToSelection);
  const logSet = useWorkoutStore(state => state.logSet);
  const finishWorkout = useWorkoutStore(state => state.finishWorkout);
  const getPreviousExerciseLog = useWorkoutStore(state => state.getPreviousExerciseLog);
  const swapExerciseInActiveRoutine = useWorkoutStore(state => state.swapExerciseInActiveRoutine);
  const abortWorkout = useWorkoutStore(state => state.abortWorkout);

  // Local UI State
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentReps, setCurrentReps] = useState('');
  const [currentRpe, setCurrentRpe] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [suggestedWeight, setSuggestedWeight] = useState<number | undefined>(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [exerciseToSwap, setExerciseToSwap] = useState<ExerciseDef | null>(null);

  // Timer Hook
  const { remainingSeconds, isActive, startTimer, stopTimer } = useWorkoutTimer();

  if (!activeRoutine) return null;
  const currentExercise = activeRoutine.exercises[currentExerciseIndex];

  // Sync inputs with previous logs
  useEffect(() => {
    const prevLog = getPreviousExerciseLog(currentExercise.id);
    
    if (prevLog && prevLog.sets.length > 0) {
      const bestSet = prevLog.sets.reduce((prev, current) => 
        (parseFloat(prev.weightKg || '0') > parseFloat(current.weightKg || '0')) ? prev : current
      );
      setCurrentWeight(bestSet.weightKg);
      setCurrentReps(bestSet.reps);

      // Pre-calculate suggestion from previous session
      const recentSetsData = prevLog.sets.map(s => ({
        weightKg: parseFloat(s.weightKg),
        reps: parseInt(s.reps, 10),
        targetReps: currentExercise.targetSets,
        restSeconds: 90,
        rpe: parseFloat(s.rpe || '8')
      }));
      const routineCompletions = completedWorkouts.filter(w => w.routineId === activeRoutine.id).length;
      const progression = calculateProgression(recentSetsData, routineCompletions + 1);
      setSuggestedWeight(progression.suggestedWeight);
    } else {
      setCurrentWeight('');
      setCurrentReps('');
      setSuggestedWeight(undefined);
    }

    setCurrentRpe('');
    stopTimer();
    setAiMessage('');
  }, [currentExerciseIndex, currentExercise.id, stopTimer, getPreviousExerciseLog, activeRoutine.id, completedWorkouts.length, currentExercise.targetSets]);

  const handleLogSet = () => {
    if (!currentWeight || !currentReps) return;

    logSet({
      weightKg: currentWeight,
      reps: currentReps,
      rpe: '8',
    });
    
    soundManager.play('complete');
    
    // AI Progression Logic (Update suggestion after each set)
    const simulatedArrayForAI = [...currentExerciseSets, {
      setNumber: currentExerciseSets.length + 1,
      weightKg: currentWeight,
      reps: currentReps,
      rpe: currentRpe,
    }];

    const recentSetsData = simulatedArrayForAI.map(s => ({
      weightKg: parseFloat(s.weightKg),
      reps: parseInt(s.reps, 10),
      targetReps: currentExercise.targetSets,
      restSeconds: 90,
      rpe: 8
    }));
    
    const routineCompletions = completedWorkouts.filter(w => w.routineId === activeRoutine.id).length;
    const progression = calculateProgression(recentSetsData, routineCompletions + 1);
    
    setAiMessage(progression.messageToUser);
    setSuggestedWeight(progression.suggestedWeight);

    startTimer(90);
    setCurrentReps('');
  };

  const isReadyToAdvance = currentExerciseSets.length >= currentExercise.targetSets;

  return (
    <LinearGradient colors={[theme.colors.surface, theme.colors.background]} style={[styles.background, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoiding} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[
            styles.container,
            isLargeScreen && { alignSelf: 'center', width: '100%', maxWidth: contentMaxWidth }
          ]}>
            
            {isExerciseSelectionMode ? (
              <ExerciseSelector 
                activeRoutine={activeRoutine}
                sessionLogs={sessionLogs}
                selectExercise={selectExercise}
                onFinishWorkout={finishWorkout}
                onAbortWorkout={abortWorkout}
                onSwapExercise={setExerciseToSwap}
                insets={insets}
              />
            ) : (
              <LoggingInterface 
                currentExercise={currentExercise}
                currentExerciseSets={currentExerciseSets}
                currentExerciseIndex={currentExerciseIndex}
                totalExercises={activeRoutine.exercises.length}
                currentWeight={currentWeight}
                setCurrentWeight={setCurrentWeight}
                currentReps={currentReps}
                setCurrentReps={setCurrentReps}
                onLogSet={handleLogSet}
                onReturnToSelection={returnToSelection}
                onAbortWorkout={abortWorkout}
                onShowTechnicalModal={() => setIsModalVisible(true)}
                isReadyToAdvance={isReadyToAdvance}
                suggestedWeight={suggestedWeight}
                insets={insets}
              />
            )}

            {isActive && (
              <RestTimerOverlay 
                remainingSeconds={remainingSeconds}
                aiMessage={aiMessage}
                onSkip={stopTimer}
              />
            )}

            <TechnicalModal 
              visible={isModalVisible} 
              onClose={() => setIsModalVisible(false)} 
              exerciseName={currentExercise.name}
              videoUrl={currentExercise.videoUrl}
            />

            <ExerciseSwapModal 
              visible={!!exerciseToSwap}
              onClose={() => setExerciseToSwap(null)}
              exerciseToReplace={exerciseToSwap}
              onSelectSwap={(newExercise) => {
                if (exerciseToSwap) {
                  swapExerciseInActiveRoutine(exerciseToSwap.id, newExercise);
                }
                setExerciseToSwap(null);
              }}
            />

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

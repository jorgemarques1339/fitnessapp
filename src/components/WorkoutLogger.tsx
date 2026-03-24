import React, { useState, useEffect, useRef } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, SlideInDown, ZoomOut } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
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
import LoggingInterface from './logger/LoggingInterface';
import SuccessGlow from './common/SuccessGlow';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

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
  const updateCurrentSetLog = useWorkoutStore(state => state.updateCurrentSetLog);

  // Local UI State
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentReps, setCurrentReps] = useState('');
  const [currentRpe, setCurrentRpe] = useState('');
  const [currentNote, setCurrentNote] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [suggestedWeight, setSuggestedWeight] = useState<number | undefined>(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [exerciseToSwap, setExerciseToSwap] = useState<ExerciseDef | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  if (!activeRoutine) return null;
  const currentExercise = activeRoutine.exercises[currentExerciseIndex];

  // Timer Hook
  const { remainingSeconds, isActive, startTimer, stopTimer } = useWorkoutTimer({
    exerciseName: currentExercise?.name,
    totalSets: currentExercise?.targetSets,
    currentSet: currentExerciseSets.length + 1
  });

  // If we are in logging mode but somehow the exercise is missing, return to selection or show error
  if (!isExerciseSelectionMode && !currentExercise) {
    return null; 
  }

  // Sync inputs with previous logs
  useEffect(() => {
    if (!currentExercise || !activeRoutine) return;
    const prevLog = getPreviousExerciseLog(currentExercise.id);
    
    if (prevLog && prevLog.sets.length > 0) {
      const bestSet = prevLog.sets.reduce((prev: any, current: any) => 
        (parseFloat(prev.weightKg || '0') > parseFloat(current.weightKg || '0')) ? prev : current
      );
      setCurrentWeight(bestSet.weightKg);
      setCurrentReps(bestSet.reps);

      // Pre-calculate suggestion from previous session
      const recentSetsData = prevLog.sets.map((s: any) => ({
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
  }, [currentExerciseIndex, currentExercise?.id, stopTimer, getPreviousExerciseLog, activeRoutine.id, completedWorkouts.length, currentExercise?.targetSets]);

  const handleLogSet = (mediaUri?: string, mediaType?: 'photo' | 'video') => {
    if (!currentWeight || !currentReps || !currentExercise || !activeRoutine) return;

    logSet({
      weightKg: currentWeight,
      reps: currentReps,
      rpe: '8',
      note: currentNote.trim() || undefined,
      mediaUri,
      mediaType,
    });
    
    // Check for Personal Record (PR) - if current weight > max weight in previous session
    const prevLog = getPreviousExerciseLog(currentExercise.id);
    const prevMaxWeight = prevLog?.sets.reduce((max, s) => Math.max(max, parseFloat(s.weightKg)), 0) || 0;
    const isPR = parseFloat(currentWeight) > prevMaxWeight && prevMaxWeight > 0;

    if (isPR) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      soundManager.play('success');
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      soundManager.play('complete');
    }
    
    // AI Progression Logic (Update suggestion after each set)
    const simulatedArrayForAI = [...currentExerciseSets, {
      setNumber: currentExerciseSets.length + 1,
      weightKg: currentWeight,
      reps: currentReps,
      rpe: currentRpe,
    }];

    const recentSetsData = simulatedArrayForAI.map((s: any) => ({
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
    setCurrentNote('');
  };

  const handleStopTimer = () => {
    stopTimer();
    setAiMessage('');
  };

  const isReadyToAdvance = currentExerciseSets.length >= currentExercise.targetSets;

  // Previous session sets for the current exercise
  const previousSets = React.useMemo(() => {
    const prevLog = getPreviousExerciseLog(currentExercise.id);
    return prevLog?.sets ?? [];
  }, [currentExercise.id]);

  // Progress bar: exercises with >= targetSets logged sets
  const completedExercisesCount = React.useMemo(() => {
    return activeRoutine.exercises.filter(ex => {
      const log = sessionLogs.find(l => l.exerciseId === ex.id);
      return log && log.sets.length >= ex.targetSets;
    }).length;
  }, [sessionLogs, activeRoutine.exercises]);

  const totalExercises = activeRoutine.exercises.length;
  const progressPct = totalExercises > 0 ? completedExercisesCount / totalExercises : 0;

  // Animated progress bar width
  const progressWidth = useSharedValue(0);
  useEffect(() => {
    progressWidth.value = withTiming(progressPct, { duration: 600 });
  }, [progressPct]);
  const animProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%` as any,
  }));

  return (
    <AnimatedGradient 
      entering={Platform.OS === 'web' ? undefined : SlideInDown.duration(400).springify().damping(18)}
      exiting={Platform.OS === 'web' ? undefined : ZoomOut.duration(200)}
      colors={[theme.colors.surface, theme.colors.background]} 
      style={[styles.background, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoiding} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[
            styles.container,
            isLargeScreen && { alignSelf: 'center', width: '100%', maxWidth: contentMaxWidth }
          ]}>

            {/* Progress Bar Widget */}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarTrack, { backgroundColor: 'rgba(255,255,255,0.07)' }]}>
                <Animated.View style={[styles.progressBarFill, animProgressStyle]} />
              </View>
              <Text style={[styles.progressLabel, { color: completedExercisesCount === totalExercises ? '#00E676' : theme.colors.textMuted }]}>
                {completedExercisesCount}/{totalExercises} exercícios
              </Text>
            </View>
            
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
                currentNote={currentNote}
                setCurrentNote={setCurrentNote}
                previousSets={previousSets}
                onLogSet={handleLogSet}
                onReturnToSelection={returnToSelection}
                onAbortWorkout={abortWorkout}
                onShowTechnicalModal={() => setIsModalVisible(true)}
                isReadyToAdvance={isReadyToAdvance}
                suggestedWeight={suggestedWeight}
                insets={insets}
                timerActive={isActive}
                remainingSeconds={remainingSeconds}
                aiMessage={aiMessage}
                onStopTimer={handleStopTimer}
                onUpdateSetMedia={updateCurrentSetLog}
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

            {showSuccess && (
              <SuccessGlow onAnimationComplete={() => setShowSuccess(false)} />
            )}

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AnimatedGradient>
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
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 6,
    paddingBottom: 4,
  },
  progressBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#00E676',
    shadowColor: '#00E676',
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    minWidth: 80,
    textAlign: 'right',
  },
});

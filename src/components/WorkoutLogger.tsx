import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Play, Focus, Info, ChevronLeft, ArrowRightLeft } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { calculateProgression, SetData } from '../utils/progression';
import { ExerciseDef } from '../data/routines';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { useWorkoutStore } from '../store/useWorkoutStore';
import TechnicalModal from './TechnicalModal';
import SwipeButton from './SwipeButton';
import ExerciseSwapModal from './ExerciseSwapModal';
import { theme } from '../theme/theme';
import AnimatedPressable from './common/AnimatedPressable';

export default function WorkoutLogger() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const contentMaxWidth = 768;

  const activeRoutine = useWorkoutStore(state => state.activeRoutine);
  const currentExerciseIndex = useWorkoutStore(state => state.currentExerciseIndex);
  const currentExerciseSets = useWorkoutStore(state => state.currentExerciseSets);
  const isExerciseSelectionMode = useWorkoutStore(state => state.isExerciseSelectionMode);
  
  const sessionLogs = useWorkoutStore(state => state.sessionLogs);
  const selectExercise = useWorkoutStore(state => state.selectExercise);
  const returnToSelection = useWorkoutStore(state => state.returnToSelection);

  const logSet = useWorkoutStore(state => state.logSet);
  const finishWorkout = useWorkoutStore(state => state.finishWorkout);
  const getPreviousExerciseLog = useWorkoutStore(state => state.getPreviousExerciseLog);
  const completedWorkouts = useWorkoutStore(state => state.completedWorkouts);
  const swapExerciseInActiveRoutine = useWorkoutStore(state => state.swapExerciseInActiveRoutine);
  const abortWorkout = useWorkoutStore(state => state.abortWorkout);

  if (!activeRoutine) return null;
  const currentExercise = activeRoutine.exercises[currentExerciseIndex];

  const [currentWeight, setCurrentWeight] = useState('');
  const [currentReps, setCurrentReps] = useState('');
  const [currentRpe, setCurrentRpe] = useState('');
  
  const [aiMessage, setAiMessage] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [exerciseToSwap, setExerciseToSwap] = useState<ExerciseDef | null>(null);

  const { remainingSeconds, isActive, startTimer, stopTimer } = useWorkoutTimer();

  useEffect(() => {
    const prevLog = getPreviousExerciseLog(currentExercise.id);
    
    if (prevLog && prevLog.sets.length > 0) {
      const bestSet = prevLog.sets.reduce((prev, current) => 
        (parseFloat(prev.weightKg || '0') > parseFloat(current.weightKg || '0')) ? prev : current
      );
      setCurrentWeight(bestSet.weightKg);
      setCurrentReps(bestSet.reps);
    } else {
      setCurrentWeight('');
      setCurrentReps('');
    }

    setCurrentRpe('');
    stopTimer();
    setAiMessage('');
  }, [currentExerciseIndex, currentExercise.id, stopTimer, getPreviousExerciseLog]);

  const handleLogSet = () => {
    if (!currentWeight || !currentReps || !currentRpe) return;

    logSet({
      weightKg: currentWeight,
      reps: currentReps,
      rpe: currentRpe,
    });
    
    const simulatedArrayForAI = [...currentExerciseSets, {
      setNumber: currentExerciseSets.length + 1,
      weightKg: currentWeight,
      reps: currentReps,
      rpe: currentRpe,
    }];

    const recentSetsData: SetData[] = simulatedArrayForAI.map(s => ({
      weightKg: parseFloat(s.weightKg),
      reps: parseInt(s.reps, 10),
      targetReps: currentExercise.targetSets,
      restSeconds: 90,
      rpe: parseFloat(s.rpe)
    }));
    
    const routineCompletions = completedWorkouts.filter(w => w.routineId === activeRoutine.id).length;
    const consecutiveWeeks = Math.max(1, routineCompletions + 1);

    const progression = calculateProgression(recentSetsData, consecutiveWeeks);
    setAiMessage(progression.messageToUser);

    startTimer(90);
    
    setCurrentRpe('');
    setCurrentReps('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isReadyToAdvance = currentExerciseSets.length >= currentExercise.targetSets;

  if (isExerciseSelectionMode) {
    return (
      <>
      <LinearGradient colors={[theme.colors.surface, theme.colors.background]} style={styles.background}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[
            styles.container,
            isLargeScreen && { alignSelf: 'center', width: '100%', maxWidth: contentMaxWidth }
          ]}>
            <View style={[styles.topBar, { marginTop: Math.max(insets.top, 10) }]}>
              <View style={styles.badge}>
                <BlurView intensity={20} tint="light" style={styles.glassBadge}>
                  <Text style={styles.routineTitle}>{activeRoutine.title}</Text>
                </BlurView>
              </View>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 16, paddingBottom: 120 }}
            >
              <View style={styles.titleRow}>
                <Text style={styles.header}>Selecionar Exercício</Text>
              </View>

              {activeRoutine.exercises.map((exercise, index) => {
                const log = sessionLogs.find(l => l.exerciseId === exercise.id);
                const completedSetsCount = log ? log.sets.length : 0;
                const isComplete = completedSetsCount >= exercise.targetSets;
                
                return (
                  <AnimatedPressable 
                    key={exercise.id} 
                    onPress={() => selectExercise(index)}
                    style={styles.cardContainer}
                    hapticFeedback="light"
                  >
                    <BlurView 
                      intensity={isComplete ? 10 : 25} 
                      tint="dark" 
                      style={styles.exerciseListCard}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          color: isComplete ? 'rgba(255,255,255,0.5)' : '#FFF', 
                          fontSize: 18, 
                          fontFamily: theme.typography.fonts.bold, 
                          marginBottom: 4 
                        }}>
                          {exercise.name}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: theme.typography.fonts.medium }}>
                          {completedSetsCount} de {exercise.targetSets} séries concluídas
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                        <TouchableOpacity 
                          style={styles.swapMiniBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            setExerciseToSwap(exercise);
                          }}
                        >
                          <ArrowRightLeft color="#FFD700" size={20} />
                        </TouchableOpacity>
                        <View style={[styles.listExerciseAction, isComplete && { borderColor: 'rgba(0, 230, 118, 0.2)' }]}>
                          <Play color={isComplete ? "#00E676" : "#38BDF8"} size={20} />
                        </View>
                      </View>
                    </BlurView>
                  </AnimatedPressable>
                );
              })}

              <AnimatedPressable style={styles.abortBtnSmall} onPress={abortWorkout} hapticFeedback="medium">
                <Text style={styles.quitButtonText}>Sair sem Guardar</Text>
              </AnimatedPressable>
            </ScrollView>

            <View style={[styles.stickyFooterBase, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <LinearGradient
                colors={['transparent', theme.colors.background]}
                style={styles.footerGradient}
                pointerEvents="none"
              />
              <AnimatedPressable style={styles.nextButtonGlow} onPress={finishWorkout} hapticFeedback="success" scaleTo={0.95}>
                <LinearGradient
                  colors={['#FFD700', '#FFA000']}
                  style={styles.nextGradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[styles.nextButtonText, { color: '#000' }]}>Finalizar Sessão!</Text>
                </LinearGradient>
              </AnimatedPressable>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
      
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
      </>
    );
  }

  return (
    <LinearGradient colors={[theme.colors.surface, theme.colors.background]} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoiding} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[
            styles.container,
            isLargeScreen && { alignSelf: 'center', width: '100%', maxWidth: contentMaxWidth }
          ]}>
            
            {/* Top Navigation */}
            <View style={[styles.topBar, { marginTop: Math.max(insets.top, 10) }]}>
              <TouchableOpacity onPress={returnToSelection} style={styles.badge}>
                <BlurView intensity={20} tint="light" style={styles.glassBadge}>
                  <Text style={styles.routineTitle}>← LISTA DE EXERCÍCIOS</Text>
                </BlurView>
              </TouchableOpacity>
              <Text style={styles.counterText}>
                {currentExerciseIndex + 1} / {activeRoutine.exercises.length}
              </Text>
            </View>

            {/* Main Header */}
            <View style={styles.titleRow}>
              <Text style={styles.header} numberOfLines={2} adjustsFontSizeToFit>{currentExercise.name}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                <BlurView intensity={40} tint="dark" style={styles.videoButtonGlow}>
                  <Play color="#38BDF8" size={24} fill="rgba(56, 189, 248, 0.2)" />
                </BlurView>
              </TouchableOpacity>
            </View>
            
            <TechnicalModal 
              visible={isModalVisible} 
              onClose={() => setIsModalVisible(false)} 
              exerciseName={currentExercise.name}
              videoUrl={currentExercise.videoUrl}
            />

            {/* Rest Timer Overlay */}
            {isActive && (
              <Animated.View entering={FadeIn.duration(300)} style={StyleSheet.absoluteFillObject}>
                <BlurView intensity={80} tint="dark" style={styles.restingOverlay}>
                  <View style={styles.timerCircle}>
                    <Text style={styles.restTitle}>RECUPERAÇÃO</Text>
                    <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
                  </View>
                  
                  <View style={styles.aiGlowBox}>
                    <Info color="#38BDF8" size={20} style={{ marginBottom: 10 }} />
                    <Text style={styles.aiMessage}>"{aiMessage}"</Text>
                  </View>

                  <TouchableOpacity style={styles.skipButtonActive} onPress={stopTimer}>
                    <BlurView intensity={30} tint="light" style={styles.glassSkip}>
                      <Text style={styles.skipButtonText}>Ignorar Descanso</Text>
                    </BlurView>
                  </TouchableOpacity>
                </BlurView>
              </Animated.View>
            )}

            {/* History Feed */}
            <ScrollView 
              style={styles.historyContainer} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 180 }}
            >
              {/* Technical Focus Note */}
              <Animated.View entering={FadeInDown.duration(400)}>
                <BlurView intensity={20} tint="dark" style={styles.notesContainer}>
                  <View style={styles.notesHeader}>
                    <Focus color="#38BDF8" size={14} />
                    <Text style={styles.notesTitle}>Foco Técnico</Text>
                  </View>
                  <Text style={styles.notesText}>{currentExercise.notes}</Text>
                </BlurView>
              </Animated.View>

              {currentExerciseSets.length > 0 && (
                 <Text style={[styles.label, { textAlign: 'left', marginBottom: 12, marginLeft: 4 }]}>Séries Realizadas</Text>
              )}
              {currentExerciseSets.map((set, i) => (
                <Animated.View key={i} entering={FadeInDown.delay(i * 100)}>
                  <BlurView intensity={25} tint="dark" style={styles.setRow}>
                    <View style={styles.setLeft}>
                      <View style={styles.circleBadge}>
                        <Text style={styles.setText}>{set.setNumber}</Text>
                      </View>
                      <Text style={styles.setStatText}>{set.weightKg} kg</Text>
                    </View>

                    <View style={styles.setRight}>
                      <Text style={styles.setStatText}>{set.reps} reps</Text>
                      <View style={styles.rpeBadge}>
                        <Text style={styles.rpeText}>@ {set.rpe}</Text>
                      </View>
                    </View>
                  </BlurView>
                </Animated.View>
              ))}

              <AnimatedPressable style={styles.abortBtnSmall} onPress={abortWorkout} hapticFeedback="medium">
                <Text style={styles.quitButtonText}>Sair sem Guardar</Text>
              </AnimatedPressable>
            </ScrollView>

            {/* Inputs & Actions - STICKY FOOTER */}
            <View style={[styles.stickyFooterBase, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <LinearGradient
                colors={['transparent', theme.colors.background]}
                style={styles.footerGradient}
                pointerEvents="none"
              />
              
              <View style={styles.inputArea}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Peso</Text>
                  <BlurView intensity={40} tint="dark" style={styles.inputGlass}>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={currentWeight}
                      onChangeText={setCurrentWeight}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                    />
                  </BlurView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Reps</Text>
                  <BlurView intensity={40} tint="dark" style={styles.inputGlass}>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={currentReps}
                      onChangeText={setCurrentReps}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                    />
                  </BlurView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>RPE</Text>
                  <BlurView intensity={40} tint="dark" style={styles.inputGlass}>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={currentRpe}
                      onChangeText={setCurrentRpe}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                    />
                  </BlurView>
                </View>
              </View>

              {!isReadyToAdvance ? (
                <SwipeButton onComplete={handleLogSet} title="Deslize para Registrar" />
              ) : (
                <AnimatedPressable style={styles.nextButtonGlow} onPress={returnToSelection}>
                  <LinearGradient
                    colors={['#00E676', '#00C853']}
                    style={styles.nextGradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.nextButtonText}>Regressar à Lista</Text>
                  </LinearGradient>
                </AnimatedPressable>
              )}
            </View>
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
    paddingHorizontal: theme.spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    // marginTop handled dynamically via insets
  },
  badge: {
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
  },
  glassBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  routineTitle: {
    color: theme.colors.secondary,
    fontSize: 10,
    fontFamily: theme.typography.fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  counterText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.semiBold,
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  header: {
    fontSize: 28,
    fontFamily: theme.typography.fonts.displayBlack,
    color: theme.colors.textPrimary,
    letterSpacing: -1,
    flex: 1,
    paddingRight: 10,
  },
  videoButtonGlow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  notesContainer: {
    padding: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    ...theme.shadows.soft,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesTitle: {
    color: theme.colors.secondary,
    fontSize: 11,
    fontFamily: theme.typography.fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8,
  },
  notesText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    fontFamily: theme.typography.fonts.medium,
  },
  historyContainer: {
    flex: 1,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.cardPadding,
    borderRadius: theme.radii.lg,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  setLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  setRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  circleBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setText: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontFamily: theme.typography.fonts.bold,
  },
  setStatText: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontFamily: theme.typography.fonts.bold,
  },
  rpeBadge: {
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  rpeText: {
    color: theme.colors.danger,
    fontSize: 14,
    fontFamily: theme.typography.fonts.bold,
  },
  stickyFooterBase: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 40,
    // paddingBottom handled dynamically via insets
    zIndex: 5,
  },
  footerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.95,
  },
  inputArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontFamily: theme.typography.fonts.bold,
    letterSpacing: 1,
    textAlign: 'center',
  },
  inputGlass: {
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
  },
  input: {
    color: theme.colors.textPrimary,
    padding: 16,
    fontSize: 22,
    fontFamily: theme.typography.fonts.black,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  nextButtonGlow: {
    ...theme.shadows.premium,
  },
  nextGradientButton: {
    padding: 22,
    borderRadius: theme.radii.round,
    alignItems: 'center',
  },
  nextButtonText: {
    color: theme.colors.textInverse,
    fontFamily: theme.typography.fonts.black,
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  restingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  timerCircle: {
    alignItems: 'center',
    marginBottom: 40,
  },
  restTitle: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontFamily: theme.typography.fonts.black,
    letterSpacing: 8,
    marginBottom: 10,
  },
  timerText: {
    color: theme.colors.textPrimary,
    fontSize: 100,
    fontFamily: theme.typography.fonts.displayBlack,
    fontVariant: ['tabular-nums'],
    letterSpacing: -5,
  },
  aiGlowBox: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 32,
    marginBottom: 60,
    width: '100%',
  },
  aiMessage: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    textAlign: 'center',
    fontFamily: theme.typography.fonts.regular,
    lineHeight: 28,
  },
  skipButtonActive: {
    overflow: 'hidden',
    borderRadius: 40,
  },
  glassSkip: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontFamily: theme.typography.fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  exerciseListCard: {
    padding: theme.spacing.cardPadding,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  cardContainer: {
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  listExerciseAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swapMiniBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  abortBtnSmall: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 20,
  },
  quitButtonText: {
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 11,
    fontFamily: theme.typography.fonts.bold,
    letterSpacing: 2,
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Play, Focus, Info, Check, ChevronLeft, ArrowRightLeft } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn, FadeOutUp, Layout } from 'react-native-reanimated';

import { calculateProgression, SetData } from '../utils/progression';
import { RoutineDef, ExerciseDef } from '../data/routines';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { useWorkoutStore } from '../store/useWorkoutStore';
import TechnicalModal from './TechnicalModal';
import SwipeButton from './SwipeButton';
import ExerciseSwapModal from './ExerciseSwapModal';

export default function WorkoutLogger() {
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
      <LinearGradient colors={['#0F172A', '#000000']} style={styles.background}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[
            styles.container,
            isLargeScreen && { alignSelf: 'center', width: '100%', maxWidth: contentMaxWidth }
          ]}>
            <View style={styles.topBar}>
              <View style={styles.badge}>
                <BlurView intensity={20} tint="light" style={styles.glassBadge}>
                  <Text style={styles.routineTitle}>{activeRoutine.title}</Text>
                </BlurView>
              </View>
            </View>

            <View style={styles.titleRow}>
              <Text style={styles.header}>Selecionar Exercício</Text>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
            >
              {activeRoutine.exercises.map((exercise, index) => {
                const log = sessionLogs.find(l => l.exerciseId === exercise.id);
                const completedSetsCount = log ? log.sets.length : 0;
                const isComplete = completedSetsCount >= exercise.targetSets;
                
                return (
                  <TouchableOpacity 
                    key={exercise.id} 
                    onPress={() => selectExercise(index)}
                    style={{ borderRadius: 16, overflow: 'hidden' }}
                  >
                    <BlurView 
                      intensity={isComplete ? 10 : 25} 
                      tint="dark" 
                      style={{ 
                        padding: 16, 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        borderWidth: 1, 
                        borderColor: isComplete ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255,255,255,0.1)' 
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          color: isComplete ? 'rgba(255,255,255,0.5)' : '#FFF', 
                          fontSize: 16, 
                          fontWeight: '700', 
                          marginBottom: 4 
                        }}>
                          {exercise.name}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' }}>
                          {completedSetsCount} de {exercise.targetSets} séries concluídas
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <TouchableOpacity 
                          style={styles.swapMiniBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            setExerciseToSwap(exercise);
                          }}
                        >
                          <ArrowRightLeft color="#FFD700" size={20} />
                        </TouchableOpacity>
                        <View style={styles.listExerciseAction}>
                          <Play color={isComplete ? "#00E676" : "#38BDF8"} size={20} style={{ marginLeft: 16 }} />
                        </View>
                      </View>
                    </BlurView>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.bottomArea}>
              <TouchableOpacity style={styles.nextButtonGlow} onPress={finishWorkout}>
                <LinearGradient
                  colors={['#FFD700', '#FFA000']}
                  style={styles.nextGradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[styles.nextButtonText, { color: '#000' }]}>Concluir Treino!</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quitButton} onPress={abortWorkout}>
                <Text style={styles.quitButtonText}>Sair sem Guardar</Text>
              </TouchableOpacity>
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
    <LinearGradient colors={['#0F172A', '#000000']} style={styles.background}>
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
            <View style={styles.topBar}>
              <TouchableOpacity onPress={returnToSelection} style={styles.badge}>
                <BlurView intensity={20} tint="light" style={styles.glassBadge}>
                  <Text style={styles.routineTitle}>← VOLTAR AOS EXERCÍCIOS</Text>
                </BlurView>
              </TouchableOpacity>
              <Text style={styles.counterText}>
                {currentExerciseIndex + 1} de {activeRoutine.exercises.length}
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
              contentContainerStyle={{ paddingBottom: 20 }}
            >
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
            </ScrollView>

            {/* Inputs & Actions */}
            <View style={styles.bottomArea}>
              <View style={styles.inputArea}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Carga (Kg)</Text>
                  <BlurView intensity={30} tint="dark" style={styles.inputGlass}>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={currentWeight}
                      onChangeText={setCurrentWeight}
                      placeholder="0"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                    />
                  </BlurView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Repetições</Text>
                  <BlurView intensity={30} tint="dark" style={styles.inputGlass}>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={currentReps}
                      onChangeText={setCurrentReps}
                      placeholder="0"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                    />
                  </BlurView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Esforço (RPE)</Text>
                  <BlurView intensity={30} tint="dark" style={styles.inputGlass}>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={currentRpe}
                      onChangeText={setCurrentRpe}
                      placeholder="1-10"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                    />
                  </BlurView>
                </View>
              </View>

              {!isReadyToAdvance ? (
                <View style={styles.actionRow}>
                  <SwipeButton onComplete={handleLogSet} title="Deslize para Registrar" />
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.nextButtonGlow} onPress={returnToSelection}>
                    <LinearGradient
                      colors={['#00E676', '#00C853']}
                      style={styles.nextGradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.nextButtonText}>Voltar aos Exercícios</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
              
              <TouchableOpacity style={styles.quitButton} onPress={abortWorkout}>
                <Text style={styles.quitButtonText}>Sair sem Guardar</Text>
              </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  glassBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  routineTitle: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  counterText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    flex: 1,
    paddingRight: 10,
  },
  videoButtonGlow: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  notesContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notesTitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 6,
  },
  notesText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    fontWeight: '500',
  },
  historyContainer: {
    flex: 1,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  setLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  setRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  circleBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  setText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
  },
  setStatText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  rpeBadge: {
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rpeText: {
    color: '#FF3366',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomArea: {
    marginTop: 10,
  },
  inputArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  inputGlass: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  input: {
    color: '#FFFFFF',
    padding: 18,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  actionRow: {
    marginBottom: 16,
  },
  nextButtonGlow: {
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  nextGradientButton: {
    padding: 20,
    borderRadius: 100,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quitButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  quitButtonText: {
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  restingOverlay: {
    flex: 1,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  timerCircle: {
    alignItems: 'center',
    marginBottom: 40,
  },
  restTitle: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 10,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 90,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: -3,
  },
  aiGlowBox: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    marginBottom: 50,
  },
  aiMessage: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 28,
  },
  skipButtonActive: {
    overflow: 'hidden',
    borderRadius: 30,
  },
  glassSkip: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listExerciseAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  swapMiniBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  }
});

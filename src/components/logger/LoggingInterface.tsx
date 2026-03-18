import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Play, Focus } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';
import AnimatedPressable from '../common/AnimatedPressable';
import SwipeButton from '../SwipeButton';
import { ExerciseDef } from '../../data/routines';

interface LoggingInterfaceProps {
  currentExercise: ExerciseDef;
  currentExerciseSets: any[];
  currentExerciseIndex: number;
  totalExercises: number;
  currentWeight: string;
  setCurrentWeight: (v: string) => void;
  currentReps: string;
  setCurrentReps: (v: string) => void;
  currentRpe: string;
  setCurrentRpe: (v: string) => void;
  onLogSet: () => void;
  onReturnToSelection: () => void;
  onAbortWorkout: () => void;
  onShowTechnicalModal: () => void;
  isReadyToAdvance: boolean;
  suggestedWeight?: number;
  insets: { top: number; bottom: number };
}

export default function LoggingInterface({
  currentExercise,
  currentExerciseSets,
  currentExerciseIndex,
  totalExercises,
  currentWeight,
  setCurrentWeight,
  currentReps,
  setCurrentReps,
  currentRpe,
  setCurrentRpe,
  onLogSet,
  onReturnToSelection,
  onAbortWorkout,
  onShowTechnicalModal,
  isReadyToAdvance,
  suggestedWeight,
  insets
}: LoggingInterfaceProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <View style={[styles.topBar, { marginTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity onPress={onReturnToSelection} style={styles.badge}>
          <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "light" : "dark"} style={[styles.glassBadge, { borderColor: theme.colors.border }]}>
            <Text style={[styles.routineTitle, { color: theme.colors.secondary }]}>← LISTA DE EXERCÍCIOS</Text>
          </BlurView>
        </TouchableOpacity>
        <Text style={[styles.counterText, { color: theme.colors.textMuted }]}>
          {currentExerciseIndex + 1} / {totalExercises}
        </Text>
      </View>

      {/* Main Header */}
      <View style={styles.titleRow}>
        <Text style={[styles.header, { color: theme.colors.textPrimary }]} numberOfLines={2} adjustsFontSizeToFit>{currentExercise.name}</Text>
        <TouchableOpacity onPress={onShowTechnicalModal}>
          <BlurView intensity={theme.isDark ? 40 : 60} tint={theme.isDark ? "dark" : "light"} style={[styles.videoButtonGlow, { backgroundColor: theme.colors.surfaceHighlight }]}>
            <Play color={theme.colors.secondary} size={24} fill={theme.isDark ? "rgba(56, 189, 248, 0.2)" : "transparent"} />
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* History Feed */}
      <ScrollView 
        style={styles.historyContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        {/* Technical Focus Note */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "dark" : "light"} style={[styles.notesContainer, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
            <View style={styles.notesHeader}>
              <Focus color={theme.colors.secondary} size={14} />
              <Text style={[styles.notesTitle, { color: theme.colors.secondary }]}>Foco Técnico</Text>
            </View>
            <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>{currentExercise.notes}</Text>
          </BlurView>
        </Animated.View>

        {currentExerciseSets.map((set: any, i: number) => (
          <Animated.View key={i} entering={FadeInDown.delay(i * 100)}>
            <BlurView intensity={theme.isDark ? 25 : 45} tint={theme.isDark ? "dark" : "light"} style={[styles.setRow, { backgroundColor: theme.colors.surfaceHighlight }]}>
              <View style={styles.setLeft}>
                <View style={[styles.circleBadge, { backgroundColor: theme.colors.surfaceHighlight }]}>
                  <Text style={[styles.setText, { color: theme.colors.secondary }]}>{set.setNumber}</Text>
                </View>
                <Text style={[styles.setStatText, { color: theme.colors.textPrimary }]}>{set.weightKg} kg</Text>
              </View>

              <View style={styles.setRight}>
                <Text style={[styles.setStatText, { color: theme.colors.textPrimary }]}>{set.reps} reps</Text>
                <View style={[styles.rpeBadge, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.danger, borderWidth: 1 }]}>
                  <Text style={[styles.rpeText, { color: theme.colors.danger }]}>@ {set.rpe}</Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        ))}

        <AnimatedPressable style={styles.abortBtnSmall} onPress={onAbortWorkout} hapticFeedback="medium">
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
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8, gap: 4 }}>
              <Text style={styles.label}>Peso</Text>
              {suggestedWeight && (
                <View style={[styles.aiBadge, { backgroundColor: theme.colors.secondary }]}>
                  <Text style={styles.aiBadgeText}>Sugestão IA: {suggestedWeight}kg</Text>
                </View>
              )}
            </View>
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
          <SwipeButton onComplete={onLogSet} title="Deslize para Registrar" />
        ) : (
          <AnimatedPressable 
            style={styles.nextButtonGlow} 
            onPress={onReturnToSelection}
          >
            <LinearGradient
              colors={[theme.colors.primary, '#00C853']}
              style={styles.nextGradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={{ color: theme.colors.textInverse, fontWeight: '900', fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>Regressar à Lista</Text>
            </LinearGradient>
          </AnimatedPressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  glassBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  routineTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  counterText: {
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
    fontSize: 28,
    fontWeight: '900',
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
  },
  notesContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  historyContainer: {
    flex: 1,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  setText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  setStatText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rpeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  rpeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stickyFooterBase: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 40,
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
    fontSize: 11,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  inputGlass: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  input: {
    padding: 16,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  nextButtonGlow: {
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  nextGradientButton: {
    padding: 22,
    borderRadius: 100,
    alignItems: 'center',
  },
  abortBtnSmall: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 20,
  },
  quitButtonText: {
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#94A3B8',
  },
  aiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'uppercase',
  },
});

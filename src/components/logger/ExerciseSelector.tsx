import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, ArrowRightLeft } from 'lucide-react-native';
import AnimatedPressable from '../common/AnimatedPressable';
import MagneticView from '../common/MagneticView';
import { sensoryManager } from '../../utils/SensoryManager';
import { useAppTheme } from '../../hooks/useAppTheme';
import { RoutineDef, ExerciseDef } from '../../data/routines';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { getUnderTrainedMuscles } from '../../utils/recovery';
import { theme } from '../../theme/theme';

interface ExerciseSelectorProps {
  activeRoutine: RoutineDef;
  sessionLogs: any[];
  selectExercise: (index: number) => void;
  onFinishWorkout: () => void;
  onAbortWorkout: () => void;
  onSwapExercise: (exercise: ExerciseDef) => void;
  insets: { top: number; bottom: number };
}

export default function ExerciseSelector({
  activeRoutine,
  sessionLogs,
  selectExercise,
  onFinishWorkout,
  onAbortWorkout,
  onSwapExercise,
  insets
}: ExerciseSelectorProps) {
  const appTheme = useAppTheme();
  const completedWorkouts = useHistoryStore(state => state.completedWorkouts);
  
  const recommendedMuscles = React.useMemo(() => 
    getUnderTrainedMuscles(completedWorkouts), 
  [completedWorkouts]);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { marginTop: Math.max(insets.top, 10) }]}>
        <View style={styles.badge}>
          <BlurView intensity={appTheme.isDark ? 20 : 40} tint={appTheme.isDark ? "light" : "dark"} style={[styles.glassBadge, { borderColor: appTheme.colors.border }]}>
            <Text style={[styles.routineTitle, { color: appTheme.colors.secondary }]}>{activeRoutine.title}</Text>
          </BlurView>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingBottom: 120 }}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.header, { color: appTheme.colors.textPrimary }]}>Selecionar Exercício</Text>
        </View>

        {activeRoutine.exercises.map((exercise: ExerciseDef, index: number) => {
          const log = sessionLogs.find(l => l.exerciseId === exercise.id);
          const completedSetsCount = log ? log.sets.length : 0;
          const isComplete = completedSetsCount >= exercise.targetSets;
          const isRecommended = exercise.category && recommendedMuscles.includes(exercise.category);
          
          return (
            <MagneticView key={exercise.id}>
              <AnimatedPressable 
                onPress={() => {
                  sensoryManager.trigger({ sound: 'click', haptic: 'light' });
                  selectExercise(index);
                }}
                style={[styles.cardContainer, { backgroundColor: appTheme.colors.surfaceHighlight }]}
                hapticFeedback="light"
              >
                <BlurView 
                  intensity={isComplete ? (appTheme.isDark ? 10 : 20) : (appTheme.isDark ? 25 : 45)} 
                  tint={appTheme.isDark ? "dark" : "light"} 
                  style={styles.exerciseListCard}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text style={{ 
                        color: isComplete ? appTheme.colors.textMuted : appTheme.colors.textPrimary, 
                        fontSize: 18, 
                        fontFamily: appTheme.typography.fonts.bold, 
                        marginBottom: 4 
                      }}>
                        {exercise.name}
                      </Text>
                      {isRecommended && !isComplete && (
                        <View style={[styles.recBadge, { backgroundColor: appTheme.colors.primary + '20', borderColor: appTheme.colors.primary }]}>
                          <Text style={[styles.recBadgeText, { color: appTheme.colors.primary }]}>Recomendado</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ color: appTheme.colors.textSecondary, fontSize: 13, fontFamily: appTheme.typography.fonts.medium }}>
                      {completedSetsCount} de {exercise.targetSets} séries concluídas
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <TouchableOpacity 
                      style={[styles.swapMiniBtn, { backgroundColor: appTheme.colors.surfaceHighlight }]}
                      onPress={(e) => {
                        sensoryManager.trigger({ sound: 'pop', haptic: 'medium' });
                        e.stopPropagation();
                        onSwapExercise(exercise);
                      }}
                    >
                      <ArrowRightLeft color={appTheme.colors.accent} size={20} />
                    </TouchableOpacity>
                    <View style={[styles.listExerciseAction, { backgroundColor: appTheme.colors.surfaceHighlight }, isComplete && { borderColor: appTheme.colors.primary }]}>
                      <Play color={isComplete ? appTheme.colors.primary : appTheme.colors.secondary} size={20} />
                    </View>
                  </View>
                </BlurView>
              </AnimatedPressable>
            </MagneticView>
          );
        })}

        <AnimatedPressable style={styles.abortBtnSmall} onPress={onAbortWorkout} hapticFeedback="medium">
          <Text style={styles.quitButtonText}>Sair sem Guardar</Text>
        </AnimatedPressable>
      </ScrollView>

      <View 
        style={[styles.stickyFooterBase, { paddingBottom: Math.max(insets.bottom, 20) }]}
        pointerEvents="box-none"
      >
        <LinearGradient
          colors={['transparent', appTheme.colors.background]}
          style={styles.footerGradient}
          pointerEvents="none"
        />
        <AnimatedPressable 
          style={styles.nextButtonGlow} 
          onPress={() => {
            sensoryManager.trigger({ sound: 'success', haptic: 'success' });
            onFinishWorkout();
          }} 
          hapticFeedback="success" 
          scaleTo={0.95}
        >
          <LinearGradient
            colors={[appTheme.colors.accent, '#FFA000']}
            style={styles.nextGradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.nextButtonText, { color: appTheme.colors.textInverse }]}>Finalizar Sessão!</Text>
          </LinearGradient>
        </AnimatedPressable>
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
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  exerciseListCard: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  swapMiniBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listExerciseAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  abortBtnSmall: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 20,
  },
  quitButtonText: {
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
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
  nextButtonGlow: {
    shadowColor: '#FF6F00',
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
  nextButtonText: {
    fontWeight: '900',
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
  recBadgeText: {
    fontSize: 9,
    fontFamily: theme.typography.fonts.bold,
    textTransform: 'uppercase',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronRight, Play, Activity, Plus } from 'lucide-react-native';

import { ROUTINES, RoutineDef } from '../data/routines';
import { useWorkoutStore } from '../store/useWorkoutStore';
import TonnageChart from './TonnageChart';
import RoutineBuilderModal from './RoutineBuilderModal';
import WeeklyProgressRing from './WeeklyProgressRing';
import { theme } from '../theme/theme';
import AnimatedPressable from './common/AnimatedPressable';

interface DashboardProps {
  onSelectRoutine: (routine: RoutineDef) => void;
  onResumeWorkout: () => void;
}

export default function Dashboard({ onSelectRoutine, onResumeWorkout }: DashboardProps) {
  const activeRoutine = useWorkoutStore(state => state.activeRoutine);
  const completedWorkouts = useWorkoutStore(state => state.completedWorkouts);
  const customRoutines = useWorkoutStore(state => state.customRoutines);
  const saveCustomRoutine = useWorkoutStore(state => state.saveCustomRoutine);

  const [isBuilderVisible, setIsBuilderVisible] = React.useState(false);

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const contentMaxWidth = 768;

  const safeWorkouts = completedWorkouts || [];
  const recentWorkouts = [...safeWorkouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-6);
  
  let tonnageLabels = recentWorkouts.map((w, i) => `T${i + 1}`);
  let tonnageData = recentWorkouts.map(w => w.totalTonnageKg / 1000);

  if (tonnageData.length === 0) {
    tonnageLabels = ['Início', 'Hoje'];
    tonnageData = [0, 0];
  } else if (tonnageData.length === 1) {
    tonnageLabels = ['', 'T1'];
    tonnageData = [0, tonnageData[0]];
  }

  return (
    <LinearGradient
      colors={[theme.colors.surface, theme.colors.background]}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={[
            styles.contentContainer,
            { 
              paddingTop: Math.max(insets.top, 20), 
              paddingBottom: Math.max(insets.bottom, 60) 
            },
            isLargeScreen && { alignItems: 'center' }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.innerContent, isLargeScreen && { width: contentMaxWidth }]}>
            <View style={styles.header}>
              <Text style={styles.greeting}>Bem-vindo, Atleta</Text>
              <Text style={styles.subtitle}>Pronto para destruir metas hoje?</Text>
            </View>

            <WeeklyProgressRing completed={safeWorkouts.length % 5} total={5} />

            <View style={styles.chartWrapper}>
              <TonnageChart 
                title="Progresso de Tonelagem (Kg)" 
                labels={tonnageLabels} 
                data={tonnageData} 
              />
            </View>

            {activeRoutine && (
              <AnimatedPressable 
                onPress={onResumeWorkout} 
                style={styles.recoveryMargin}
                hapticFeedback="light"
                scaleTo={0.97}
              >
                <BlurView intensity={30} tint="dark" style={styles.glassCard}>
                  <View style={styles.recoveryContent}>
                    <View style={styles.recoveryIconBox}>
                      <Activity color={theme.colors.danger} size={24} />
                    </View>
                    <View style={styles.recoveryTexts}>
                      <Text style={styles.recoveryTitle}>⏱️ Treino em Andamento</Text>
                      <Text style={styles.recoverySubtitle}>{activeRoutine.title}</Text>
                    </View>
                    <ChevronRight color={theme.colors.textMuted} size={20} />
                  </View>
                </BlurView>
              </AnimatedPressable>
            )}

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Meus Treinos</Text>
              <AnimatedPressable onPress={() => setIsBuilderVisible(true)} hapticFeedback="light">
                <BlurView intensity={20} tint="light" style={styles.createBtn}>
                  <Plus color={theme.colors.secondary} size={16} style={{ marginRight: 6 }} />
                  <Text style={styles.createBtnText}>Novo</Text>
                </BlurView>
              </AnimatedPressable>
            </View>

            {customRoutines.length === 0 ? (
              <View style={styles.emptyCustomState}>
                <Text style={styles.emptyCustomText}>Ainda não criou treinos próprios.</Text>
              </View>
            ) : (
              <View style={styles.routinesGrid}>
                {customRoutines.map((routine) => (
                  <AnimatedPressable 
                    key={routine.id}
                    onPress={() => onSelectRoutine(routine)}
                    style={styles.cardContainer}
                    hapticFeedback="medium"
                  >
                    <BlurView intensity={25} tint="dark" style={styles.glassCard}>
                      <View style={[styles.cardIndicator, { backgroundColor: theme.colors.accent }]} />
                      <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardTitle}>{routine.title}</Text>
                          <Play color={theme.colors.textSecondary} size={20} />
                        </View>
                        
                        <Text style={styles.cardSubtitle}>{routine.subtitle}</Text>
                        
                        <View style={styles.tagContainer}>
                          <BlurView intensity={20} tint="light" style={styles.glassTag}>
                            <Text style={styles.tagText}>{routine.exercises.length} Excs</Text>
                          </BlurView>
                        </View>
                      </View>
                    </BlurView>
                  </AnimatedPressable>
                ))}
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 40 }]}>Planos Predefinidos</Text>
            
            <View style={styles.routinesGrid}>
              {ROUTINES.map((routine) => (
                <AnimatedPressable 
                  key={routine.id}
                  onPress={() => onSelectRoutine(routine)}
                  style={styles.cardContainer}
                  hapticFeedback="medium"
                >
                  <BlurView intensity={25} tint="dark" style={styles.glassCard}>
                    <View style={styles.cardIndicator} />
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{routine.title}</Text>
                        <Play color={theme.colors.textSecondary} size={20} />
                      </View>
                      
                      <Text style={styles.cardSubtitle}>{routine.subtitle}</Text>
                      
                      <View style={styles.tagContainer}>
                        <BlurView intensity={20} tint="light" style={styles.glassTag}>
                          <Text style={styles.tagText}>{routine.exercises.length} Excs</Text>
                        </BlurView>
                      </View>
                    </View>
                  </BlurView>
                </AnimatedPressable>
              ))}
            </View>
          </View>
        </ScrollView>

        <RoutineBuilderModal 
          visible={isBuilderVisible}
          onClose={() => setIsBuilderVisible(false)}
          onSave={(routine) => saveCustomRoutine(routine)}
        />
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
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    // paddingTop and paddingBottom are now dynamic via useSafeAreaInsets
  },
  innerContent: {
    flex: 1,
    width: '100%',
  },
  header: {
    marginBottom: theme.spacing.xxl,
  },
  greeting: {
    fontSize: theme.typography.sizes.displayLarge,
    fontFamily: theme.typography.fonts.displayBlack,
    color: theme.colors.textPrimary,
    letterSpacing: -1,
    lineHeight: theme.typography.sizes.displayLarge * 1.1,
  },
  subtitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  chartWrapper: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.display,
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  createBtnText: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.sm,
    textTransform: 'uppercase',
  },
  emptyCustomState: {
    padding: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyCustomText: {
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fonts.medium,
    fontSize: theme.typography.sizes.md,
    fontStyle: 'italic',
  },
  routinesGrid: {
    gap: theme.spacing.md,
  },
  cardContainer: {
    overflow: 'hidden',
    borderRadius: theme.radii.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  glassCard: {
    flexDirection: 'row',
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  cardIndicator: {
    width: 6,
    backgroundColor: theme.colors.secondary,
  },
  cardContent: {
    flex: 1,
    padding: theme.spacing.cardPadding,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  tagContainer: {
    flexDirection: 'row',
  },
  glassTag: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.sm,
  },
  recoveryMargin: {
    marginBottom: theme.spacing.xl,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
  },
  recoveryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  recoveryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  recoveryTexts: {
    flex: 1,
  },
  recoveryTitle: {
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  recoverySubtitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.semiBold,
  },
});

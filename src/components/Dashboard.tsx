import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Platform, 
  useWindowDimensions, 
  Pressable, 
  GestureResponderEvent,
  Modal,
  LayoutAnimation
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronRight, Play, Activity, Plus, Trash2 } from 'lucide-react-native';
import { Alert } from 'react-native';

import { ROUTINES, RoutineDef } from '../data/routines';
import { useWorkoutStore } from '../store/useWorkoutStore';
import RoutineBuilderModal from './RoutineBuilderModal';
import { theme } from '../theme/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import AnimatedPressable from './common/AnimatedPressable';
import MagneticView from './common/MagneticView';
import { soundManager } from '../utils/SoundManager';
import { calculateMuscleFatigue, MuscleFatigue } from '../utils/fatigue';
import WeeklyDashboard from './WeeklyDashboard';
import AICoachCard from './AICoachCard';
import PremiumCard from './common/PremiumCard';
import EmptyWorkoutIllustration from './common/EmptyWorkoutIllustration';
import StatusPill from './common/StatusPill';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';


interface DashboardProps {
  onSelectRoutine: (routine: RoutineDef) => void;
  onResumeWorkout: () => void;
}

export default function Dashboard({ onSelectRoutine, onResumeWorkout }: DashboardProps) {
  const activeRoutine = useWorkoutStore(state => state.activeRoutine);
  const completedWorkouts = useWorkoutStore(state => state.completedWorkouts);
  const customRoutines = useWorkoutStore(state => state.customRoutines);
  const saveCustomRoutine = useWorkoutStore(state => state.saveCustomRoutine);
  const deleteCustomRoutine = useWorkoutStore(state => state.deleteCustomRoutine);
  const theme = useAppTheme();

  const [isBuilderVisible, setIsBuilderVisible] = React.useState(false);
  
  const toggleBuilder = (visible: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsBuilderVisible(visible);
  };

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const contentMaxWidth = 768;

  const safeWorkouts = completedWorkouts || [];

  const [routineToDelete, setRoutineToDelete] = React.useState<{id: string, title: string} | null>(null);

  const handleDeletePress = (id: string, title: string) => {
    soundManager.play('click');
    setRoutineToDelete({ id, title });
  };

  const confirmDelete = () => {
    if (routineToDelete) {
      soundManager.play('pop');
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      deleteCustomRoutine(routineToDelete.id);
      setRoutineToDelete(null);
    }
  };

  const cancelDelete = () => {
    setRoutineToDelete(null);
  };

  return (
    <LinearGradient
      colors={[theme.colors.surface, theme.colors.background]}
      style={[styles.background, { backgroundColor: theme.colors.background }]}
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

            {/* AI Coach: workout recommendation + deload + volume advice */}
            <AICoachCard
              completedWorkouts={safeWorkouts}
              routines={[...ROUTINES, ...customRoutines]}
              onSelectRoutine={onSelectRoutine}
            />

            {/* Weekly Dashboard: streak + stats + volume by muscle */}
            <WeeklyDashboard completedWorkouts={safeWorkouts} />

            {activeRoutine && (
              <AnimatedPressable 
                onPress={() => {
                  soundManager.play('click');
                  onResumeWorkout();
                }} 
                style={styles.recoveryMargin}
                hapticFeedback="light"
                scaleTo={0.97}
              >
                <PremiumCard 
                  style={styles.recoveryMargin}
                  variant="alert"
                >
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
                </PremiumCard>
              </AnimatedPressable>
            )}

            <View style={styles.fatigueHeader}>
              <Text style={styles.sectionTitle}>Recuperação Muscular</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.fatigueScroll}
            >
              {calculateMuscleFatigue(safeWorkouts).map((item) => (
                <FatigueCard key={item.muscle} item={item} theme={theme} />
              ))}
            </ScrollView>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Meus Treinos</Text>
                <AnimatedPressable 
                onPress={() => {
                  soundManager.play('pop');
                  toggleBuilder(true);
                }} 
                hapticFeedback="light"
              >
                <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "light" : "dark"} style={[styles.createBtn, { borderColor: theme.colors.secondary }]}>
                  <Plus color={theme.colors.secondary} size={16} style={{ marginRight: 6 }} />
                  <Text style={styles.createBtnText}>Novo</Text>
                </BlurView>
              </AnimatedPressable>
            </View>

            {customRoutines.length === 0 ? (
              <View style={styles.emptyCustomState}>
                <EmptyWorkoutIllustration />
                <Text style={[styles.emptyCustomText, { color: theme.colors.textPrimary }]}>Nada por aqui ainda...</Text>
                <Text style={[styles.emptyCustomSubtext, { color: theme.colors.textMuted }]}>
                  Cria o teu primeiro treino personalizado para começares a evoluir!
                </Text>
                <TouchableOpacity 
                  onPress={() => toggleBuilder(true)}
                  style={[styles.emptyCreateBtn, { backgroundColor: theme.colors.primary }]}
                >
                  <Plus color="#000" size={18} />
                  <Text style={styles.emptyCreateBtnText}>Criar Treino</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.routinesGrid}>
                {customRoutines.map((routine) => (
                  <MagneticView key={routine.id}>
                    <AnimatedPressable 
                      onPress={() => {
                        soundManager.play('click');
                        onSelectRoutine(routine);
                      }}
                      style={styles.cardContainer}
                      hapticFeedback="medium"
                    >
                      <PremiumCard variant="ghost" intensity={theme.isDark ? 30 : 50}>
                        <View style={[styles.cardIndicator, { backgroundColor: theme.colors.accent }]} />
                        <View style={styles.cardContent}>
                          <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{routine.title}</Text>
                            <View style={styles.cardActions}>
                              <Pressable 
                                onPress={(e: GestureResponderEvent) => {
                                  e.stopPropagation();
                                  handleDeletePress(routine.id, routine.title);
                                }}
                                style={({ pressed }: { pressed: boolean }) => [
                                  styles.deleteBtn,
                                  { opacity: pressed ? 0.3 : 1, zIndex: 999 }
                                ]}
                                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                              >
                                <Trash2 color={theme.colors.danger} size={18} opacity={0.6} />
                              </Pressable>
                              <Play color={theme.colors.textSecondary} size={20} />
                            </View>
                          </View>
                          
                          <Text style={styles.cardSubtitle}>{routine.subtitle}</Text>
                          
                          <View style={styles.tagContainer}>
                            <View style={[styles.glassTag, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
                              <Text style={styles.tagText}>{routine.exercises.length} Excs</Text>
                            </View>
                          </View>
                        </View>
                      </PremiumCard>
                    </AnimatedPressable>
                  </MagneticView>
                ))}
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 40 }]}>Planos Predefinidos</Text>
            
            <View style={styles.routinesGrid}>
              {ROUTINES.map((routine) => (
                <MagneticView key={routine.id}>
                  <AnimatedPressable 
                    onPress={() => {
                        soundManager.play('click');
                        onSelectRoutine(routine);
                    }}
                    style={styles.cardContainer}
                    hapticFeedback="medium"
                  >
                    <PremiumCard variant="ghost" intensity={theme.isDark ? 30 : 50}>
                      <View style={[styles.cardIndicator, { backgroundColor: theme.colors.secondary }]} />
                      <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardTitle}>{routine.title}</Text>
                          <Play color={theme.colors.textSecondary} size={20} />
                        </View>
                        
                        <Text style={styles.cardSubtitle}>{routine.subtitle}</Text>
                        
                        <View style={styles.tagContainer}>
                          <View style={[styles.glassTag, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
                            <Text style={styles.tagText}>{routine.exercises.length} Excs</Text>
                          </View>
                        </View>
                      </View>
                    </PremiumCard>
                  </AnimatedPressable>
                </MagneticView>
              ))}
            </View>
          </View>
        </ScrollView>

        <RoutineBuilderModal 
          visible={isBuilderVisible}
          onClose={() => toggleBuilder(false)}
          onSave={(routine) => saveCustomRoutine(routine)}
        />

        <Modal
          transparent
          visible={!!routineToDelete}
          animationType="fade"
          onRequestClose={cancelDelete}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <AnimatedPressable style={styles.confirmCard} onPress={() => {}} scaleTo={1} hapticFeedback="none">
              <View style={[styles.confirmCardInner, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={[styles.confirmIconContainer, { backgroundColor: theme.colors.surfaceHighlight }]}>
                  <Trash2 color={theme.colors.danger} size={32} />
                </View>
                <Text style={[styles.confirmTitle, { color: theme.colors.textPrimary }]}>Eliminar Treino?</Text>
                <Text style={[styles.confirmSubtitle, { color: theme.colors.textSecondary }]}>
                  Tens a certeza que queres apagar "{routineToDelete?.title}"? Esta ação não pode ser desfeita.
                </Text>
                
                <View style={styles.confirmActions}>
                  <TouchableOpacity onPress={cancelDelete} style={[styles.confirmBtn, { backgroundColor: theme.colors.surfaceHighlight }]}>
                    <Text style={[styles.confirmBtnText, { color: theme.colors.textPrimary }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={confirmDelete} style={[styles.confirmBtn, { backgroundColor: theme.colors.danger }]}>
                    <Text style={[styles.confirmBtnText, { color: '#fff' }]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </AnimatedPressable>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FatigueCard({ item, theme }: { item: any, theme: any }) {
  const muscleNames: Record<string, string> = {
    'Chest': 'Peito',
    'Back': 'Costas',
    'Shoulders': 'Ombros',
    'Biceps': 'Bíceps',
    'Triceps': 'Tríceps',
    'Quads': 'Quadríceps',
    'Hamstrings': 'Isquios',
    'Glutes': 'Glúteos',
    'Calves': 'Gémeos',
    'Core': 'Core'
  };

  const isCritical = item.recoveryPercent < 30;
  const statusColor = item.status === 'Ready' ? '#00E676' : item.status === 'Recovering' ? '#FFA000' : theme.colors.danger;

  const pulse = useSharedValue(1);
  React.useEffect(() => {
    if (isCritical) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [isCritical]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.fatigueCard, 
        { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border },
        isCritical && { borderColor: theme.colors.danger },
        isCritical && animatedStyle
      ]}
    >
      <View style={styles.fatigueTop}>
        <Text style={[styles.fatigueLabel, { color: theme.colors.textMuted }]}>{muscleNames[item.muscle] || item.muscle}</Text>
        <StatusPill 
          label={item.status === 'Ready' ? 'Pronto' : item.status === 'Recovering' ? 'Médio' : 'Baixo'} 
          type={item.status === 'Ready' ? 'success' : item.status === 'Recovering' ? 'warning' : 'danger'}
          style={styles.miniPill}
        />
      </View>
      
      <View style={styles.fatigueBody}>
        <Text style={[styles.fatiguePercent, { color: theme.colors.textPrimary }]}>{item.recoveryPercent}%</Text>
        <View style={styles.fatigueBarBase}>
          <View style={[
            styles.fatigueBar, 
            { 
              width: `${item.recoveryPercent}%`, 
              backgroundColor: statusColor 
            }
          ]} />
        </View>
      </View>
    </Animated.View>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
    backgroundColor: 'transparent',
  },
  emptyCustomText: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.displayBlack,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  emptyCustomSubtext: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl * 2,
    marginTop: theme.spacing.xs,
    lineHeight: 20,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.round,
    marginTop: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyCreateBtnText: {
    color: '#000',
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.sm,
  },
  routinesGrid: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  cardContainer: {
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.md,
  },
  cardIndicator: {
    width: 6,
    height: '60%',
    position: 'absolute',
    left: 0,
    top: '20%',
    borderRadius: 3,
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteBtn: {
    padding: 4,
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
  fatigueHeader: {
    marginTop: 20,
    marginBottom: 16,
  },
  fatigueScroll: {
    paddingRight: 20,
    gap: 12,
    marginBottom: 40,
  },
  fatigueCard: {
    padding: 12,
    borderRadius: 18,
    width: 130,
    borderWidth: 1,
  },
  fatigueTop: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: 8,
  },
  miniPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 50,
  },
  fatigueLabel: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  fatigueBody: {
    flexDirection: 'column',
  },
  fatigueBarBase: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 1.5,
    marginTop: 6,
    overflow: 'hidden',
  },
  fatigueBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  fatiguePercent: {
    fontSize: 18,
    fontWeight: 'normal',
    fontFamily: theme.typography.fonts.displayBlack,
    letterSpacing: -0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 340,
  },
  confirmCardInner: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.bold,
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.regular,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.bold,
  },
});

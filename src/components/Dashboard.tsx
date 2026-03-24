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
import { useHistoryStore } from '../store/useHistoryStore';
import RoutineBuilderModal from './RoutineBuilderModal';
import { theme } from '../theme/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import AnimatedPressable from './common/AnimatedPressable';
import MagneticView from './common/MagneticView';
import { sensoryManager } from '../utils/SensoryManager';
import { calculateMuscleFatigue, MuscleFatigue } from '../utils/fatigue';
import WeeklyDashboard from './WeeklyDashboard';
import AICoachCard from './AICoachCard';
import PremiumCard from './common/PremiumCard';
import EmptyWorkoutIllustration from './common/EmptyWorkoutIllustration';
import StatusPill from './common/StatusPill';
import { PRConsoleModal } from './PRConsole';
import GlobalTonnageWidget from './GlobalTonnageWidget';
import HallOfFame from './HallOfFame';
import MuscleHeatmap from './common/MuscleHeatmap';
import { Trophy, Target, BarChart2, Share2, Calendar, Swords } from 'lucide-react-native';
import { useSocialStore } from '../store/useSocialStore';
import EliteDuelWidget from './EliteDuelWidget';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing,
  FadeInDown,
  FadeInUp,
  Layout
} from 'react-native-reanimated';
import { getWeeklyVolumeByMuscle } from '../utils/weeklyStats';
import ScienceDashboard from './ScienceDashboard';
import GhostModeWidget from './GhostModeWidget';
import LivingBackground from './common/LivingBackground';


interface DashboardProps {
  onSelectRoutine: (routine: RoutineDef) => void;
  onResumeWorkout: () => void;
}

export default function Dashboard({ onSelectRoutine, onResumeWorkout }: DashboardProps) {
  const activeRoutine = useWorkoutStore(state => state.activeRoutine);
  const completedWorkouts = useHistoryStore(state => state.completedWorkouts);
  const customRoutines = useHistoryStore(state => state.customRoutines);
  const saveCustomRoutine = useHistoryStore(state => state.saveCustomRoutine);
  const deleteCustomRoutine = useHistoryStore(state => state.deleteCustomRoutine);
  const theme = useAppTheme();

  const [isBuilderVisible, setIsBuilderVisible] = React.useState(false);
  const [isPRConsoleVisible, setIsPRConsoleVisible] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'hoje' | 'metricas' | 'elite'>('hoje');
  
  const activeDuels = useSocialStore(state => state.activeDuels);
  const runningDuels = activeDuels.filter(d => d.status === 'active');

  const toggleBuilder = (visible: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsBuilderVisible(visible);
  };

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const contentMaxWidth = 768;

  const safeWorkouts = React.useMemo(() => completedWorkouts || [], [completedWorkouts]);
  const allRoutines = React.useMemo(() => [...ROUTINES, ...customRoutines], [customRoutines]);
  const fatigueData = React.useMemo(() => calculateMuscleFatigue(safeWorkouts), [safeWorkouts]);
  const volumeData = React.useMemo(() => getWeeklyVolumeByMuscle(safeWorkouts), [safeWorkouts]);

  const [routineToDelete, setRoutineToDelete] = React.useState<{id: string, title: string} | null>(null);

  const handleDeletePress = (id: string, title: string) => {
    sensoryManager.trigger({ sound: 'click', haptic: 'light' });
    setRoutineToDelete({ id, title });
  };

  const confirmDelete = () => {
    if (routineToDelete) {
      sensoryManager.trigger({ sound: 'pop', haptic: 'medium' });
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      deleteCustomRoutine(routineToDelete.id);
      setRoutineToDelete(null);
    }
  };

  const cancelDelete = () => {
    setRoutineToDelete(null);
  };

  return (
    <View style={[styles.background, { backgroundColor: theme.colors.background }]}>
      <LivingBackground />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={[
            styles.contentContainer,
            { 
              paddingTop: Math.max(insets.top, 20), 
              paddingBottom: Math.max(insets.bottom, 60) 
            }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.innerContent, isLargeScreen && { maxWidth: theme.layout.maxContentWidth }]}>
            <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
              <View>
                <Text style={[styles.greeting, { color: theme.colors.textPrimary, fontFamily: theme.typography.fonts.displayBlack }]}>Antigravity</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.typography.fonts.medium }]}>Supera os teus limites hoje.</Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  sensoryManager.trigger({ sound: 'success', haptic: 'success' });
                  setIsPRConsoleVisible(true);
                }}
                style={styles.trophyBtn}
              >
                <BlurView intensity={30} tint={theme.isDark ? "dark" : "light"} style={styles.trophyBtnInner}>
                  <Trophy color="#FFD700" size={24} />
                </BlurView>
              </TouchableOpacity>
            </Animated.View>

            <View style={[styles.mainLayout, isLargeScreen && styles.rowLayout]}>
              <View style={[styles.leftColumn, isLargeScreen && { flex: 1.6 }]}>

            {/* Ghost Mode Widget */}
            {activeTab === 'hoje' && (
              <GhostModeWidget completedWorkouts={safeWorkouts} />
            )}

            {/* Dashboard Tabs */}
            <Animated.View 
              entering={FadeInDown.delay(250).springify()} 
              style={[styles.tabsWrapper, { backgroundColor: theme.colors.surfaceHighlight }]}
            >
              <TouchableOpacity 
                onPress={() => { setActiveTab('hoje'); sensoryManager.trigger({ sound: 'click', haptic: 'selection' });
 }}
                style={[styles.tabItem, activeTab === 'hoje' && styles.activeTabItem]}
              >
                <Calendar size={16} color={activeTab === 'hoje' ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={[styles.tabText, { color: activeTab === 'hoje' ? theme.colors.primary : theme.colors.textMuted }]}>Hoje</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => { setActiveTab('metricas'); sensoryManager.trigger({ sound: 'click', haptic: 'selection' });
 }}
                style={[styles.tabItem, activeTab === 'metricas' && styles.activeTabItem]}
              >
                <BarChart2 size={16} color={activeTab === 'metricas' ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={[styles.tabText, { color: activeTab === 'metricas' ? theme.colors.primary : theme.colors.textMuted }]}>Métricas</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => { setActiveTab('elite'); sensoryManager.trigger({ sound: 'click', haptic: 'selection' });
 }}
                style={[styles.tabItem, activeTab === 'elite' && styles.activeTabItem]}
              >
                <Share2 size={16} color={activeTab === 'elite' ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={[styles.tabText, { color: activeTab === 'elite' ? theme.colors.primary : theme.colors.textMuted }]}>Elite</Text>
              </TouchableOpacity>
            </Animated.View>

            {activeTab === 'hoje' && (
              <>
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                  <AICoachCard
                    completedWorkouts={safeWorkouts}
                    routines={allRoutines}
                    onSelectRoutine={onSelectRoutine}
                  />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400).springify()}>
                  <WeeklyDashboard completedWorkouts={safeWorkouts} />
                </Animated.View>

                {activeRoutine && (
                  <AnimatedPressable 
                    onPress={() => {
                      sensoryManager.trigger({ sound: 'click', haptic: 'light' });
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
                
                <Animated.View entering={FadeInDown.delay(500).springify()}>
                  <View style={styles.fatigueHeader}>
                    <Text style={styles.sectionTitle}>Recuperação Muscular</Text>
                  </View>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.fatigueScroll}
                  >
                    {fatigueData.map((item) => (
                      <FatigueCard key={item.muscle} item={item} theme={theme} />
                    ))}
                  </ScrollView>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(600).springify()}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Meus Treinos</Text>
                      <AnimatedPressable 
                      onPress={() => {
                        sensoryManager.trigger({ sound: 'pop', haptic: 'medium' });
                        toggleBuilder(true);
                      }} 
                      hapticFeedback="light"
                    >
                      <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "dark" : "light"} style={[styles.createBtn, { borderColor: theme.colors.border }]}>
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
                              sensoryManager.trigger({ sound: 'click', haptic: 'light' });
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
                                        pressed && { opacity: 0.7 }
                                      ]}
                                    >
                                      <Trash2 color={theme.colors.textMuted} size={16} />
                                    </Pressable>
                                  </View>
                                </View>
                                <View style={styles.cardMeta}>
                                  <Text style={styles.cardInfo}>{routine.exercises.length} Exercícios</Text>
                                  <ChevronRight color={theme.colors.primary} size={16} />
                                </View>
                              </View>
                            </PremiumCard>
                          </AnimatedPressable>
                        </MagneticView>
                      ))}
                    </View>
                  )}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(700).springify()}>
                  <Text style={[styles.sectionTitle, { marginTop: 40, marginBottom: 16 }]}>Planos Predefinidos</Text>
                  
                  <View style={styles.routinesGrid}>
                    {ROUTINES.map((routine) => (
                      <MagneticView key={routine.id}>
                        <AnimatedPressable 
                          onPress={() => {
                              sensoryManager.trigger({ sound: 'click', haptic: 'light' });
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
                                  <Text style={styles.tagText}>{routine.exercises.length} Exercícios</Text>
                                </View>
                              </View>
                            </View>
                          </PremiumCard>
                        </AnimatedPressable>
                      </MagneticView>
                    ))}
                  </View>
                </Animated.View>
              </>
            )}

            {activeTab === 'metricas' && (
              <Animated.View entering={FadeInDown.delay(200).springify()}>
                <View style={styles.metricsHeader}>
                  <Text style={styles.sectionTitle}>Evolução Muscular</Text>
                </View>
                <PremiumCard style={styles.heatmapCard}>
                  <MuscleHeatmap volumeData={volumeData} />
                </PremiumCard>

                <AnimatedPressable 
                  onPress={() => {
                    sensoryManager.trigger({ sound: 'click', haptic: 'light' });
                    setIsPRConsoleVisible(true);
                  }}
                  style={styles.prCardLink}
                >
                  <PremiumCard variant="primary">
                    <View style={styles.prLinkContent}>
                      <Trophy color={theme.colors.primary} size={24} />
                      <View style={styles.prLinkTexts}>
                        <Text style={styles.prLinkTitle}>Consola de Recordes (PR)</Text>
                        <Text style={styles.prLinkSubtitle}>Vê as tuas melhores marcas históricas.</Text>
                      </View>
                      <ChevronRight color={theme.colors.primary} size={20} />
                    </View>
                  </PremiumCard>
                </AnimatedPressable>

                <View style={styles.metricsHeader}>
                  <Text style={styles.sectionTitle}>Treino Científico (VBT)</Text>
                </View>
                <ScienceDashboard completedWorkouts={safeWorkouts} />
              </Animated.View>
            )}

            {activeTab === 'elite' && (
              <Animated.View entering={FadeInDown.delay(200).springify()}>
                {runningDuels.map(duel => (
                  <EliteDuelWidget key={duel.id} duel={duel} />
                ))}
                <GlobalTonnageWidget />
                <HallOfFame />
              </Animated.View>
            )}
          </View>

          {isLargeScreen && (
            <View style={styles.rightColumn}>
              <Animated.View entering={FadeInDown.delay(300)}>
                <View style={styles.columnHeader}>
                  <Text style={styles.columnTitle}>Insights Rápidos</Text>
                </View>
                
                <PremiumCard style={styles.sideCard}>
                  <Text style={styles.sideCardLabel}>Fadiga Atual</Text>
                  <MuscleHeatmap volumeData={volumeData} />
                </PremiumCard>

                <View style={styles.sideScrollArea}>
                  <Text style={styles.sideCardLabel}>Estado dos Músculos</Text>
                  <View style={styles.sideFatigueGrid}>
                    {fatigueData.slice(0, 4).map((item) => (
                      <FatigueCard key={item.muscle} item={item} theme={theme} />
                    ))}
                  </View>
                </View>

                {runningDuels.length > 0 && (
                  <View style={{ marginTop: 20 }}>
                    <Text style={styles.sideCardLabel}>Elite Duels Ativos</Text>
                    {runningDuels.map(duel => (
                      <EliteDuelWidget key={duel.id} duel={duel} />
                    ))}
                  </View>
                )}
              </Animated.View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>

        <RoutineBuilderModal 
          visible={isBuilderVisible}
          onClose={() => toggleBuilder(false)}
          onSave={(routine) => saveCustomRoutine(routine)}
        />

        <PRConsoleModal 
          visible={isPRConsoleVisible} 
          onClose={() => setIsPRConsoleVisible(false)} 
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
    </View>
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
    backgroundColor: 'transparent',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  trophyBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  trophyBtnInner: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: theme.typography.sizes.displayLarge,
    fontFamily: theme.typography.fonts.displayBlack,
    color: theme.colors.textPrimary,
    letterSpacing: -1.5,
    lineHeight: theme.typography.sizes.displayLarge * 1.1,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.2,
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
    letterSpacing: -0.5,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    backgroundColor: theme.colors.glassSurface,
  },
  createBtnText: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    marginBottom: theme.spacing.sm,
  },
  cardIndicator: {
    width: 4,
    height: '40%',
    position: 'absolute',
    left: 0,
    top: '30%',
    borderRadius: 2,
  },
  cardContent: {
    flex: 1,
    padding: theme.spacing.cardPadding,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  tagContainer: {
    flexDirection: 'row',
  },
  glassTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  tagText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    fontSize: 10,
    fontFamily: theme.typography.fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  recoverySubtitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.semiBold,
    letterSpacing: -0.5,
  },
  fatigueHeader: {
    marginTop: 20,
    marginBottom: 16,
  },
  fatigueScroll: {
    paddingLeft: 0,
    gap: 12,
  },
  tabsWrapper: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  activeTabItem: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  metricsHeader: {
    marginBottom: 16,
  },
  heatmapCard: {
    padding: 16,
    marginBottom: 20,
  },
  prCardLink: {
    marginBottom: 20,
  },
  prLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  prLinkTexts: {
    flex: 1,
  },
  prLinkTitle: {
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
    color: '#FFF',
  },
  prLinkSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.6)',
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
    fontSize: 20,
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 14,
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
    fontSize: 14,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardInfo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  mainLayout: {
    width: '100%',
  },
  rowLayout: {
    flexDirection: 'row',
    gap: 32,
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    width: 340,
    paddingTop: 0,
  },
  columnHeader: {
    marginBottom: 16,
  },
  columnTitle: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.display,
    color: theme.colors.textPrimary,
  },
  sideCard: {
    padding: 16,
    borderRadius: 24,
    marginBottom: 20,
  },
  sideCardLabel: {
    fontSize: 10,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sideScrollArea: {
    marginBottom: 20,
  },
  sideFatigueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  }
});

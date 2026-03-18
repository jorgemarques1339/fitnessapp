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
  Modal
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronRight, Play, Activity, Plus, Trash2 } from 'lucide-react-native';
import { Alert } from 'react-native';

import { ROUTINES, RoutineDef } from '../data/routines';
import { useWorkoutStore } from '../store/useWorkoutStore';
import MiniTonnageChart from './MiniTonnageChart';
import RoutineBuilderModal from './RoutineBuilderModal';
import { theme } from '../theme/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import AnimatedPressable from './common/AnimatedPressable';
import MagneticView from './common/MagneticView';
import { soundManager } from '../utils/SoundManager';
import { calculateMuscleFatigue, MuscleFatigue } from '../utils/fatigue';


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

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const contentMaxWidth = 768;

  const safeWorkouts = completedWorkouts || [];
  const recentWorkouts = [...safeWorkouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);
  
  const tonnageData = recentWorkouts.map(w => w.totalTonnageKg / 1000);

  const [routineToDelete, setRoutineToDelete] = React.useState<{id: string, title: string} | null>(null);

  const handleDeletePress = (id: string, title: string) => {
    soundManager.play('click');
    setRoutineToDelete({ id, title });
  };

  const confirmDelete = () => {
    if (routineToDelete) {
      soundManager.play('pop');
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

            <View style={styles.chartWrapper}>
              <MiniTonnageChart data={tonnageData.length > 0 ? tonnageData : [0, 0, 0, 0, 0, 0, 0]} />
            </View>

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
                <BlurView intensity={theme.isDark ? 30 : 60} tint={theme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
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

            <View style={styles.fatigueHeader}>
              <Text style={styles.sectionTitle}>Recuperação Muscular</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.fatigueScroll}
            >
              {calculateMuscleFatigue(safeWorkouts).map((item) => {
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
                
                const statusColor = item.status === 'Ready' ? '#00E676' : item.status === 'Recovering' ? '#FFA000' : theme.colors.danger;

                return (
                  <View key={item.muscle} style={[styles.fatigueCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
                    <View style={styles.fatigueTop}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.fatigueLabel, { color: theme.colors.textMuted }]}>{muscleNames[item.muscle] || item.muscle}</Text>
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
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Meus Treinos</Text>
              <AnimatedPressable 
                onPress={() => {
                  soundManager.play('pop');
                  setIsBuilderVisible(true);
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
                <Text style={styles.emptyCustomText}>Ainda não criou treinos próprios.</Text>
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
                      style={[styles.cardContainer, { backgroundColor: theme.colors.surfaceHighlight }]}
                      hapticFeedback="medium"
                    >
                      <BlurView intensity={theme.isDark ? 25 : 45} tint={theme.isDark ? "dark" : "light"} style={styles.glassCard}>
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
                            <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "light" : "dark"} style={[styles.glassTag, { borderColor: theme.colors.border }]}>
                              <Text style={styles.tagText}>{routine.exercises.length} Excs</Text>
                            </BlurView>
                          </View>
                        </View>
                      </BlurView>
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
                    style={[styles.cardContainer, { backgroundColor: theme.colors.surfaceHighlight }]}
                    hapticFeedback="medium"
                  >
                    <BlurView intensity={theme.isDark ? 25 : 45} tint={theme.isDark ? "dark" : "light"} style={styles.glassCard}>
                      <View style={[styles.cardIndicator, { backgroundColor: theme.colors.secondary }]} />
                      <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardTitle}>{routine.title}</Text>
                          <Play color={theme.colors.textSecondary} size={20} />
                        </View>
                        
                        <Text style={styles.cardSubtitle}>{routine.subtitle}</Text>
                        
                        <View style={styles.tagContainer}>
                          <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "light" : "dark"} style={[styles.glassTag, { borderColor: theme.colors.border }]}>
                            <Text style={styles.tagText}>{routine.exercises.length} Excs</Text>
                          </BlurView>
                        </View>
                      </View>
                    </BlurView>
                  </AnimatedPressable>
                </MagneticView>
              ))}
            </View>
          </View>
        </ScrollView>

        <RoutineBuilderModal 
          visible={isBuilderVisible}
          onClose={() => setIsBuilderVisible(false)}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  fatigueLabel: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
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

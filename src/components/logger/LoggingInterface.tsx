import React, { useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Vibration, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Play, Focus, Clock, CheckCircle2, Calculator, X, Camera, Image as ImageIcon, Video } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Modal } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';
import AnimatedPressable from '../common/AnimatedPressable';
import { ExerciseDef } from '../../data/routines';
import { SetLog } from '../../store/useWorkoutStore';
import RestTimer from './RestTimer';
import PlateCalculator from './PlateCalculator';

interface LoggingInterfaceProps {
  currentExercise: ExerciseDef;
  currentExerciseSets: SetLog[];
  currentExerciseIndex: number;
  totalExercises: number;
  currentWeight: string;
  setCurrentWeight: (v: string) => void;
  currentReps: string;
  setCurrentReps: (v: string) => void;
  currentNote: string;
  setCurrentNote: (v: string) => void;
  previousSets: SetLog[];
  onLogSet: (mediaUri?: string, mediaType?: 'photo' | 'video') => void;
  onReturnToSelection: () => void;
  onAbortWorkout: () => void;
  onShowTechnicalModal: () => void;
  isReadyToAdvance: boolean;
  suggestedWeight?: number;
  insets: { top: number; bottom: number };
  timerActive: boolean;
  remainingSeconds: number;
  aiMessage: string;
  onStopTimer: () => void;
  onUpdateSetMedia: (setNumber: number, mediaUri: string, mediaType: 'photo' | 'video') => void;
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
  currentNote,
  setCurrentNote,
  previousSets,
  onLogSet,
  onReturnToSelection,
  onAbortWorkout,
  onShowTechnicalModal,
  isReadyToAdvance,
  suggestedWeight,
  insets,
  timerActive,
  remainingSeconds,
  aiMessage,
  onStopTimer,
  onUpdateSetMedia,
}: LoggingInterfaceProps) {
  const theme = useAppTheme();
  
  if (!currentExercise) return null;

  const targetSets = currentExercise.targetSets;
  const completedCount = currentExerciseSets.length;

  const [restTimerVisible, setRestTimerVisible] = React.useState(false);
  const [plateCalcVisible, setPlateCalcVisible] = React.useState(false);
  const [currentMediaUri, setCurrentMediaUri] = React.useState<string | null>(null);
  const [currentMediaType, setCurrentMediaType] = React.useState<'photo' | 'video'>('photo');
  const restingDuration = 90; // Default 90s

  // Best previous set (heaviest weight)
  const bestPrevSet = previousSets.length > 0
    ? previousSets.reduce((best, s) =>
        parseFloat(s.weightKg) > parseFloat(best.weightKg) ? s : best
      , previousSets[0])
    : null;

  // ── Checkmark animation ──
  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.4);
  const checkBgOpacity = useSharedValue(0);

  const checkAnimStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));
  const checkBgStyle = useAnimatedStyle(() => ({
    opacity: checkBgOpacity.value,
  }));

  const triggerSuccessAnim = useCallback(() => {
    // Vibration pattern: short burst
    Vibration.vibrate([0, 60, 40, 80]);

    // Background flash
    checkBgOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 500 })
    );
    // Checkmark zoom-in then fade-out
    checkOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 350 })
    );
    checkScale.value = withSequence(
      withSpring(1, { damping: 7, stiffness: 200 }),
      withTiming(1.05, { duration: 350 }),
      withTiming(0.6, { duration: 350 })
    );
  }, []);

  const pickMediaForCurrentSet = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'video/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setCurrentMediaUri(asset.uri);
        setCurrentMediaType(asset.mimeType?.includes('video') ? 'video' : 'photo');
      }
    } catch (error) {
      console.log('Error picking media:', error);
    }
  };

  const pickMediaForPastSet = async (setNumber: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'video/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const type = asset.mimeType?.includes('video') ? 'video' : 'photo';
        onUpdateSetMedia(setNumber, asset.uri, type);
      }
    } catch (error) {
      console.log('Error picking media:', error);
    }
  };

  const handleLogSetWithAnim = useCallback(() => {
    if (!currentWeight || !currentReps) return;
    triggerSuccessAnim();
    onLogSet(currentMediaUri || undefined, currentMediaType);
    setCurrentMediaUri(null);
  }, [currentWeight, currentReps, onLogSet, triggerSuccessAnim, currentMediaUri, currentMediaType]);

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

      {/* ── FEATURE 1: Série progress circles ── */}
      <View style={styles.setDotsRow}>
        {Array.from({ length: targetSets }).map((_, i) => {
          const done = i < completedCount;
          return (
            <View
              key={i}
              style={[
                styles.setDot,
                done
                  ? { backgroundColor: '#00E676', shadowColor: '#00E676', shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4 }
                  : { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.colors.border }
              ]}
            />
          );
        })}
        <Text style={[styles.setDotsLabel, { color: theme.colors.textMuted }]}>
          {completedCount}/{targetSets} séries
        </Text>
      </View>

      {/* History Feed */}
      <ScrollView
        style={styles.historyContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 220 }}
      >
        {/* ── FEATURE 3: Previous session history card ── */}
        {previousSets.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <BlurView intensity={theme.isDark ? 15 : 30} tint={theme.isDark ? "dark" : "light"} style={[styles.prevSessionCard, { borderColor: 'rgba(56,189,248,0.25)' }]}>
              <View style={styles.prevSessionHeader}>
                <Clock color={theme.colors.secondary} size={13} />
                <Text style={[styles.prevSessionTitle, { color: theme.colors.secondary }]}>ÚLTIMA SESSÃO</Text>
              </View>
              <View style={styles.prevSessionSets}>
                {previousSets.map((s, i) => (
                  <View key={i} style={styles.prevSetItem}>
                    <Text style={[styles.prevSetNum, { color: theme.colors.textMuted }]}>S{s.setNumber}</Text>
                    <Text style={[styles.prevSetStat, { color: theme.colors.textPrimary }]}>{s.weightKg}kg</Text>
                    <Text style={[styles.prevSetX, { color: theme.colors.textMuted }]}>×</Text>
                    <Text style={[styles.prevSetStat, { color: theme.colors.textPrimary }]}>{s.reps}</Text>
                  </View>
                ))}
              </View>
              {bestPrevSet && suggestedWeight && (
                <View style={[styles.aiSuggestionRow, { backgroundColor: 'rgba(0,230,118,0.1)', borderColor: 'rgba(0,230,118,0.25)' }]}>
                  <Text style={[styles.aiSuggestionText, { color: '#00E676' }]}>
                    🤖 IA sugere: {suggestedWeight}kg esta sessão
                  </Text>
                </View>
              )}
            </BlurView>
          </Animated.View>
        )}

        {/* Technical Focus Note */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "dark" : "light"} style={[styles.notesContainer, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
            <View style={styles.notesHeader}>
              <Focus color={theme.colors.secondary} size={14} />
              <Text style={[styles.notesTitle, { color: theme.colors.secondary }]}>Foco Técnico</Text>
            </View>
            <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>{currentExercise.notes}</Text>
          </BlurView>
        </Animated.View>

        {/* Current session sets */}
        {currentExerciseSets.map((set: SetLog, i: number) => (
          <Animated.View key={i} entering={FadeInDown.delay(i * 80)}>
            <BlurView intensity={theme.isDark ? 25 : 45} tint={theme.isDark ? "dark" : "light"} style={[styles.setRow, { backgroundColor: theme.colors.surfaceHighlight }]}>
              <View style={[styles.setLeft, { flex: 1, paddingRight: 10 }]}>
                <View style={[styles.circleBadge, { backgroundColor: 'rgba(0,230,118,0.15)' }]}>
                  <Text style={[styles.setText, { color: '#00E676' }]}>{set.setNumber}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.setStatText, { color: theme.colors.textPrimary }]}>{set.weightKg} kg</Text>
                  {set.note ? (
                    <Text style={[styles.setNoteText, { color: theme.colors.textMuted }]} numberOfLines={1}>📝 {set.note}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.setRight}>
                <Text style={[styles.setStatText, { color: theme.colors.textPrimary }]}>{set.reps} reps</Text>
                {set.mediaUri ? (
                  <TouchableOpacity style={styles.mediaAttachedBtn}>
                    {set.mediaType === 'video' ? <Video color={theme.colors.secondary} size={16} /> : <ImageIcon color={theme.colors.secondary} size={16} />}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => pickMediaForPastSet(set.setNumber)} style={styles.attachBtn}>
                    <Camera color={theme.colors.textMuted} size={16} />
                  </TouchableOpacity>
                )}
              </View>
            </BlurView>
          </Animated.View>
        ))}

        <AnimatedPressable style={styles.abortBtnSmall} onPress={onAbortWorkout} hapticFeedback="medium">
          <Text style={styles.quitButtonText}>Sair sem Guardar</Text>
        </AnimatedPressable>
      </ScrollView>

      {/* Inputs & Actions - STICKY FOOTER */}
      <View 
        style={[styles.stickyFooterBase, { paddingBottom: Math.max(insets.bottom, 20) }]}
        pointerEvents="box-none"
      >
        <LinearGradient
          colors={['transparent', theme.colors.background]}
          style={styles.footerGradient}
          pointerEvents="none"
        />

        {/* Weight + Reps inputs */}
        <View style={styles.inputArea}>
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8, gap: 4 }}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Peso</Text>
              {suggestedWeight && !previousSets.length && (
                <View style={[styles.aiBadge, { backgroundColor: theme.colors.secondary }]}>
                  <Text style={styles.aiBadgeText}>IA: {suggestedWeight}kg</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <BlurView intensity={40} tint="dark" style={[styles.inputGlass, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={currentWeight}
                  onChangeText={setCurrentWeight}
                  placeholderTextColor="rgba(255,255,255,0.2)"
                />
              </BlurView>
              <TouchableOpacity 
                onPress={() => setPlateCalcVisible(true)}
                style={styles.calcButton}
              >
                <BlurView intensity={50} tint="dark" style={styles.calcButtonBlur}>
                  <Calculator color={theme.colors.primary} size={22} />
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Repetições</Text>
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
        </View>

        {/* ── FEATURE 2: Optional note per set + Media Attach ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 }}>
          <BlurView intensity={20} tint="dark" style={[styles.noteInputGlass, { borderColor: theme.colors.border, flex: 1, marginBottom: 0 }]}>
            <TextInput
              style={[styles.noteInput, { color: theme.colors.textSecondary }]}
              placeholder="Nota opcional... (ex: PB hoje! 🔥)"
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={currentNote}
              onChangeText={setCurrentNote}
              maxLength={80}
              returnKeyType="done"
            />
          </BlurView>

          <TouchableOpacity style={styles.currentAttachBtn} onPress={pickMediaForCurrentSet}>
            {currentMediaUri ? (
              <Image source={{ uri: currentMediaUri }} style={styles.currentMediaThumb} />
            ) : (
              <Camera color={theme.colors.textMuted} size={24} />
            )}
          </TouchableOpacity>
        </View>

        {!isReadyToAdvance ? (
          <TouchableOpacity
            onPress={handleLogSetWithAnim}
            style={[styles.registerButton, (!currentWeight || !currentReps) && styles.registerButtonDisabled]}
            activeOpacity={0.8}
            disabled={!currentWeight || !currentReps}
          >
            <LinearGradient
              colors={(!currentWeight || !currentReps) ? ['#2a2a2a', '#1a1a1a'] : ['#00E676', '#00BCD4']}
              style={styles.registerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.registerButtonText, (!currentWeight || !currentReps) && { color: 'rgba(255,255,255,0.3)' }]}>Registar Série</Text>
            </LinearGradient>
          </TouchableOpacity>
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

      {/* Checkmark success overlay */}
      <Animated.View style={[styles.checkOverlayBg, checkBgStyle]} pointerEvents="none" />
      <Animated.View style={[styles.checkOverlay, checkAnimStyle]} pointerEvents="none">
        <View style={styles.checkCircle}>
          <CheckCircle2 color="#000" size={72} strokeWidth={2} />
        </View>
      </Animated.View>

      <RestTimer 
        duration={90} // This is controlled by the logic in WorkoutLogger
        isVisible={timerActive}
        onFinished={onStopTimer}
        onClose={onStopTimer}
      />

      {/* Plate Calculator Modal */}
      <Modal
        visible={plateCalcVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPlateCalcVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={theme.isDark ? 30 : 60} tint={theme.isDark ? "dark" : "light"} style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeModalBtn}
              onPress={() => setPlateCalcVisible(false)}
            >
              <X color={theme.colors.textPrimary} size={24} />
            </TouchableOpacity>
            
            <PlateCalculator 
              targetWeight={parseFloat(currentWeight) || 0} 
              barWeight={20} 
            />
            
            <TouchableOpacity 
              style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setPlateCalcVisible(false)}
            >
              <Text style={{ color: '#000', fontWeight: '800' }}>FECHAR</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
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
    marginBottom: 16,
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
    fontSize: 26,
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
  // ── Set dots ──
  setDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  setDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  setDotsLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  // ── Plate Calculator ──
  calcButton: {
    width: 48,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
  },
  calcButtonBlur: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingTop: 30,
    minHeight: 450,
  },
  closeModalBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  applyButton: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  // ── Previous session ──
  prevSessionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    padding: 14,
    borderWidth: 1,
  },
  prevSessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  prevSessionTitle: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  prevSessionSets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prevSetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  prevSetNum: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginRight: 2,
  },
  prevSetStat: {
    fontSize: 14,
    fontWeight: '700',
  },
  prevSetX: {
    fontSize: 12,
    fontWeight: '400',
  },
  aiSuggestionRow: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  aiSuggestionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  // ── Tech notes ──
  notesContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  historyContainer: {
    flex: 1,
  },
  // ── Current session set rows ──
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  setLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
    fontSize: 17,
    fontWeight: 'bold',
  },
  setNoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  abortBtnSmall: {
    alignItems: 'center',
    paddingVertical: 28,
    marginTop: 16,
  },
  quitButtonText: {
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#94A3B8',
  },
  // ── Sticky footer ──
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
    marginBottom: 10,
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
    borderRadius: 14,
    overflow: 'hidden',
  },
  input: {
    padding: 14,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  // ── Note input & Media ──
  noteInputGlass: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  noteInput: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontStyle: 'italic',
  },
  currentAttachBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  currentMediaThumb: {
    width: '100%',
    height: '100%',
  },
  attachBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaAttachedBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ── Register button ──
  registerButton: {
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  registerButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  registerGradient: {
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 17,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  nextButtonGlow: {
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  nextGradientButton: {
    padding: 20,
    borderRadius: 100,
    alignItems: 'center',
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
  // ── Checkmark overlay ──
  checkOverlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    zIndex: 99,
  },
  checkOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#00E676',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E676',
    shadowOpacity: 0.8,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
});

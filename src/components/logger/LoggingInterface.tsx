import React, { useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Vibration, Image, useWindowDimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { 
  Play, 
  Focus, 
  Clock, 
  CircleCheck, 
  Calculator, 
  X, 
  Camera, 
  Image as ImageIcon, 
  Video 
} from 'lucide-react-native';
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
import MusicOverlay from '../MusicOverlay';
import { theme as staticTheme } from '../../theme/theme';
import VelocityMeter from './VelocityMeter';
import PremiumCard from '../common/PremiumCard';
import ControlColumn from './ControlColumn';
import SessionHistoryList from './SessionHistoryList';
import CheckmarkOverlay, { CheckmarkOverlayRef } from './CheckmarkOverlay';
import { voiceCoach } from '../../utils/voiceCoach';
import HeartRateMonitor from './HeartRateMonitor';

interface LoggingInterfaceProps {
  currentExercise: ExerciseDef;
  currentExerciseSets: SetLog[];
  currentExerciseIndex: number;
  totalExercises: number;
  currentWeight: string;
  setCurrentWeight: (v: string) => void;
  currentReps: string;
  setCurrentReps: (v: string) => void;
  currentRpe: string;
  setCurrentRpe: (v: string) => void;
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
  vbtData?: { velocity: number; peakVelocity: number; isMoving: boolean };
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
  vbtData
}: LoggingInterfaceProps) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= staticTheme.breakpoints.tablet;
  const theme = useAppTheme();
  
  if (!currentExercise) return null;

  const targetSets = currentExercise.targetSets;
  const completedCount = currentExerciseSets.length;

  const [restTimerVisible, setRestTimerVisible] = React.useState(false);
  const [plateCalcVisible, setPlateCalcVisible] = React.useState(false);
  const [currentMediaUri, setCurrentMediaUri] = React.useState<string | null>(null);
  const [currentMediaType, setCurrentMediaType] = React.useState<'photo' | 'video'>('photo');
  const [isFocusExpanded, setIsFocusExpanded] = React.useState(!(!isLargeScreen)); // Start collapsed on mobile
  const restingDuration = 90; // Default 90s

  // Best previous set (heaviest weight)
  const bestPrevSet = previousSets.length > 0
    ? previousSets.reduce((best, s) =>
        parseFloat(s.weightKg) > parseFloat(best.weightKg) ? s : best
      , previousSets[0])
    : null;

  const checkmarkRef = React.useRef<CheckmarkOverlayRef>(null);

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
    checkmarkRef.current?.triggerSuccessAnim();
    onLogSet(currentMediaUri || undefined, currentMediaType);
    
    // Voice Coach: Last set or regular set
    if (completedCount + 1 === targetSets) {
      voiceCoach.speak('LAST_SET');
    } else {
      voiceCoach.speak('SET_REGISTERED');
    }

    setCurrentMediaUri(null);
    setCurrentRpe(''); // Reset RPE for next set
  }, [currentWeight, currentReps, onLogSet, currentMediaUri, currentMediaType, setCurrentRpe, completedCount, targetSets]);

  // renderControlColumn removed, replaced by ControlColumn component

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <View style={[styles.topBar, { marginTop: Math.max(insets.top, 20), paddingHorizontal: 20 }]}>
        <TouchableOpacity onPress={onReturnToSelection} style={styles.badge}>
          <BlurView intensity={20} tint="dark" style={[styles.glassBadge, { borderColor: theme.colors.border }]}>
            <Text style={[styles.routineTitle, { color: theme.colors.textMuted }]}>← LISTA</Text>
          </BlurView>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onAbortWorkout} style={styles.closeBadge}>
          <BlurView intensity={25} tint="dark" style={[styles.glassBadge, { borderColor: 'rgba(255,59,48,0.3)', paddingHorizontal: 16 }]}>
            <X color="#FF3B30" size={18} />
          </BlurView>
        </TouchableOpacity>
      </View>

      {isLargeScreen ? (
        <View style={[styles.mainLoggingArea, styles.rowLayout]}>
          {/* Left Column: Info & History */}
          <View style={[styles.infoColumn, { flex: 1.4 }]}>
            <View style={styles.headerContainer}>
               <View style={styles.titleRow}>
                 <View style={{ flex: 1 }}>
                    <Text style={[styles.header, styles.headerText, { color: theme.colors.textPrimary }]} numberOfLines={2} adjustsFontSizeToFit>{currentExercise.name}</Text>
                    <View style={[styles.statusRow, { marginTop: 4 }]}>
                    <HeartRateMonitor isTraining={true} />
                    <View style={[styles.indicatorDivider, { backgroundColor: theme.colors.border }]} />
                    <Text style={[styles.counterText, { color: theme.colors.textMuted }]}>
                      {currentExerciseIndex + 1} / {totalExercises}
                    </Text>
                  </View>
                </View>
                 <TouchableOpacity onPress={onShowTechnicalModal}>
                  <BlurView intensity={theme.isDark ? 40 : 60} tint={theme.isDark ? "dark" : "light"} style={[styles.videoButtonGlow, { backgroundColor: theme.colors.glassSurface, borderColor: theme.colors.glassBorder, borderWidth: 1 }]}>
                    <Play color={theme.colors.secondary} size={22} fill={theme.isDark ? theme.colors.secondary : "transparent"} />
                  </BlurView>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.setDotsRow}>
              {Array.from({ length: targetSets }).map((_, i) => {
                const done = i < completedCount;
                return (
                  <View
                    key={i}
                    style={[
                      styles.setDot,
                      done
                        ? { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4 }
                        : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.colors.border }
                    ]}
                  />
                );
              })}
              <Text style={[styles.setDotsLabel, { color: theme.colors.textMuted }]}>
                {completedCount} de {targetSets} séries concluídas
              </Text>
            </View>

            <SessionHistoryList
              previousSets={previousSets}
              bestPrevSet={bestPrevSet}
              suggestedWeight={suggestedWeight}
              currentExercise={currentExercise}
              currentExerciseSets={currentExerciseSets}
              pickMediaForPastSet={pickMediaForPastSet}
              styles={styles}
              isLargeScreen={true}
            />
          </View>
          <ControlColumn
            isLargeScreen={isLargeScreen}
            currentExercise={currentExercise}
            currentWeight={currentWeight}
            setCurrentWeight={setCurrentWeight}
            currentReps={currentReps}
            setCurrentReps={setCurrentReps}
            currentNote={currentNote}
            setCurrentNote={setCurrentNote}
            suggestedWeight={suggestedWeight}
            previousSetsLength={previousSets.length}
            vbtData={vbtData}
            isReadyToAdvance={isReadyToAdvance}
            setPlateCalcVisible={setPlateCalcVisible}
            pickMediaForCurrentSet={pickMediaForCurrentSet}
            currentMediaUri={currentMediaUri}
            handleLogSetWithAnim={handleLogSetWithAnim}
            onReturnToSelection={onReturnToSelection}
            styles={styles}
          />
        </View>
      ) : (
        <ScrollView 
          style={styles.mainScroll} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 60, flexGrow: 1 }}
        >
          <View style={styles.headerContainer}>
             <View style={[styles.titleRow, { flexDirection: 'column', alignItems: 'center' }]}>
                <Text style={[styles.header, styles.headerTextMobile, { color: theme.colors.textPrimary, textAlign: 'center' }]} numberOfLines={3}>{currentExercise.name}</Text>
                
                <View style={[styles.statusRow, { marginTop: 8, alignSelf: 'center' }]}>
                  <HeartRateMonitor isTraining={true} />
                  <View style={[styles.indicatorDivider, { backgroundColor: theme.colors.border }]} />
                  <Text style={[styles.counterText, { color: theme.colors.textMuted }]}>
                    EXERCÍCIO {currentExerciseIndex + 1} / {totalExercises}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 }}>
                  {vbtData && !isReadyToAdvance && (
                    <View style={styles.vbtMobileMini}>
                      <VelocityMeter 
                        velocity={vbtData.velocity} 
                        peakVelocity={vbtData.peakVelocity} 
                        isMoving={vbtData.isMoving} 
                        variant="mini" 
                      />
                    </View>
                  )}
                  <TouchableOpacity onPress={onShowTechnicalModal}>
                    <BlurView intensity={theme.isDark ? 40 : 60} tint={theme.isDark ? "dark" : "light"} style={[styles.videoButtonGlow, { width: 44, height: 44, borderRadius: 22 }]}>
                      <Play color={theme.colors.secondary} size={20} fill={theme.isDark ? theme.colors.secondary : "transparent"} />
                    </BlurView>
                  </TouchableOpacity>
                </View>
              </View>
          </View>

          <View style={[styles.setDotsRow, { alignSelf: 'center', marginVertical: 16 }]}>
            {Array.from({ length: targetSets }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.setDot,
                  i < completedCount
                    ? { backgroundColor: theme.colors.primary }
                    : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.colors.border }
                ]}
              />
            ))}
            <Text style={[styles.setDotsLabel, { color: theme.colors.textMuted, marginLeft: 8 }]}>{completedCount}/{targetSets}</Text>
          </View>

          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => setIsFocusExpanded(!isFocusExpanded)}
          >
            <BlurView intensity={10} tint="dark" style={styles.notesContainer}>
              <View style={[styles.notesHeader, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Focus color={theme.colors.secondary} size={13} />
                  <Text style={[styles.notesTitle, { color: theme.colors.secondary }]}>Foco Técnico</Text>
                </View>
                <Text style={[styles.collapseToggle, { color: theme.colors.textMuted }]}>{isFocusExpanded ? 'REDUZIR' : 'VER MAIS'}</Text>
              </View>
              {isFocusExpanded && <Text style={[styles.notesText, { color: theme.colors.textSecondary, marginTop: 8 }]}>{currentExercise.notes}</Text>}
            </BlurView>
          </TouchableOpacity>

          <ControlColumn
            isLargeScreen={isLargeScreen}
            currentExercise={currentExercise}
            currentWeight={currentWeight}
            setCurrentWeight={setCurrentWeight}
            currentReps={currentReps}
            setCurrentReps={setCurrentReps}
            currentNote={currentNote}
            setCurrentNote={setCurrentNote}
            suggestedWeight={suggestedWeight}
            previousSetsLength={previousSets.length}
            vbtData={vbtData}
            isReadyToAdvance={isReadyToAdvance}
            setPlateCalcVisible={setPlateCalcVisible}
            pickMediaForCurrentSet={pickMediaForCurrentSet}
            currentMediaUri={currentMediaUri}
            handleLogSetWithAnim={handleLogSetWithAnim}
            onReturnToSelection={onReturnToSelection}
            styles={styles}
          />

          <SessionHistoryList
            previousSets={previousSets}
            bestPrevSet={bestPrevSet}
            suggestedWeight={suggestedWeight}
            currentExercise={currentExercise}
            currentExerciseSets={currentExerciseSets}
            pickMediaForPastSet={pickMediaForPastSet}
            styles={styles}
            isLargeScreen={false}
          />
        </ScrollView>
      )}

      {/* Checkmark success overlay */}
      <CheckmarkOverlay ref={checkmarkRef} />

      <RestTimer 
        duration={90} // This is controlled by the logic in WorkoutLogger
        isVisible={timerActive}
        onFinished={onStopTimer}
        onClose={onStopTimer}
        previousSets={previousSets}
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  glassBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  closeBadge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  routineTitle: {
    fontSize: 9,
    fontFamily: staticTheme.typography.fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  counterText: {
    fontSize: 10,
    fontFamily: staticTheme.typography.fonts.bold,
    letterSpacing: 1,
    opacity: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: staticTheme.typography.sizes.display,
    fontFamily: staticTheme.typography.fonts.displayBlack,
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
  mobileControlArea: {
    paddingHorizontal: 0,
    paddingTop: 10,
    backgroundColor: 'transparent',
    alignItems: 'stretch',
    width: '100%',
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
    marginBottom: 10,
    gap: 8,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontFamily: staticTheme.typography.fonts.bold,
    letterSpacing: 1,
    textAlign: 'center',
  },
  inputGlass: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  input: {
    padding: 12,
    fontSize: 22,
    fontFamily: staticTheme.typography.fonts.black,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  noteInputGlass: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
  registerButton: {
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
    width: '100%',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  registerButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  registerGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#000',
    fontSize: 14,
    fontFamily: staticTheme.typography.fonts.black,
    letterSpacing: 2,
    textTransform: 'uppercase',
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
    fontFamily: staticTheme.typography.fonts.bold,
    color: '#000',
    textTransform: 'uppercase',
  },
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
  vbtContainer: {
    // Legacy container - removed from absolute positioning
  },
  vbtColumnInner: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerContainer: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  indicatorDivider: {
    width: 1,
    height: 12,
    opacity: 0.3,
  },
  inputPremiumCard: {
    marginBottom: 12,
    borderRadius: 24,
  },
  inputPremiumCardMobile: {
    width: '100%',
    maxWidth: 400,
  },
  vbtMobileMini: {
    marginRight: 10,
    width: 60,
  },
  headerText: {
    fontSize: staticTheme.typography.sizes.display,
  },
  headerTextMobile: {
    fontSize: 24,
  },
  inputText: {
    fontSize: 22,
    padding: 12,
  },
  inputTextMobile: {
    fontSize: 18,
    padding: 8,
  },
  mobileInputArea: {
    flexDirection: 'column',
    gap: 12,
  },
  mobileInputRowSplit: {
    flexDirection: 'row',
  },
  inputSubGroup: {
    // Shared container for responsive splits
  },
  collapseToggle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  mainLoggingArea: {
    flex: 1,
  },
  rowLayout: {
    flexDirection: 'row',
    gap: 40,
    paddingTop: 10,
    justifyContent: 'center',
  },
  infoColumn: {
    maxWidth: 500,
  },
  controlColumn: {
    width: 320,
    paddingTop: 10,
  },
  columnInputArea: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 0,
  },
  mainScroll: {
    flex: 1,
  },
});

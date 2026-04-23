import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Camera, Calculator } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';
import { theme as staticTheme } from '../../theme/theme';
import PremiumCard from '../common/PremiumCard';
import VelocityMeter from './VelocityMeter';
import MusicOverlay from '../MusicOverlay';
import AnimatedPressable from '../common/AnimatedPressable';

interface ControlColumnProps {
  isLargeScreen: boolean;
  currentExercise: any;
  currentWeight: string;
  setCurrentWeight: (v: string) => void;
  currentReps: string;
  setCurrentReps: (v: string) => void;
  currentNote: string;
  setCurrentNote: (v: string) => void;
  suggestedWeight?: number;
  previousSetsLength: number;
  vbtData?: { velocity: number; peakVelocity: number; isMoving: boolean };
  isReadyToAdvance: boolean;
  setPlateCalcVisible: (v: boolean) => void;
  pickMediaForCurrentSet: () => void;
  currentMediaUri: string | null;
  handleLogSetWithAnim: () => void;
  onReturnToSelection: () => void;
  styles: any;
}

export default function ControlColumn({
  isLargeScreen,
  currentExercise,
  currentWeight,
  setCurrentWeight,
  currentReps,
  setCurrentReps,
  currentNote,
  setCurrentNote,
  suggestedWeight,
  previousSetsLength,
  vbtData,
  isReadyToAdvance,
  setPlateCalcVisible,
  pickMediaForCurrentSet,
  currentMediaUri,
  handleLogSetWithAnim,
  onReturnToSelection,
  styles
}: ControlColumnProps) {
  const theme = useAppTheme();

  return (
    <View style={[isLargeScreen ? styles.controlColumn : styles.mobileControlArea]}>
      {isLargeScreen && vbtData && !isReadyToAdvance && (
        <Animated.View entering={FadeInDown} style={styles.vbtColumnInner}>
          <VelocityMeter 
            velocity={vbtData.velocity}
            peakVelocity={vbtData.peakVelocity}
            isMoving={vbtData.isMoving}
          />
        </Animated.View>
      )}

      <PremiumCard 
        variant="default" 
        intensity={isLargeScreen ? (theme.isDark ? 20 : 35) : (theme.isDark ? 40 : 60)}
        style={[styles.inputPremiumCard, !isLargeScreen && styles.inputPremiumCardMobile]}
        innerStyle={{ padding: 16 }}
      >
        <View style={[styles.inputArea, isLargeScreen ? styles.columnInputArea : styles.mobileInputArea]}>
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: isLargeScreen ? 'center' : 'flex-start', alignItems: 'center', marginBottom: 8, gap: 4 }}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{isLargeScreen ? 'Peso (kg)' : 'PESO'}</Text>
              {suggestedWeight && previousSetsLength === 0 && (
                <View style={[styles.aiBadge, { backgroundColor: theme.colors.secondary }]}>
                  <Text style={styles.aiBadgeText}>IA: {suggestedWeight}kg</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <BlurView intensity={20} tint="dark" style={[styles.inputGlass, { flex: 1 }]}>
                <TextInput
                  style={[styles.input, isLargeScreen ? styles.inputText : styles.inputTextMobile, { backgroundColor: theme.colors.surfaceHighlight }]}
                  keyboardType="numeric"
                  value={currentWeight}
                  onChangeText={setCurrentWeight}
                  placeholder="0.0"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                />
              </BlurView>
              {(currentExercise?.equipment === 'Barbell' || currentExercise?.equipment === 'Smith') && (
                <TouchableOpacity 
                  onPress={() => setPlateCalcVisible(true)}
                  style={[styles.calcButton, !isLargeScreen && { height: 48, width: 48 }]}
                >
                  <BlurView intensity={30} tint="dark" style={styles.calcButtonBlur}>
                    <Calculator color={theme.colors.primary} size={isLargeScreen ? 20 : 18} />
                  </BlurView>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary, textAlign: isLargeScreen ? 'center' : 'left' }]}>{isLargeScreen ? 'Repetições' : 'REPS'}</Text>
            <BlurView intensity={20} tint="dark" style={styles.inputGlass}>
              <TextInput
                style={[styles.input, isLargeScreen ? styles.inputText : styles.inputTextMobile, { backgroundColor: theme.colors.surfaceHighlight }]}
                keyboardType="numeric"
                value={currentReps}
                onChangeText={setCurrentReps}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.2)"
              />
            </BlurView>
          </View>
        </View>
      </PremiumCard>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10, marginTop: isLargeScreen ? 20 : 0 }}>
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

      <MusicOverlay />

      {!isReadyToAdvance ? (
        <TouchableOpacity
          onPress={handleLogSetWithAnim}
          style={[styles.registerButton, (!currentWeight || !currentReps) && styles.registerButtonDisabled]}
          activeOpacity={0.8}
          disabled={!currentWeight || !currentReps}
        >
          <LinearGradient
            colors={((!currentWeight || !currentReps) ? ['#1a1a1a', '#0a0a0a'] : theme.colors.gradients.liquid) as any}
            style={styles.registerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.registerButtonText, (!currentWeight || !currentReps) && { color: 'rgba(255,255,255,0.15)' }]}>REGISTAR SÉRIE</Text>
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
  );
}

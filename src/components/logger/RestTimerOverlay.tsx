import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Info } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

interface RestTimerOverlayProps {
  remainingSeconds: number;
  aiMessage: string;
  onSkip: () => void;
}

export default function RestTimerOverlay({
  remainingSeconds,
  aiMessage,
  onSkip
}: RestTimerOverlayProps) {
  const theme = useAppTheme();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={StyleSheet.absoluteFillObject}>
      <BlurView intensity={80} tint="dark" style={styles.restingOverlay}>
        <View style={styles.timerCircle}>
          <Text style={[styles.restTitle, { color: theme.colors.secondary }]}>RECUPERAÇÃO</Text>
          <Text style={[styles.timerText, { color: theme.colors.textPrimary }]}>{formatTime(remainingSeconds)}</Text>
        </View>
        
        {aiMessage ? (
          <View style={styles.aiGlowBox}>
            <Info color={theme.colors.secondary} size={20} style={{ marginBottom: 10 }} />
            <Text style={[styles.aiMessage, { color: theme.colors.textPrimary }]}>"{aiMessage}"</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.skipButtonActive} onPress={onSkip}>
          <BlurView intensity={30} tint="light" style={styles.glassSkip}>
            <Text style={[styles.skipButtonText, { color: theme.colors.textPrimary }]}>Ignorar Descanso</Text>
          </BlurView>
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  restingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  timerCircle: {
    alignItems: 'center',
    marginBottom: 40,
  },
  restTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 8,
    marginBottom: 10,
  },
  timerText: {
    fontSize: 100,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: -5,
  },
  aiGlowBox: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 32,
    marginBottom: 60,
    width: '100%',
  },
  aiMessage: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
  },
  skipButtonActive: {
    overflow: 'hidden',
    borderRadius: 40,
  },
  glassSkip: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

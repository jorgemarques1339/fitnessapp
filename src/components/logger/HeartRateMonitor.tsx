import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';

interface Props {
  isTraining?: boolean;
}

export default function HeartRateMonitor({ isTraining = false }: Props) {
  const theme = useAppTheme();
  const [bpm, setBpm] = useState(72);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Pulse animation
    const duration = Math.max(300, 60000 / bpm);
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: duration * 0.2, easing: Easing.out(Easing.quad) }),
        withTiming(1.0, { duration: duration * 0.8, easing: Easing.in(Easing.quad) })
      ),
      -1,
      true
    );

    // Heart rate simulation
    const interval = setInterval(() => {
      setBpm(prev => {
        const target = isTraining ? 135 : 75;
        const jitter = Math.random() * 4 - 2;
        const drift = (target - prev) * 0.1;
        return Math.round(prev + drift + jitter);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isTraining, bpm]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.glassSurface, borderColor: theme.colors.glassBorder }]}>
      <Animated.View style={animatedStyle}>
        <Activity color={theme.colors.danger} size={18} />
      </Animated.View>
      <View style={styles.texts}>
        <Text style={[styles.bpm, { color: theme.colors.textPrimary }]}>{bpm}</Text>
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>BPM</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    minWidth: 80,
  },
  texts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  bpm: {
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
  },
  label: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  }
});

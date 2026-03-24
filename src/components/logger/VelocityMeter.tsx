import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolateColor,
  Extrapolate,
  withTiming
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';

interface VelocityMeterProps {
  velocity: number;
  peakVelocity: number;
  isMoving: boolean;
  variant?: 'default' | 'mini';
}

export default function VelocityMeter({ velocity, peakVelocity, isMoving, variant = 'default' }: VelocityMeterProps) {
  const theme = useAppTheme();
  const height = useSharedValue(0);
  const opacity = useSharedValue(0.3);
  const isMini = variant === 'mini';

  useEffect(() => {
    height.value = withSpring(Math.min(velocity, 2) / 2); // Scale 0-2 m/s
    opacity.value = withTiming(isMoving ? 1 : 0.3, { duration: 200 });
  }, [velocity, isMoving]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    height: isMini ? '100%' : `${height.value * 100}%`,
    width: isMini ? `${height.value * 100}%` : '100%',
    backgroundColor: interpolateColor(
      height.value,
      [0, 0.5, 0.8],
      [theme.colors.primary, '#00E676', '#FF3D00']
    )
  }));

  const peakStyle = useAnimatedStyle(() => ({
    bottom: isMini ? 0 : `${(Math.min(peakVelocity, 2) / 2) * 100}%`,
    left: isMini ? `${(Math.min(peakVelocity, 2) / 2) * 100}%` : -4,
    width: isMini ? 2 : 20,
    height: isMini ? '100%' : 2,
  }));

  if (isMini) {
    return (
      <View style={styles.miniContainer}>
        <View style={[styles.miniGaugeBg, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <Animated.View style={[styles.miniBar, animatedBarStyle]} />
          <Animated.View style={[styles.miniPeakMarker, peakStyle, { backgroundColor: '#FFF' }]} />
        </View>
        <Text style={[styles.miniValue, { color: '#FFF' }]}>{velocity.toFixed(1)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.gaugeBg, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
        <Animated.View style={[styles.bar, animatedBarStyle]}>
           <LinearGradient
             colors={['rgba(255,255,255,0.3)', 'transparent']}
             style={StyleSheet.absoluteFill}
           />
        </Animated.View>
        
        {/* Peak Indicator */}
        <Animated.View style={[styles.peakMarker, peakStyle, { backgroundColor: '#FFF' }]} />
      </View>

      <Animated.View style={[styles.info, { opacity }]}>
        <Text style={[styles.label, { color: 'rgba(255,255,255,0.4)' }]}>VIBE / SPEED</Text>
        <Text style={[styles.value, { color: '#FFF' }]}>{velocity.toFixed(2)}</Text>
        <Text style={[styles.unit, { color: theme.colors.primary }]}>m/s</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeBg: {
    width: 12,
    height: 140,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 6,
  },
  peakMarker: {
    position: 'absolute',
    left: -4,
    width: 20,
    height: 2,
    borderRadius: 1,
    zIndex: 10,
  },
  info: {
    alignItems: 'center',
    marginTop: 10,
  },
  label: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Outfit-Black',
  },
  unit: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: -2,
  },
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
  },
  miniGaugeBg: {
    width: 32,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  miniBar: {
    position: 'absolute',
    left: 0,
    height: '100%',
    borderRadius: 3,
  },
  miniPeakMarker: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '100%',
    zIndex: 10,
  },
  miniValue: {
    fontSize: 12,
    fontWeight: '800',
    minWidth: 24,
  },
});

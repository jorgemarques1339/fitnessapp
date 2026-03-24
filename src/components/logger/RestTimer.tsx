import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Canvas, Path, Skia, vec, Circle, Group, SweepGradient } from '@shopify/react-native-skia';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence, 
  useDerivedValue, 
  interpolateColor,
  runOnJS,
  Easing,
  withSpring,
  type SharedValue
} from 'react-native-reanimated';
import { X, Play, SkipForward } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import GhostOverlay from './GhostOverlay';
import { SetLog } from '../../store/useWorkoutStore';

interface RestTimerProps {
  duration: number; // seconds
  onFinished: () => void;
  onClose: () => void;
  isVisible: boolean;
  previousSets: SetLog[];
}

const SIZE = 200;
const STROKE_WIDTH = 10;
const R = (SIZE - STROKE_WIDTH) / 2;

export default function RestTimer({ duration, onFinished, onClose, isVisible, previousSets }: RestTimerProps) {
  const progress = useSharedValue(1);
  const pulse = useSharedValue(1);
  const timeLeft = useSharedValue(duration);

  useEffect(() => {
    if (isVisible) {
      progress.value = 1;
      timeLeft.value = duration;
      
      // Countdown animation
      progress.value = withTiming(0, { 
        duration: duration * 1000, 
        easing: Easing.linear 
      }, (finished) => {
        if (finished) runOnJS(onFinished)();
      });

      // Pulse animation
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );

      // Decrement timeLeft for display
      const interval = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value -= 1;
        } else {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isVisible, duration]);

  const path = Skia.Path.Make();
  path.addCircle(SIZE / 2, SIZE / 2, R);

  const animatedColor = useDerivedValue(() => {
    return interpolateColor(
      progress.value,
      [0, 0.5, 1],
      ['#FF5252', '#FFD740', '#00E676'] // Red -> Yellow -> Green
    );
  });

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: withTiming(isVisible ? 1 : 0),
    transform: [{ scale: withSpring(isVisible ? 1 : 0.8) }]
  }));

  const timeText = useDerivedValue(() => {
    const mins = Math.floor(timeLeft.value / 60);
    const secs = Math.floor(timeLeft.value % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  });

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.overlay, animatedStyles]}>
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X color="#94A3B8" size={24} />
          </TouchableOpacity>

          <Text style={styles.title}>DESCANSO</Text>

          <View style={styles.canvasContainer}>
            <Canvas style={{ width: SIZE, height: SIZE }}>
              <Group transform={useDerivedValue(() => [{ scale: pulse.value }])} origin={vec(SIZE / 2, SIZE / 2)}>
                {/* Background Circle */}
                <Circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  color="rgba(255,255,255,0.1)"
                  style="stroke"
                  strokeWidth={STROKE_WIDTH}
                />
                {/* Progress Circle */}
                <Path
                  path={path}
                  color={animatedColor}
                  style="stroke"
                  strokeWidth={STROKE_WIDTH}
                  strokeCap="round"
                  start={0}
                  end={progress}
                />
              </Group>
            </Canvas>
            
            <View style={styles.timeLabelContainer}>
              <AnimatedTimeText timeLeft={timeLeft} />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.skipBtn} onPress={onClose}>
              <SkipForward color="#FFFFFF" size={20} />
              <Text style={styles.skipText}>Pular</Text>
            </TouchableOpacity>
          </View>

          <GhostOverlay previousSets={previousSets} />
        </View>
      </BlurView>
    </Animated.View>
  );
}

// Helper to render animated time without re-rendering the whole component
function AnimatedTimeText({ timeLeft }: { timeLeft: SharedValue<number> }) {
  const [displayTime, setDisplayTime] = React.useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const val = Math.ceil(timeLeft.value);
      const mins = Math.floor(val / 60);
      const secs = val % 60;
      setDisplayTime(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 100);
    return () => clearInterval(interval);
  }, [timeLeft]);

  return <Text style={styles.timeText}>{displayTime}</Text>;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 3,
    marginBottom: 30,
    textTransform: 'uppercase',
  },
  canvasContainer: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  timeLabelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  skipText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  }
});

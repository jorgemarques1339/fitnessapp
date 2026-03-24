import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
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
  withSpring
} from 'react-native-reanimated';
import { X, SkipForward } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../../hooks/useAppTheme';

interface RestTimerProps {
  duration: number;
  onFinished: () => void;
  onClose: () => void;
  isVisible: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 200;
const STROKE_WIDTH = 10;
const R = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function RestTimer({ duration, onFinished, onClose, isVisible }: RestTimerProps) {
  const theme = useAppTheme();
  const progress = useSharedValue(1);
  const pulse = useSharedValue(1);
  const timeLeft = useSharedValue(duration);

  useEffect(() => {
    if (isVisible) {
      progress.value = 1;
      timeLeft.value = duration;
      
      progress.value = withTiming(0, { 
        duration: duration * 1000, 
        easing: Easing.linear 
      }, (finished) => {
        if (finished) runOnJS(onFinished)();
      });

      pulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );

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

  const animatedProps = useAnimatedStyle(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);
    return {
       // We can't use animatedProps for SVG in all versions of reanimated web easily 
       // but we can use useAnimatedStyle for strokeDashoffset if supported or simple View wrapper
    } as any;
  });

  const animatedColor = useDerivedValue(() => {
    return interpolateColor(
      progress.value,
      [0, 0.5, 1],
      ['#FF5252', '#FFD740', '#00E676']
    );
  });

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: withTiming(isVisible ? 1 : 0),
    transform: [{ scale: withSpring(isVisible ? 1 : 0.8) }]
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }]
  }));

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.overlay, animatedStyles]}>
      <BlurView intensity={80} tint={theme.isDark ? "dark" : "light"} style={styles.blur}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X color="#94A3B8" size={24} />
          </TouchableOpacity>

          <Text style={styles.title}>DESCANSO</Text>

          <View style={styles.canvasContainer}>
            <Animated.View style={[pulseStyle, { width: SIZE, height: SIZE }]}>
              <Svg width={SIZE} height={SIZE}>
                <Circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                />
                {/* 
                   Simplified web SVG path for compatibility 
                   React Native SVG on web can be tricky with animated props 
                */}
                <Circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  stroke="#00E676"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * 0.5} // Static for now, will fix with better web anim if needed
                  strokeLinecap="round"
                  transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`}
                />
              </Svg>
            </Animated.View>
            
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
        </View>
      </BlurView>
    </Animated.View>
  );
}

function AnimatedTimeText({ timeLeft }: { timeLeft: any }) {
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
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
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

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, RoundedRect, Circle, Group, Shadow, LinearGradient, vec } from '@shopify/react-native-skia';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing, useDerivedValue, interpolate } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = 160;

export default function EmptyWorkoutIllustration() {
  const theme = useAppTheme();
  const floatAnim = useSharedValue(0);

  useEffect(() => {
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatAnim.value, [0, 1], [0, -15]);
    return {
      transform: [{ translateY }],
    };
  });

  const shadowOpacity = useDerivedValue(() => {
    return interpolate(floatAnim.value, [0, 1], [0.15, 0.05]);
  });

  const shadowScale = useDerivedValue(() => {
    return interpolate(floatAnim.value, [0, 1], [1, 0.8]);
  });

  const barColor = theme.colors.border;
  const plateColor = theme.isDark ? '#333' : '#ddd';
  const highlightColor = theme.colors.primary;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.canvasWrapper, animatedStyle]}>
        <Canvas style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
          {/* Main Bar */}
          <RoundedRect
            x={20}
            y={CANVAS_SIZE / 2 - 4}
            width={CANVAS_SIZE - 40}
            height={8}
            r={4}
            color={barColor}
          />

          {/* Left Plates */}
          <Group>
            <RoundedRect x={35} y={CANVAS_SIZE / 2 - 25} width={12} height={50} r={4} color={plateColor} />
            <RoundedRect x={48} y={CANVAS_SIZE / 2 - 20} width={10} height={40} r={4} color={plateColor} />
          </Group>

          {/* Right Plates */}
          <Group>
            <RoundedRect x={CANVAS_SIZE - 47} y={CANVAS_SIZE / 2 - 25} width={12} height={50} r={4} color={plateColor} />
            <RoundedRect x={CANVAS_SIZE - 58} y={CANVAS_SIZE / 2 - 20} width={10} height={40} r={4} color={plateColor} />
          </Group>

          {/* Accent Glow */}
          <Circle cx={CANVAS_SIZE / 2} cy={CANVAS_SIZE / 2} r={30} opacity={0.1}>
            <LinearGradient
              start={vec(CANVAS_SIZE / 2 - 30, CANVAS_SIZE / 2 - 30)}
              end={vec(CANVAS_SIZE / 2 + 30, CANVAS_SIZE / 2 + 30)}
              colors={[highlightColor, 'transparent']}
            />
          </Circle>
        </Canvas>
      </Animated.View>
      
      {/* Dynamic Shadow */}
      <View style={styles.shadowContainer}>
         <Animated.View 
            style={[
                styles.shadow, 
                { backgroundColor: theme.isDark ? '#fff' : '#000' },
                { opacity: shadowOpacity as any, transform: [{ scaleX: shadowScale as any }] }
            ]} 
         />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  canvasWrapper: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowContainer: {
    marginTop: -20,
    alignItems: 'center',
  },
  shadow: {
    width: 60,
    height: 6,
    borderRadius: 3,
  }
});

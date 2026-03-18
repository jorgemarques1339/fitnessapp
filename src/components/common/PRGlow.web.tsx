import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useDerivedValue, withRepeat, withTiming, withSequence, useAnimatedStyle } from 'react-native-reanimated';

export default function PRGlow({ width, height, color = '#00E676' }: { width: number; height: number; color?: string }) {
  const intensity = useSharedValue(0.2);

  React.useEffect(() => {
    intensity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500 }),
        withTiming(0.2, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: intensity.value,
    backgroundColor: color,
    borderRadius: 1000,
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { width, height, justifyContent: 'center', alignItems: 'center' }]}>
      <Animated.View style={[
        { width: width / 1.5, height: height / 1.5 },
        animatedStyle,
        { boxShadow: `0 0 50px ${color}` }
      ]} />
    </View>
  );
}

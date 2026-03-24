import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing,
  interpolateColor
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';

export default function LivingBackground() {
  const theme = useAppTheme();
  const { width, height } = useWindowDimensions();
  
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 15000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 15000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = -50 + anim.value * 100;
    const translateY = -50 + (1 - anim.value) * 100;
    
    return {
      transform: [
        { translateX },
        { translateY },
        { scale: 1.5 + anim.value * 0.5 }
      ],
      opacity: theme.isDark ? 0.08 : 0.03,
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.glow, animatedStyle, { backgroundColor: theme.colors.primary }]} />
      <Animated.View style={[styles.glow2, animatedStyle, { backgroundColor: theme.colors.secondary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    top: '10%',
    left: '10%',
    opacity: 0.1,
  },
  glow2: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    bottom: '10%',
    right: '10%',
    opacity: 0.1,
  }
});

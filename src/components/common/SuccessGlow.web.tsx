import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  Easing,
} from 'react-native-reanimated';

interface SuccessGlowProps {
  onAnimationComplete?: () => void;
}

export default function SuccessGlow({ onAnimationComplete }: SuccessGlowProps) {
  const scale = useSharedValue(0.2);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(0.4, { duration: 200 });
    scale.value = withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.exp) 
    }, (finished) => {
      if (finished) {
        opacity.value = withTiming(0, { duration: 400 }, () => {
          if (onAnimationComplete) runOnJS(onAnimationComplete)();
        });
      }
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    backgroundColor: '#00E676',
    borderRadius: 1000,
  }));

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container]}>
      <Animated.View style={[styles.glow, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  glow: {
    width: '100%',
    aspectRatio: 1,
    boxShadow: '0 0 100px #00E676', // Standard CSS shadow for web
  },
});

import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { 
  Canvas, 
  Circle, 
  Group, 
  BlurMask,
} from '@shopify/react-native-skia';
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

const { width, height } = Dimensions.get('window');

export default function SuccessGlow({ onAnimationComplete }: SuccessGlowProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(0.6, { duration: 200 });
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
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container, animatedStyle]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Group>
          <Circle 
            cx={width / 2} 
            cy={height / 3} 
            r={width * 0.4} 
            color="#00E676"
          >
            <BlurMask blur={30} style="normal" />
          </Circle>
        </Group>
      </Canvas>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 9999,
  },
});

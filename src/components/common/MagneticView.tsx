import React from 'react';
import { View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';

interface MagneticViewProps {
  children: React.ReactNode;
  disabled?: boolean;
}

export default function MagneticView({ children, disabled }: MagneticViewProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const gesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .activeOffsetY([-20, 20])
    .enabled(!disabled)
    .onStart(() => {
      scale.value = withSpring(0.98);
    })
    .onUpdate((event) => {
      // Resistance factor: the further it goes, the harder it is to pull
      translateX.value = event.translationX * 0.2;
      translateY.value = event.translationY * 0.2;
    })
    .onEnd(() => {
      translateX.value = withSpring(0, { damping: 12, stiffness: 100 });
      translateY.value = withSpring(0, { damping: 12, stiffness: 100 });
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      zIndex: translateX.value !== 0 ? 10 : 1,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

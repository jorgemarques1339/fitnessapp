import React from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'success' | 'none';
}

const AnimatedPress = Animated.createAnimatedComponent(Pressable);

export default function AnimatedPressable({ 
  children, 
  style, 
  scaleTo = 0.95, 
  hapticFeedback = 'light',
  onPress,
  onPressIn,
  onPressOut,
  ...rest 
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(scaleTo, { damping: 15, stiffness: 300 });
    if (onPressIn) onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    if (onPressOut) onPressOut(e);
  };

  const handlePress = (e: any) => {
    if (hapticFeedback !== 'none') {
      try {
        if (hapticFeedback === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        else if (hapticFeedback === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        else if (hapticFeedback === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        else if (hapticFeedback === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (err) {}
    }
    
    if (onPress) onPress(e);
  };

  return (
    <AnimatedPress
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPress>
  );
}

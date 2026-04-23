import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import { View, StyleSheet, Vibration } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring } from 'react-native-reanimated';
import { CircleCheck } from 'lucide-react-native';

export interface CheckmarkOverlayRef {
  triggerSuccessAnim: () => void;
}

const CheckmarkOverlay = forwardRef<CheckmarkOverlayRef>((props, ref) => {
  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.4);
  const checkBgOpacity = useSharedValue(0);

  const checkAnimStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));
  const checkBgStyle = useAnimatedStyle(() => ({
    opacity: checkBgOpacity.value,
  }));

  const triggerSuccessAnim = useCallback(() => {
    Vibration.vibrate([0, 60, 40, 80]);

    checkBgOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 500 })
    );
    checkOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 350 })
    );
    checkScale.value = withSequence(
      withSpring(1, { damping: 7, stiffness: 200 }),
      withTiming(1.05, { duration: 350 }),
      withTiming(0.6, { duration: 350 })
    );
  }, []);

  useImperativeHandle(ref, () => ({
    triggerSuccessAnim
  }));

  return (
    <>
      <Animated.View style={[styles.checkOverlayBg, checkBgStyle]} pointerEvents="none" />
      <Animated.View style={[styles.checkOverlay, checkAnimStyle]} pointerEvents="none">
        <View style={styles.checkCircle}>
          <CircleCheck color="#000" size={72} strokeWidth={2} />
        </View>
      </Animated.View>
    </>
  );
});

const styles = StyleSheet.create({
  checkOverlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,230,118,0.1)',
    zIndex: 90,
  },
  checkOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#00E676',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
});

export default CheckmarkOverlay;

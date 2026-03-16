import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';

interface SwipeButtonProps {
  onComplete: () => void;
  title?: string;
}

const BUTTON_HEIGHT = 60;
const KNOB_SIZE = 50;
const BUTTON_HORIZONTAL_PADDING = 5;

export default function SwipeButton({ onComplete, title = "Registrar Série" }: SwipeButtonProps) {
  const { width } = useWindowDimensions();
  const containerWidth = width > 768 ? 400 : width - 40; 
  const MAX_SWIPE = containerWidth - KNOB_SIZE - (BUTTON_HORIZONTAL_PADDING * 2);

  const translateX = useSharedValue(0);
  const isCompleted = useSharedValue(false);

  // Modern Reanimated v3 Gesture API
  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (isCompleted.value) return;
      translateX.value = Math.max(0, Math.min(event.translationX, MAX_SWIPE));
    })
    .onEnd(() => {
      if (isCompleted.value) return;

      if (translateX.value > MAX_SWIPE * 0.8) {
        translateX.value = withSpring(MAX_SWIPE);
        isCompleted.value = true;
        runOnJS(onComplete)();
        
        setTimeout(() => {
          isCompleted.value = false;
          translateX.value = withSpring(0);
        }, 500);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedKnobStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const animatedHighlightStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value + KNOB_SIZE,
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.backgroundBlur}>
        
        {/* Fill Highlight as user swipes */}
        <Animated.View style={[styles.highlight, animatedHighlightStyle]} />
        
        <Text style={styles.titleText}>{title}</Text>

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.knob, animatedKnobStyle]}>
            <BlurView intensity={40} tint="light" style={styles.knobBlur}>
              <ChevronRight color="#FFFFFF" size={24} />
            </BlurView>
          </Animated.View>
        </GestureDetector>
      </BlurView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: BUTTON_HEIGHT,
    width: '100%',
    borderRadius: BUTTON_HEIGHT / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  backgroundBlur: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: BUTTON_HORIZONTAL_PADDING,
  },
  highlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 230, 118, 0.2)', // Neo green glow
    borderRadius: BUTTON_HEIGHT / 2,
  },
  titleText: {
    position: 'absolute',
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  knobBlur: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  }
});

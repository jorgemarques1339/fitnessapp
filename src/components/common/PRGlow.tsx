import React from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, RadialGradient, vec, Rect } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

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

  const radius = useDerivedValue(() => {
    return (width / 1.5) * (1 + intensity.value * 0.2);
  });

  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height }]}>
      <Rect x={0} y={0} width={width} height={height}>
        <RadialGradient
          c={vec(width / 2, height / 2)}
          r={radius}
          colors={[color + '33', 'transparent']}
        />
      </Rect>
    </Canvas>
  );
}

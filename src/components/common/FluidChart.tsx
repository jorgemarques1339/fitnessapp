import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { 
  Canvas, 
  Path, 
  Skia, 
  LinearGradient, 
  vec,
  Group,
  Circle,
  BlurMask
} from '@shopify/react-native-skia';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';

interface FluidChartProps {
  data: number[];
  height?: number;
}

export default function FluidChart({ data, height = 40 }: FluidChartProps) {
  const theme = useAppTheme();
  const width = Dimensions.get('window').width - 64; // Approx padding from card

  const maxVal = Math.max(...data, 0.1);
  const points = useMemo(() => {
    return data.map((val, i) => ({
      x: (i / (data.length - 1)) * width,
      y: height - (val / maxVal) * height,
    }));
  }, [data, width, height, maxVal]);

  const path = useMemo(() => {
    const skPath = Skia.Path.Make();
    if (points.length < 2) return skPath;

    skPath.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cp1x = p0.x + (p1.x - p0.x) / 2;
        const cp1y = p0.y;
        const cp2x = p0.x + (p1.x - p0.x) / 2;
        const cp2y = p1.y;
        skPath.cubicTo(cp1x, cp1y, cp2x, cp2y, p1.x, p1.y);
    }
    return skPath;
  }, [points]);

  const fillPath = useMemo(() => {
    const p = path.copy();
    p.lineTo(width, height);
    p.lineTo(0, height);
    p.close();
    return p;
  }, [path, width, height]);

  // Subtle pulsing glow for the line
  const glowOpacity = useSharedValue(0.3);
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  return (
    <View style={[styles.container, { height }]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Group>
          {/* Background Gradient Fill */}
          <Path path={fillPath}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height)}
              colors={['rgba(56, 189, 248, 0.2)', 'rgba(56, 189, 248, 0.0)']}
            />
          </Path>
          
          {/* The Main Line */}
          <Path
            path={path}
            style="stroke"
            strokeWidth={2.5}
            color={theme.colors.secondary}
          >
            <BlurMask blur={2} style="solid" />
          </Path>

          {/* End Point Indicator */}
          {points.length > 0 && (
            <Circle 
                cx={points[points.length - 1].x} 
                cy={points[points.length - 1].y} 
                r={4} 
                color={theme.colors.secondary}
            />
          )}
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    overflow: 'hidden',
  },
});

import { useEffect } from 'react';

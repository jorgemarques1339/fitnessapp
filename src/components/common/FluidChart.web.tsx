import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { Path, LinearGradient, Stop, Defs, Circle } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat,
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';

interface FluidChartProps {
  data: number[];
  height?: number;
}

export default function FluidChart({ data, height = 40 }: FluidChartProps) {
  const theme = useAppTheme();
  // On web, we can use a more stable width or let it be responsive
  const width = 300; 

  const maxVal = Math.max(...data, 0.1);
  const points = useMemo(() => {
    return data.map((val, i) => ({
      x: (i / (data.length - 1 || 1)) * width,
      y: height - (val / maxVal) * height,
    }));
  }, [data, width, height, maxVal]);

  const pathD = useMemo(() => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  const areaD = useMemo(() => {
    if (!pathD) return '';
    return `${pathD} L ${width} ${height} L 0 ${height} Z`;
  }, [pathD, width, height]);

  const glowOpacity = useSharedValue(0.4);
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.colors.secondary} stopOpacity="0.2" />
            <Stop offset="1" stopColor={theme.colors.secondary} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Background Fill */}
        <Path d={areaD} fill="url(#fillGrad)" />
        
        {/* Main Line */}
        <Path
          d={pathD}
          fill="none"
          stroke={theme.colors.secondary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End Point */}
        {points.length > 0 && (
          <Circle 
            cx={points[points.length - 1].x} 
            cy={points[points.length - 1].y} 
            r="3" 
            fill={theme.colors.secondary}
          />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
});

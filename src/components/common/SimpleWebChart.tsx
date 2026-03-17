import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, LinearGradient, Stop, Defs, Circle } from 'react-native-svg';
import { theme } from '../../theme/theme';

interface DataPoint {
  x: number;
  y: number;
}

interface SimpleWebChartProps {
  data: DataPoint[];
  labels: string[];
  height?: number;
  color?: string;
  ySuffix?: string;
}

export default function SimpleWebChart({
  data,
  labels,
  height = 200,
  color = theme.colors.primary,
  ySuffix = ''
}: SimpleWebChartProps) {
  if (!data || data.length === 0) return null;

  const width = 400; // Reference width for SVG coordinate system
  const padding = 40;

  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));
  const rangeY = maxY - minY || 1;
  const marginY = rangeY * 0.2; // Add some margin

  const chartMinY = minY - marginY;
  const chartMaxY = maxY + marginY;
  const chartRangeY = chartMaxY - chartMinY;

  const getX = (index: number) => {
    return padding + (index * (width - padding * 2) / (data.length - 1 || 1));
  };

  const getY = (value: number) => {
    return height - padding - ((value - chartMinY) * (height - padding * 2) / chartRangeY);
  };

  // Build the path string
  let pathD = `M ${getX(0)} ${getY(data[0].y)}`;
  for (let i = 1; i < data.length; i++) {
    pathD += ` L ${getX(i)} ${getY(data[i].y)}`;
  }

  // Build area path for gradient
  const areaD = `${pathD} L ${getX(data.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* X Axis Line */}
        <Path
          d={`M ${padding} ${height - padding} L ${width - padding} ${height - padding}`}
          stroke={theme.colors.borderLight}
          strokeWidth="1"
        />

        {/* Area Gradient */}
        <Path d={areaD} fill="url(#grad)" />

        {/* Line Path */}
        <Path d={pathD} fill="none" stroke={color} strokeWidth="3" />

        {/* Data Points */}
        {data.map((point, i) => (
          <Circle
            key={i}
            cx={getX(i)}
            cy={getY(point.y)}
            r="4"
            fill={theme.colors.background}
            stroke={color}
            strokeWidth="2"
          />
        ))}

        {/* Labels (Simple Sample) */}
        {data.length > 1 && (
          <>
            <Text style={[styles.axisLabel, { position: 'absolute', left: getX(0), bottom: 10 }]}>
              {labels[0]}
            </Text>
            <Text style={[styles.axisLabel, { position: 'absolute', right: width - getX(data.length - 1), bottom: 10 }]}>
              {labels[data.length - 1]}
            </Text>
          </>
        )}
      </Svg>

      {/* Absolute positioned labels for better alignment on Web */}
      <View style={styles.labelsOverlay}>
        <View style={{ position: 'absolute', left: 40, bottom: 10 }}>
          <Text style={styles.labelText}>{labels[0]}</Text>
        </View>
        <View style={{ position: 'absolute', right: 40, bottom: 10 }}>
          <Text style={styles.labelText}>{labels[labels.length - 1]}</Text>
        </View>

        {/* Simple Y labels */}
        <View style={{ position: 'absolute', left: 5, top: 40 }}>
          <Text style={styles.yLabelText}>{Math.round(maxY)}{ySuffix}</Text>
        </View>
        <View style={{ position: 'absolute', left: 5, bottom: 45 }}>
          <Text style={styles.yLabelText}>{Math.round(minY)}{ySuffix}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  labelsOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  labelText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontFamily: theme.typography.fonts.bold,
  },
  yLabelText: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontFamily: theme.typography.fonts.bold,
  },
  axisLabel: {
    color: theme.colors.textMuted,
  }
});

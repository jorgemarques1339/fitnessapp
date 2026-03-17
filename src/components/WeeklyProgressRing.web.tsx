import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { theme } from '../theme/theme';

interface WeeklyProgressRingProps {
  completed: number;
  total: number;
}

export default function WeeklyProgressRing({ completed, total }: WeeklyProgressRingProps) {
  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Guard against division by zero
  const safeTotal = total || 1;
  const progress = Math.min(completed / safeTotal, 1);
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray * (1 - progress);

  return (
    <View style={styles.container}>
      <View style={styles.canvasWrapper}>
        <Svg width={size} height={size}>
          <SvgCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.colors.surfaceHighlight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <SvgCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.colors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        
        <View style={styles.textOverlay}>
          <Text style={styles.percentageText}>{completed}</Text>
          <Text style={styles.totalText}>/ {total}</Text>
        </View>
      </View>

      <View style={styles.infoWrapper}>
        <Text style={styles.title}>Meta Semanal</Text>
        <Text style={styles.subtitle}>
          {completed >= total ? '🔥 Meta Batida!' : `Faltam ${total - completed} treinos`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: theme.spacing.cardPadding,
    borderRadius: theme.radii.lg,
    ...theme.shadows.soft,
    marginBottom: theme.spacing.lg,
  },
  canvasWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  textOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  percentageText: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontFamily: theme.typography.fonts.displayBlack,
  },
  totalText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.typography.fonts.bold,
    marginLeft: 4,
    marginTop: 6,
  },
  infoWrapper: {
    marginLeft: theme.spacing.lg,
    flex: 1,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.display,
    marginBottom: 4,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.medium,
  },
});

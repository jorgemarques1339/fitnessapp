import React from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { LinearGradient, vec, Circle } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';

import { theme } from '../theme/theme';
import SimpleWebChart from './common/SimpleWebChart';

interface TonnageChartProps {
  title: string;
  labels: string[]; // e.g. ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4']
  data: number[];   // e.g. [12, 12.5, 13.2, 14]
}

export default function TonnageChart({ title, labels, data }: TonnageChartProps) {
  const isWeb = Platform.OS === 'web';

  const chartData = data.map((val, i) => ({
    x: i,
    y: val,
  }));

  // We still call the hook to avoid "rules of hooks" issues, 
  // but we must ensure it doesn't crash on web. 
  // If useChartPressState internally crashes on web, we'll need to split the component.
  const { state, isActive } = useChartPressState({ x: 0, y: { y: 0 } });

  React.useEffect(() => {
    if (isActive && !isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [isActive, isWeb]);

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const chartHeight = isSmallScreen ? 180 : 220;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={{ height: chartHeight, marginTop: 10 }}>
        {!isWeb ? (
          <CartesianChart
            data={chartData}
            xKey="x"
            yKeys={["y"]}
            domainPadding={{ top: 30, bottom: 20, left: 20, right: 20 }}
            chartPressState={state}
            axisOptions={{
              tickCount: 4,
              lineColor: theme.colors.border,
              labelColor: theme.colors.textMuted,
              labelOffset: 8,
              formatXLabel: (value) => labels[value] || '',
              formatYLabel: (value) => `${value}k`,
            }}
          >
            {({ points, chartBounds }) => (
              <>
                <Line
                  points={points.y}
                  color={theme.colors.primary}
                  strokeWidth={3}
                  curveType="natural"
                >
                  <LinearGradient
                    start={vec(0, chartBounds.top)}
                    end={vec(0, chartBounds.bottom)}
                    colors={[
                      "rgba(0, 230, 118, 0.4)",
                      "rgba(0, 230, 118, 0.0)"
                    ]}
                  />
                </Line>

                {isActive && (
                  <Circle
                    cx={state.x.position}
                    cy={state.y.y.position}
                    r={8}
                    color={theme.colors.primary}
                  />
                )}
              </>
            )}
          </CartesianChart>
        ) : (
          <SimpleWebChart
            data={chartData}
            labels={labels}
            height={220}
            ySuffix="k"
          />
        )}
      </View>

      {isActive && (
        <View style={styles.tooltipContainer}>
          <Text style={styles.tooltipText}>
            {labels[Math.round(state.x.value.value)]}: {state.y.y.value.value.toFixed(1)}k
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.bold,
    marginBottom: 5,
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  tooltipContainer: {
    position: 'absolute',
    top: 10,
    right: 15,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
  },
  tooltipText: {
    color: theme.colors.background,
    fontFamily: theme.typography.fonts.black,
    fontSize: 10,
    textTransform: 'uppercase',
  }
});

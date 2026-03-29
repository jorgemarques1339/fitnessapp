import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { CompletedWorkout } from '../../store/types';
import { useAppTheme } from '../../hooks/useAppTheme';

interface VolumeTrendChartProps {
  completedWorkouts: CompletedWorkout[];
}

export default function VolumeTrendChart({ completedWorkouts }: VolumeTrendChartProps) {
  const theme = useAppTheme();

  const weeklyData = useMemo(() => {
    // Group volume by week over the last 6 weeks
    const weeks: { label: string; volume: number; isCurrent: boolean }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() - (i * 7));
      startOfWeek.setHours(0,0,0,0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);

      const weekVolume = completedWorkouts.reduce((sum, w) => {
        const d = new Date(w.date);
        if (d >= startOfWeek && d <= endOfWeek) {
          return sum + w.totalTonnageKg;
        }
        return sum;
      }, 0);

      weeks.push({
        label: i === 0 ? 'Esta\nSem.' : `${startOfWeek.getDate()}/${startOfWeek.getMonth()+1}`,
        volume: weekVolume,
        isCurrent: i === 0
      });
    }
    return weeks;
  }, [completedWorkouts]);

  const maxVolume = Math.max(...weeklyData.map(w => w.volume), 1000); // minimum 1000 scale

  return (
    <View style={styles.container}>
      <Text style={[styles.headerText, { color: theme.colors.textMuted }]}>Volume Semanal (Últimas 6 Semanas)</Text>
      
      <View style={styles.chartArea}>
        {weeklyData.map((week, index) => {
          const heightPct = (week.volume / maxVolume) * 100;

          return (
            <AnimatedBar 
              key={index} 
              item={week} 
              index={index} 
              heightPct={heightPct} 
              theme={theme} 
            />
          );
        })}
      </View>
    </View>
  );
}

function AnimatedBar({ item, index, heightPct, theme }: any) {
  const heightValue = useSharedValue(0);

  useEffect(() => {
    heightValue.value = withTiming(heightPct, { duration: 1000 });
  }, [heightPct]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${heightValue.value}%`,
  }));

  const barColor = item.isCurrent ? [theme.colors.primary, 'rgba(0,230,118,0.2)'] as const : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)'] as const;

  return (
    <Animated.View entering={FadeInDown.delay(index * 100)} style={styles.barCol}>
      <Text style={[styles.barValue, { color: item.isCurrent ? theme.colors.textPrimary : theme.colors.textSecondary }]}>
        {item.volume > 0 ? `${(item.volume / 1000).toFixed(1)}t` : ''}
      </Text>
      
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedStyle]}>
          <LinearGradient
            colors={barColor}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </Animated.View>
      </View>

      <Text style={[styles.barLabel, { color: item.isCurrent ? theme.colors.primary : theme.colors.textMuted }]}>
        {item.label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
    textAlign: 'center',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
  },
  barCol: {
    alignItems: 'center',
    width: '14%',
  },
  barValue: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 6,
    height: 14,
  },
  track: {
    width: 20,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  fill: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    height: 28,
  }
});

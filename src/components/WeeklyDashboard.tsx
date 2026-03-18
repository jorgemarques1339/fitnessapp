import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Minus, Dumbbell, Calendar } from 'lucide-react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';

import { CompletedWorkout } from '../store/useWorkoutStore';
import { useAppTheme } from '../hooks/useAppTheme';
import {
  getWorkoutsForWeek,
  getStreakDays,
  getLast7DaysActivity,
  getWeeklyVolumeByMuscle,
  MuscleVolume,
} from '../utils/weeklyStats';

interface Props {
  completedWorkouts: CompletedWorkout[];
}

export default function WeeklyDashboard({ completedWorkouts }: Props) {
  const theme = useAppTheme();

  const thisWeek = useMemo(() => getWorkoutsForWeek(completedWorkouts, 0), [completedWorkouts]);
  const lastWeek = useMemo(() => getWorkoutsForWeek(completedWorkouts, 1), [completedWorkouts]);
  const volumeByMuscle = useMemo(() => getWeeklyVolumeByMuscle(thisWeek), [thisWeek]);

  const thisVolume = thisWeek.reduce((s, w) => s + w.totalTonnageKg, 0);
  const lastVolume = lastWeek.reduce((s, w) => s + w.totalTonnageKg, 0);
  const volumeDelta = lastVolume > 0
    ? Math.round(((thisVolume - lastVolume) / lastVolume) * 100)
    : null;

  const uniqueDaysThis = new Set(thisWeek.map(w => new Date(w.date).toDateString())).size;

  const maxSets = Math.max(25, ...(volumeByMuscle.map(m => m.sets)));

  return (
    <View style={styles.wrapper}>

      {/* ── WEEKLY STATS ── */}
      <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.statsRow}>

        {/* Days trained */}
        <BlurView
          intensity={theme.isDark ? 20 : 40}
          tint={theme.isDark ? 'dark' : 'light'}
          style={[styles.statCard, { borderColor: theme.colors.border }]}
        >
          <Calendar color={theme.colors.secondary} size={18} style={{ marginBottom: 6 }} />
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{uniqueDaysThis}</Text>
          <Text style={[styles.statDesc, { color: theme.colors.textMuted }]}>dias esta semana</Text>
        </BlurView>

        {/* Volume this week */}
        <BlurView
          intensity={theme.isDark ? 20 : 40}
          tint={theme.isDark ? 'dark' : 'light'}
          style={[styles.statCard, { borderColor: theme.colors.border }]}
        >
          <Dumbbell color={theme.colors.primary} size={18} style={{ marginBottom: 6 }} />
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
            {thisVolume > 0 ? `${Math.round(thisVolume / 1000 * 10) / 10}t` : '—'}
          </Text>
          <Text style={[styles.statDesc, { color: theme.colors.textMuted }]}>tonelagem</Text>
        </BlurView>

        {/* vs last week */}
        <BlurView
          intensity={theme.isDark ? 20 : 40}
          tint={theme.isDark ? 'dark' : 'light'}
          style={[styles.statCard, { borderColor: theme.colors.border }]}
        >
          {volumeDelta === null ? (
            <Minus color={theme.colors.textMuted} size={18} style={{ marginBottom: 6 }} />
          ) : volumeDelta >= 0 ? (
            <TrendingUp color="#00E676" size={18} style={{ marginBottom: 6 }} />
          ) : (
            <TrendingDown color={theme.colors.danger} size={18} style={{ marginBottom: 6 }} />
          )}
          <Text style={[
            styles.statValue,
            { color: volumeDelta === null ? theme.colors.textMuted : volumeDelta >= 0 ? '#00E676' : theme.colors.danger }
          ]}>
            {volumeDelta === null ? '—' : `${volumeDelta >= 0 ? '+' : ''}${volumeDelta}%`}
          </Text>
          <Text style={[styles.statDesc, { color: theme.colors.textMuted }]}>vs semana passada</Text>
        </BlurView>
      </Animated.View>

      {/* ── VOLUME BY MUSCLE ── */}
      {volumeByMuscle.length > 0 && (
        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <BlurView
            intensity={theme.isDark ? 20 : 40}
            tint={theme.isDark ? 'dark' : 'light'}
            style={[styles.chartCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceHighlight }]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: theme.colors.textPrimary }]}>Volume por Músculo</Text>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: 'rgba(0,230,118,0.35)' }]} />
                <Text style={[styles.legendLabel, { color: theme.colors.textMuted }]}>Zona Hipertrofia (10–20)</Text>
              </View>
            </View>

            {volumeByMuscle.map((item, i) => (
              <MuscleBar key={item.muscle} item={item} maxSets={maxSets} index={i} />
            ))}

            <Text style={[styles.rpCredit, { color: theme.colors.textMuted }]}>
              Baseado na ciência de Mike Israetel / RP Hypertrophy
            </Text>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

function MuscleBar({ item, maxSets, index }: { item: MuscleVolume; maxSets: number; index: number }) {
  const theme = useAppTheme();
  const fillPct = maxSets > 0 ? (item.sets / maxSets) * 100 : 0;
  const zone10Pct = (10 / maxSets) * 100;
  const zone20Pct = (20 / maxSets) * 100;

  const barColor =
    item.status === 'optimal' ? '#00E676' :
    item.status === 'above'   ? '#FF6B35' :
                                '#FFA000';

  const isAbove = item.status === 'above';
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isAbove) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [isAbove]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 50)} style={[styles.barRow, isAbove && animatedStyle]}>
      <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>{item.musclePt}</Text>
      <View style={styles.barTrackWrapper}>
        {/* Green hypertrophy zone (10–20 sets) */}
        <View
          pointerEvents="none"
          style={[
            styles.hypertrophyZone,
            {
              left: `${zone10Pct}%` as any,
              width: `${Math.min(zone20Pct, 100) - zone10Pct}%` as any,
            }
          ]}
        />
        {/* Bar fill */}
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.min(fillPct, 100)}%` as any,
              backgroundColor: barColor,
            }
          ]}
        />
      </View>
      <Text style={[styles.barCount, { color: barColor }]}>{item.sets}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
    marginBottom: 8,
  },

  // Muscle volume chart
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statDesc: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 2,
  },

  // Muscle volume chart
  chartCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  barLabel: {
    width: 76,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  barTrackWrapper: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    position: 'relative',
  },
  hypertrophyZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,230,118,0.20)',
  },
  barFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 5,
    opacity: 0.85,
  },
  barCount: {
    width: 24,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  rpCredit: {
    fontSize: 9,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});

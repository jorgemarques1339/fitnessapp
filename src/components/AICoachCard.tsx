/**
 * AICoachCard.tsx
 * 
 * Displays the 3 AI Coach insights in the Dashboard:
 * 1. Daily workout recommendation with muscle recovery preview
 * 2. Deload alert (when stagnation detected)
 * 3. Per-muscle volume adjustment advice
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Brain, TrendingUp, TrendingDown, Minus,
  AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, Zap
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CompletedWorkout } from '../store/useWorkoutStore';
import { RoutineDef } from '../data/routines';
import { useAppTheme } from '../hooks/useAppTheme';
import {
  getWorkoutRecommendation,
  analyzeDeloadNeed,
  getMuscleVolumeAdvice,
  MuscleVolumeAdvice,
} from '../utils/aiCoach';

interface Props {
  completedWorkouts: CompletedWorkout[];
  routines: RoutineDef[];
  onSelectRoutine: (r: RoutineDef) => void;
}

export default function AICoachCard({ completedWorkouts, routines, onSelectRoutine }: Props) {
  const theme = useAppTheme();
  const [volumeExpanded, setVolumeExpanded] = useState(false);

  const recommendation = useMemo(
    () => getWorkoutRecommendation(completedWorkouts, routines),
    [completedWorkouts, routines]
  );

  const deload = useMemo(
    () => analyzeDeloadNeed(completedWorkouts),
    [completedWorkouts]
  );

  const volumeAdvice = useMemo(
    () => getMuscleVolumeAdvice(completedWorkouts),
    [completedWorkouts]
  );

  const hasVolumeData = volumeAdvice.length > 0;

  return (
    <View style={styles.wrapper}>
      {/* ── Header ── */}
      <View style={styles.sectionHeader}>
        <Brain color={theme.colors.primary} size={18} />
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Coach IA</Text>
      </View>

      {/* ── 1. Deload Alert (shown first if urgent) ── */}
      {deload.needsDeload && (
        <Animated.View entering={FadeInDown.duration(400)}>
          <LinearGradient
            colors={['rgba(255,100,0,0.18)', 'rgba(255,60,0,0.08)']}
            style={[styles.alertCard, { borderColor: 'rgba(255,120,0,0.4)' }]}
          >
            <View style={styles.alertRow}>
              <AlertTriangle color="#FF6B35" size={20} />
              <Text style={styles.alertTitle}>SEMANA DE DELOAD RECOMENDADA</Text>
            </View>
            <Text style={[styles.alertReason, { color: 'rgba(255,255,255,0.7)' }]}>
              {deload.reason}
            </Text>
            <View style={[styles.alertTip, { backgroundColor: 'rgba(255,107,53,0.15)' }]}>
              <Text style={{ color: '#FF6B35', fontSize: 12, fontWeight: '600', lineHeight: 18 }}>
                💡 {deload.recommendation}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* ── 2. Daily Workout Recommendation ── */}
      {recommendation.bestRoutine && (
        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <BlurView
            intensity={theme.isDark ? 20 : 40}
            tint={theme.isDark ? 'dark' : 'light'}
            style={[styles.card, { borderColor: 'rgba(0,230,118,0.25)' }]}
          >
            <View style={styles.cardRow}>
              <View style={styles.recommendBadge}>
                <Text style={styles.recommendEmoji}>💪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>TREINO RECOMENDADO HOJE</Text>
                <Text style={[styles.routineTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                  {recommendation.bestRoutine.title}
                </Text>
              </View>
            </View>

            {/* Recovery mini-bars for this routine's muscles */}
            <View style={styles.recoveryRow}>
              {recommendation.recoverySnapshot.map((m, i) => (
                <View key={i} style={styles.recoveryItem}>
                  <View style={styles.recoveryBarTrack}>
                    <View style={[
                      styles.recoveryBarFill,
                      {
                        width: `${m.pct}%` as any,
                        backgroundColor: m.pct >= 80 ? '#00E676' : m.pct >= 50 ? '#FFA000' : '#FF6B35',
                      }
                    ]} />
                  </View>
                  <Text style={[styles.recoveryLabel, { color: theme.colors.textMuted }]}>{m.muscle}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.cardReason, { color: theme.colors.textSecondary }]}>
              {recommendation.reason}
            </Text>

            {recommendation.fatiguredMuscleNames.length > 0 && (
              <Text style={[styles.fatigueNote, { color: 'rgba(255,160,0,0.9)' }]}>
                ⏳ A recuperar: {recommendation.fatiguredMuscleNames.slice(0, 3).join(', ')}
              </Text>
            )}

            <TouchableOpacity
              onPress={() => onSelectRoutine(recommendation.bestRoutine!)}
              style={styles.startButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#00E676', '#00BCD4']}
                style={styles.startGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Zap color="#000" size={16} />
                <Text style={styles.startButtonText}>Iniciar Este Treino</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      )}

      {/* ── 3. Volume Adjustment Advice ── */}
      {hasVolumeData && (
        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <BlurView
            intensity={theme.isDark ? 20 : 40}
            tint={theme.isDark ? 'dark' : 'light'}
            style={[styles.card, { borderColor: theme.colors.border }]}
          >
            <TouchableOpacity
              onPress={() => setVolumeExpanded(v => !v)}
              style={styles.volumeHeader}
              activeOpacity={0.7}
            >
              <View style={styles.cardRow}>
                <TrendingUp color={theme.colors.secondary} size={16} />
                <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>
                  AJUSTE DE VOLUME POR MÚSCULO
                </Text>
              </View>
              {volumeExpanded
                ? <ChevronUp color={theme.colors.textMuted} size={18} />
                : <ChevronDown color={theme.colors.textMuted} size={18} />
              }
            </TouchableOpacity>

            {volumeExpanded && (
              <View style={styles.volumeList}>
                {volumeAdvice.map((item, i) => (
                  <VolumeRow key={i} item={item} />
                ))}
                <Text style={[styles.volumeNote, { color: theme.colors.textMuted }]}>
                  Baseado na progressão de 1RM estimado nas últimas 4 semanas
                </Text>
              </View>
            )}
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

function VolumeRow({ item }: { item: MuscleVolumeAdvice }) {
  const theme = useAppTheme();

  const [color, Icon] =
    item.advice === 'increase' ? ['#00E676', TrendingUp] :
    item.advice === 'decrease' ? ['#FF6B35', TrendingDown] :
    [theme.colors.textMuted, Minus];

  const trendStr = item.progressionTrend >= 0
    ? `+${item.progressionTrend}%`
    : `${item.progressionTrend}%`;

  return (
    <View style={[styles.volumeRow, { borderColor: theme.colors.border }]}>
      <View style={styles.volumeLeft}>
        <Icon color={color} size={14} />
        <Text style={[styles.muscleName, { color: theme.colors.textPrimary }]}>{item.musclePt}</Text>
      </View>
      <View style={styles.volumeRight}>
        <Text style={[styles.trendBadge, { color, borderColor: color }]}>{trendStr}</Text>
        <Text style={[styles.weeklySetsBadge, { color: theme.colors.textMuted }]}>{item.weeklySets} séries</Text>
      </View>
      <Text style={[styles.volumeMessage, { color: theme.colors.textSecondary }]}>{item.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Alert Card (deload)
  alertCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertTitle: {
    color: '#FF6B35',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  alertReason: {
    fontSize: 13,
    lineHeight: 20,
  },
  alertTip: {
    padding: 10,
    borderRadius: 10,
  },

  // Recommendation Card
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    overflow: 'hidden',
    gap: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recommendBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,230,118,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendEmoji: {
    fontSize: 22,
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  routineTitle: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  recoveryRow: {
    gap: 5,
  },
  recoveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recoveryBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  recoveryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  recoveryLabel: {
    width: 76,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
  },
  cardReason: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  fatigueNote: {
    fontSize: 11,
    fontWeight: '600',
  },
  startButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  startGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  startButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Volume expanded section
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeList: {
    gap: 8,
    marginTop: 4,
  },
  volumeRow: {
    flexWrap: 'wrap',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderTopWidth: 1,
    gap: 4,
  },
  volumeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  volumeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto' as any,
  },
  muscleName: {
    fontSize: 13,
    fontWeight: '700',
  },
  trendBadge: {
    fontSize: 11,
    fontWeight: '800',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  weeklySetsBadge: {
    fontSize: 10,
    fontWeight: '600',
  },
  volumeMessage: {
    width: '100%',
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 2,
  },
  volumeNote: {
    fontSize: 9,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 6,
  },
});

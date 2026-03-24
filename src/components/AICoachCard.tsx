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
import { theme } from '../theme/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import {
  getWorkoutRecommendation,
  analyzeDeloadNeed,
  getMuscleVolumeAdvice,
  MuscleVolumeAdvice,
} from '../utils/aiCoach';
import {
  getPRPredictions,
  getDynamicRPEAdvice,
  PRPrediction,
  DynamicRPEAdvice,
} from '../utils/aiInsights';
import PremiumCard from './common/PremiumCard';
import StatusPill from './common/StatusPill';
import PRGlow from './common/PRGlow';

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

  const prPredictions = useMemo(
    () => getPRPredictions(completedWorkouts),
    [completedWorkouts]
  );

  const rpeAdvice = useMemo(
    () => getDynamicRPEAdvice(completedWorkouts),
    [completedWorkouts]
  );

  const hasVolumeData = volumeAdvice.length > 0;
  const hasInsights = prPredictions.length > 0 || rpeAdvice.length > 0;

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
          <PremiumCard
            variant="alert"
            style={styles.alertCardMargin}
            innerStyle={styles.alertCardPadding}
          >
            <View style={styles.alertRow}>
              <AlertTriangle color="#FF6B35" size={20} />
              <Text style={styles.alertTitle}>SEMANA DE DELOAD RECOMENDADA</Text>
            </View>
            <Text style={[styles.alertReason, { color: theme.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
              {deload.reason}
            </Text>
            <View style={[styles.alertTip, { backgroundColor: 'rgba(255,107,53,0.15)' }]}>
              <Text style={{ color: '#FF6B35', fontSize: 12, fontWeight: '600', lineHeight: 18 }}>
                💡 {deload.recommendation}
              </Text>
            </View>
          </PremiumCard>
        </Animated.View>
      )}

      {/* ── 2. Daily Workout Recommendation ── */}
      {recommendation.bestRoutine && (
        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <PremiumCard
            variant="primary"
            style={styles.cardMargin}
          >
            <View style={styles.cardPadding}>
              <View style={styles.cardRow}>
                <View style={[styles.recommendBadge, recommendation.isGenerated && { backgroundColor: 'rgba(255, 215, 0, 0.2)' }]}>
                  <Text style={styles.recommendEmoji}>{recommendation.isGenerated ? '✨' : '💪'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardLabel, { color: recommendation.isGenerated ? '#FFD700' : theme.colors.primary }]}>
                    {recommendation.isGenerated ? 'TREINO GERADO POR IA' : 'TREINO RECOMENDADO HOJE'}
                  </Text>
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
                  colors={recommendation.isGenerated ? ['#FFD700', '#FFA000'] : ['#00E676', '#00BCD4']}
                  style={styles.startGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Zap color="#000" size={16} />
                  <Text style={styles.startButtonText}>
                    {recommendation.isGenerated ? 'INICIAR TREINO IA' : 'INICIAR ESTE TREINO'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </PremiumCard>
        </Animated.View>
      )}

      {/* ── 3. Performance Insights (PR Predictor & RPE) ── */}
      {hasInsights && (
        <Animated.View entering={FadeInDown.duration(400).delay(120)}>
          <PremiumCard
            variant="secondary"
            style={styles.cardMargin}
          >
            <View style={styles.cardPadding}>
              <View style={styles.cardRow}>
                <Zap color={theme.colors.accent} size={18} />
                <Text style={[styles.cardLabel, { color: theme.colors.accent }]}>PERFORMANCE INSIGHTS</Text>
              </View>

              {prPredictions.map((pr, i) => (
                <View key={`pr-${i}`} style={styles.insightItem}>
                  <View style={styles.glowContainer}>
                    <PRGlow width={300} height={100} color={theme.colors.primary} />
                  </View>
                  <View style={styles.insightHeader}>
                    <Text style={[styles.insightTitle, { color: theme.colors.textPrimary }]}>🎯 PR Ready: {pr.exerciseName}</Text>
                    <StatusPill label="Go for it!" type="success" />
                  </View>
                  <Text style={[styles.insightDesc, { color: theme.colors.textSecondary }]}>
                    Previsão de 1RM: <Text style={{ fontWeight: '800', color: theme.colors.primary }}>{pr.predicted1RM}kg</Text> (Melhor atual: {pr.currentBest1RM}kg)
                  </Text>
                </View>
              ))}

              {rpeAdvice.map((advice, i) => (
                <View key={`rpe-${i}`} style={[styles.insightItem, { borderTopWidth: 1, borderColor: theme.colors.border, paddingTop: 10, marginTop: 10 }]}>
                  <View style={styles.insightHeader}>
                    <Text style={[styles.insightTitle, { color: theme.colors.textPrimary }]}>
                      {advice.advice === 'increase_load' ? '⚖️ Ajuste de Carga' : '🔋 Recuperação'}
                    </Text>
                    {advice.priority === 'high' && <StatusPill label="Prioritário" type="danger" />}
                  </View>
                  <Text style={[styles.insightDesc, { color: theme.colors.textSecondary }]}>{advice.message}</Text>
                </View>
              ))}
            </View>
          </PremiumCard>
        </Animated.View>
      )}

      {/* ── 4. Volume Adjustment Advice ── */}
      {hasVolumeData && (
        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <PremiumCard
            variant="default"
            intensity={theme.isDark ? 20 : 40}
            innerStyle={styles.volumeCardPadding}
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
          </PremiumCard>
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
        <StatusPill 
          label={trendStr} 
          type={item.advice === 'increase' ? 'success' : item.advice === 'decrease' ? 'danger' : 'neutral'}
          style={styles.trendPill}
        />
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
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  // Alert Card (deload)
  alertCardMargin: {
    marginVertical: 4,
  },
  alertCardPadding: {
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
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  alertReason: {
    fontSize: 13,
    lineHeight: 20,
  },
  alertTip: {
    padding: 10,
    borderRadius: 12,
  },

  // Recommendation Card
  volumeCardPadding: {
    padding: 14,
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
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
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
    width: 85,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  cardReason: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  fatigueNote: {
    fontSize: 12,
    fontWeight: '700',
  },
  startButton: {
    borderRadius: theme.radii.round,
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
  cardMargin: {
    marginVertical: 4,
  },
  cardPadding: {
    padding: 14,
    gap: 10,
  },
  trendPill: {
    minWidth: 45,
    paddingHorizontal: 6,
    paddingVertical: 2,
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
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 6,
  },
  // Insights
  insightItem: {
    marginTop: 8,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  glowContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.bold,
    fontWeight: '800',
  },
  insightDesc: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 1,
    fontWeight: '500',
  },
});

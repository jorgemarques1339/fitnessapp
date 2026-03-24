import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { ChevronDown, ChevronRight, Clock, Weight, CheckCircle2, Camera, Video, Image as ImageIcon } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CompletedWorkout } from '../store/useWorkoutStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { getWeekStart } from '../utils/weeklyStats';

interface Props {
  completedWorkouts: CompletedWorkout[];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

function formatDuration(ms?: number) {
  if (!ms) return null;
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}min`;
  return `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}min` : ''}`;
}

function getWeekLabel(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `Semana de ${weekStart.getDate()} ${months[weekStart.getMonth()]}`;
}

export default function SessionHistoryTab({ completedWorkouts }: Props) {
  const theme = useAppTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...completedWorkouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [completedWorkouts]
  );

  // Group by week start date string
  const grouped = useMemo(() => {
    const map: { weekLabel: string; weekStart: Date; workouts: CompletedWorkout[] }[] = [];
    sorted.forEach(w => {
      const d = new Date(w.date);
      // Find the Monday of this date
      const day = d.getDay();
      const diffToMon = day === 0 ? -6 : 1 - day;
      const mon = new Date(d);
      mon.setDate(d.getDate() + diffToMon);
      mon.setHours(0, 0, 0, 0);
      const key = mon.toDateString();
      let group = map.find(g => g.weekStart.toDateString() === key);
      if (!group) {
        group = { weekLabel: getWeekLabel(mon), weekStart: mon, workouts: [] };
        map.push(group);
      }
      group.workouts.push(w);
    });
    return map;
  }, [sorted]);

  if (sorted.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
          Ainda não há treinos registados.{'\n'}Começa o teu primeiro treino!
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {grouped.map((group, gi) => (
        <Animated.View key={group.weekStart.toDateString()} entering={FadeInDown.delay(gi * 60)}>
          {/* Week Header */}
          <Text style={[styles.weekHeader, { color: theme.colors.textMuted }]}>
            {group.weekLabel}
          </Text>

          {group.workouts.map((workout, wi) => {
            const isExpanded = expandedId === workout.id;
            return (
              <BlurView
                key={workout.id}
                intensity={theme.isDark ? 20 : 40}
                tint={theme.isDark ? 'dark' : 'light'}
                style={[styles.sessionCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceHighlight }]}
              >
                {/* Main row — tap to expand */}
                <TouchableOpacity
                  onPress={() => setExpandedId(isExpanded ? null : workout.id)}
                  style={styles.sessionRow}
                  activeOpacity={0.7}
                >
                  <View style={styles.sessionLeft}>
                    <View style={[styles.sessionAccent, { backgroundColor: theme.colors.primary }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sessionTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                        {workout.routineTitle}
                      </Text>
                      <Text style={[styles.sessionDate, { color: theme.colors.textMuted }]}>
                        {formatDate(workout.date)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sessionMeta}>
                    <View style={styles.metaItem}>
                      <CheckCircle2 color={theme.colors.primary} size={13} />
                      <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{workout.totalSets}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Weight color={theme.colors.secondary} size={13} />
                      <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                        {(workout.totalTonnageKg / 1000).toFixed(1)}t
                      </Text>
                    </View>
                    {workout.durationMs ? (
                      <View style={styles.metaItem}>
                        <Clock color={theme.colors.textMuted} size={13} />
                        <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>{formatDuration(workout.durationMs)}</Text>
                      </View>
                    ) : null}
                    {isExpanded
                      ? <ChevronDown color={theme.colors.textMuted} size={18} />
                      : <ChevronRight color={theme.colors.textMuted} size={18} />
                    }
                  </View>
                </TouchableOpacity>

                {/* Expanded exercise detail */}
                {isExpanded && (
                  <View style={[styles.expandedArea, { borderTopColor: theme.colors.border }]}>
                    {workout.exerciseLogs.map((log, li) => (
                      <View key={li} style={styles.exerciseRow}>
                        <Text style={[styles.exName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                          {log.exerciseName}
                        </Text>
                        <View style={styles.exSets}>
                          {log.sets.map((s, si) => (
                            <View key={si} style={[styles.exSet, { borderColor: s.mediaUri ? theme.colors.secondary : 'transparent', borderWidth: s.mediaUri ? 1 : 0 }]}>
                              <Text style={[styles.exSetText, { color: theme.colors.textMuted }]}>
                                {s.weightKg}kg×{s.reps}
                              </Text>
                              {s.mediaUri && (
                                <View style={{ marginLeft: 4 }}>
                                  {s.mediaType === 'video' ? <Video size={10} color={theme.colors.secondary} /> : <ImageIcon size={10} color={theme.colors.secondary} />}
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </BlurView>
            );
          })}
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  weekHeader: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
  },
  sessionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  sessionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sessionAccent: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandedArea: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  exName: {
    width: 130,
    fontSize: 12,
    fontWeight: '600',
  },
  exSets: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  exSet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  exSetText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

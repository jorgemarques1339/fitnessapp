import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { vec, LinearGradient as SkiaGradient, Circle } from '@shopify/react-native-skia';
import { Save, TrendingUp, Scale, ChevronDown, Activity } from 'lucide-react-native';

import { useWorkoutStore } from '../store/useWorkoutStore';
import { get1RMTrendData } from '../utils/math';
import { MuscleGroup } from '../data/exercises';
import { useAllExercises } from '../utils/exerciseSelectors';
import { theme } from '../theme/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import { soundManager } from '../utils/SoundManager';
import AnimatedPressable from './common/AnimatedPressable';
import MuscleHeatmap from './MuscleHeatmap';
import SimpleWebChart from './common/SimpleWebChart';
import SessionHistoryTab from './SessionHistoryTab';
import FluidChart from './common/FluidChart';
import { getLatestBodyWeight } from '../utils/healthSync';

export default function ProfileScreen() {
  const isWeb = Platform.OS === 'web';

  const completedWorkouts = useWorkoutStore(state => state.completedWorkouts);
  const bodyWeightLogs = useWorkoutStore(state => state.bodyWeightLogs);
  const logBodyWeight = useWorkoutStore(state => state.logBodyWeight);
  const theme = useAppTheme();

  const [weightInput, setWeightInput] = useState('');

  // By default, select the first exercise from the DB that has some history, or just the first one.
  const ALLEX = useAllExercises();
  
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('peito1');
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'heatmap' | 'history'>('stats');

  const screenWidth = Dimensions.get('window').width;

  const handleSaveWeight = () => {
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 30 && w < 300) {
      logBodyWeight(w);
      setWeightInput('');
    }
  };

  React.useEffect(() => {
    const isHealthSyncEnabled = useWorkoutStore.getState().healthSyncEnabled;
    if (isHealthSyncEnabled && !isWeb) {
      getLatestBodyWeight((weight) => {
        const logs = useWorkoutStore.getState().bodyWeightLogs;
        const lastLog = logs[logs.length - 1];
        if (!lastLog || Math.abs(lastLog.weightKg - weight) > 0.1) {
          // If weight is meaningfully different, append it!
          logBodyWeight(weight);
        }
      });
    }
  }, [isWeb, logBodyWeight]);

  const rmChartData = useMemo(() => {
    return get1RMTrendData(completedWorkouts, selectedExerciseId);
  }, [completedWorkouts, selectedExerciseId]);

  const bwChartData = useMemo(() => {
    const recent = bodyWeightLogs.slice(-10);
    if (recent.length === 0) return { labels: ['N/A'], data: [0] };

    return {
      labels: recent.map(log => {
        const d = new Date(log.date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      }),
      data: recent.map(log => log.weightKg)
    };
  }, [bodyWeightLogs]);

  const tonnageData = useMemo(() => {
    const safeWorkouts = completedWorkouts || [];
    const recentWorkouts = [...safeWorkouts]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);
    
    const data = recentWorkouts.map(w => w.totalTonnageKg / 1000);
    return data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0];
  }, [completedWorkouts]);

  const selectedExerciseName = ALLEX.find(e => e.id === selectedExerciseId)?.name || 'Exercício';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <Text style={[styles.pageTitle, { color: theme.colors.textPrimary }]}>Meu Perfil</Text>

      {/* Profile Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.surfaceHighlight }]}>
        <AnimatedPressable 
          style={[styles.tab, activeTab === 'stats' && { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
          onPress={() => { soundManager.play('click'); setActiveTab('stats'); }}
        >
          <Text style={[styles.tabText, { color: activeTab === 'stats' ? theme.colors.textPrimary : theme.colors.textMuted }]}>Estatísticas</Text>
        </AnimatedPressable>
        <AnimatedPressable 
          style={[styles.tab, activeTab === 'heatmap' && { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
          onPress={() => { soundManager.play('click'); setActiveTab('heatmap'); }}
        >
          <Text style={[styles.tabText, { color: activeTab === 'heatmap' ? theme.colors.textPrimary : theme.colors.textMuted }]}>Mapa Muscular</Text>
        </AnimatedPressable>
        <AnimatedPressable 
          style={[styles.tab, activeTab === 'history' && { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
          onPress={() => { soundManager.play('click'); setActiveTab('history'); }}
        >
          <Text style={[styles.tabText, { color: activeTab === 'history' ? theme.colors.textPrimary : theme.colors.textMuted }]}>Histórico</Text>
        </AnimatedPressable>
      </View>

      {activeTab === 'stats' ? (
        <>
          {/* Bodyweight Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Scale color={theme.colors.secondary} size={24} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Peso Corporal</Text>
            </View>

            <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
              <View style={[styles.weightInputRow, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <TextInput
                  style={[styles.weightInput, { color: theme.colors.textPrimary }]}
                  keyboardType="numeric"
                  placeholder="Ex: 80.5"
                  placeholderTextColor={theme.colors.textMuted}
                  value={weightInput}
                  onChangeText={setWeightInput}
                />
                <Text style={styles.kgLabel}>KG</Text>
                
                <AnimatedPressable 
                  style={[styles.saveBtn, { backgroundColor: theme.colors.secondary }]} 
                  onPress={() => {
                    soundManager.play('pop');
                    handleSaveWeight();
                  }} 
                  hapticFeedback="medium"
                >
                  <Save color={theme.colors.background} size={20} />
                </AnimatedPressable>
              </View>

              {bodyWeightLogs.length > 0 && (
                <View style={{ height: 180, marginTop: 10 }}>
                  {!isWeb ? (
                    <CartesianChart
                      data={bodyWeightLogs.slice(-10).map((log, i) => ({ x: i, y: log.weightKg }))}
                      xKey="x"
                      yKeys={["y"]}
                      axisOptions={{
                        tickCount: 5,
                        labelColor: theme.colors.textMuted,
                        lineColor: theme.colors.border,
                        formatYLabel: (v) => `${v}kg`,
                        formatXLabel: (v) => {
                          const log = bodyWeightLogs.slice(-10)[v];
                          if (!log) return '';
                          const d = new Date(log.date);
                          return `${d.getDate()}/${d.getMonth() + 1}`;
                        }
                      }}
                    >
                      {({ points, chartBounds }) => (
                        <Line
                          points={points.y}
                          color={theme.colors.secondary}
                          strokeWidth={3}
                          curveType="natural"
                        >
                          <SkiaGradient
                            start={vec(0, chartBounds.top)}
                            end={vec(0, chartBounds.bottom)}
                            colors={["rgba(56, 189, 248, 0.3)", "transparent"]}
                          />
                        </Line>
                      )}
                    </CartesianChart>
                  ) : (
                    <SimpleWebChart
                      data={bodyWeightLogs.slice(-10).map((log, i) => ({ x: i, y: log.weightKg }))}
                      labels={bodyWeightLogs.slice(-10).map(log => {
                        const d = new Date(log.date);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      })}
                      color={theme.colors.secondary}
                      height={180}
                      ySuffix="kg"
                    />
                  )}
                </View>
              )}
            </BlurView>
          </View>

          {/* 1RM Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp color={theme.colors.primary} size={24} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Força Bruta (1RM Estimado)</Text>
            </View>
            <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>Evolução da carga máxima para 1 repetição limpa (Fórmula de Epley).</Text>

            <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
              
              <AnimatedPressable 
                style={[styles.dropdownBtn, { backgroundColor: theme.colors.surfaceHighlight }]} 
                onPress={() => {
                  soundManager.play('click');
                  setIsExercisePickerOpen(!isExercisePickerOpen);
                }}
                hapticFeedback="light"
              >
                <Text style={[styles.dropdownText, { color: theme.colors.textPrimary }]} numberOfLines={1}>{selectedExerciseName}</Text>
                <ChevronDown color={theme.colors.textPrimary} size={20} />
              </AnimatedPressable>

              {isExercisePickerOpen && (
                <View style={styles.pickerList}>
                  {ALLEX.map(ex => (
                    <AnimatedPressable 
                      key={ex.id} 
                      style={styles.pickerItem}
                      onPress={() => {
                        setSelectedExerciseId(ex.id);
                        setIsExercisePickerOpen(false);
                      }}
                      hapticFeedback="light"
                    >
                      <Text style={[styles.pickerItemText, selectedExerciseId === ex.id && { color: theme.colors.primary, fontFamily: theme.typography.fonts.bold }]}>
                        {ex.name}
                      </Text>
                    </AnimatedPressable>
                  ))}
                </View>
              )}

              {!isExercisePickerOpen && (
                <View style={{ height: 240, marginTop: 10 }}>
                  {rmChartData.data.reduce((a,b)=>a+b, 0) === 0 ? (
                    <View style={styles.emptyChart}>
                      <Text style={styles.emptyChartText}>Não há histórico suficiente para calcular o 1RM deste exercício.</Text>
                    </View>
                  ) : (
                    !isWeb ? (
                      <CartesianChart
                        data={rmChartData.data.map((v, i) => ({ x: i, y: v }))}
                        xKey="x"
                        yKeys={["y"]}
                        axisOptions={{
                          tickCount: 5,
                          labelColor: theme.colors.textMuted,
                          lineColor: theme.colors.border,
                          formatYLabel: (v) => `${Math.round(v)}kg`,
                          formatXLabel: (v) => rmChartData.labels[v] || '',
                        }}
                      >
                        {({ points, chartBounds }) => (
                          <Line
                            points={points.y}
                            color={theme.colors.primary}
                            strokeWidth={3}
                            curveType="natural"
                          >
                            <SkiaGradient
                              start={vec(0, chartBounds.top)}
                              end={vec(0, chartBounds.bottom)}
                              colors={["rgba(0, 230, 118, 0.3)", "transparent"]}
                            />
                          </Line>
                        )}
                      </CartesianChart>
                    ) : (
                      <SimpleWebChart 
                        data={rmChartData.data.map((v, i) => ({ x: i, y: v }))}
                        labels={rmChartData.labels}
                        color={theme.colors.primary}
                        height={240}
                        ySuffix="kg"
                      />
                    )
                  )}
                </View>
              )}
            </BlurView>
          </View>
        </>
      ) : activeTab === 'heatmap' ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity color={theme.colors.primary} size={24} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Intensidade de Volume</Text>
          </View>
          
          <View style={{ marginBottom: 20 }}>
            <FluidChart data={tonnageData} height={60} />
          </View>

          <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
            <MuscleHeatmap completedWorkouts={completedWorkouts} />
          </BlurView>
        </View>
      ) : activeTab === 'history' ? (
        <SessionHistoryTab completedWorkouts={completedWorkouts} />
      ) : null}
    </ScrollView>
  );
}

// Removed chartConfigBW and chartConfigRM as they are no longer needed.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.radii.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.radii.sm,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabText: {
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.sm,
  },
  activeTabText: {
    color: theme.colors.textPrimary,
  },
  pageTitle: {
    fontSize: theme.typography.sizes.display,
    fontFamily: theme.typography.fonts.displayBlack,
    color: theme.colors.textPrimary,
    letterSpacing: -1,
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.textPrimary,
    marginLeft: 10,
  },
  sectionDesc: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  glassCard: {
    borderRadius: theme.radii.lg,
    padding: theme.spacing.cardPadding,
    overflow: 'hidden',
    ...theme.shadows.soft,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.radii.md,
    paddingRight: 6,
    marginBottom: theme.spacing.lg,
  },
  weightInput: {
    flex: 1,
    padding: 16,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.black,
  },
  kgLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fonts.bold,
    marginRight: 10,
  },
  saveBtn: {
    backgroundColor: theme.colors.secondary,
    width: 40,
    height: 40,
    borderRadius: theme.radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  chart: {
    borderRadius: theme.radii.md,
    paddingRight: 40,
  },
  emptyChart: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyChartText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: theme.typography.fonts.medium,
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: theme.radii.md,
    marginBottom: 20,
  },
  dropdownText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.bold,
    flex: 1,
  },
  pickerList: {
    maxHeight: 250,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: theme.radii.md,
    padding: 10,
  },
  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  pickerItemText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.medium,
  }
});

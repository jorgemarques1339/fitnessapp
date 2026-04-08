import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Save, TrendingUp, Scale, ChevronDown, Activity } from 'lucide-react-native';

import { useWorkoutStore } from '../store/useWorkoutStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { get1RMTrendData } from '../utils/math';
import { MuscleGroup } from '../data/exercises';
import { useAllExercises } from '../utils/exerciseSelectors';
import { theme as staticTheme } from '../theme/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import { sensoryManager } from '../utils/SensoryManager';
import AnimatedPressable from './common/AnimatedPressable';
import SimpleWebChart from './common/SimpleWebChart';
import MuscleHeatmap from './MuscleHeatmap';
import SessionHistoryTab from './SessionHistoryTab';
import BodyStatsScreen from './BodyStatsScreen';
import BodyAlbum from './profile/BodyAlbum';
import FluidChart from './common/FluidChart';

export default function ProfileScreen() {
  const completedWorkouts = useHistoryStore(state => state.completedWorkouts);
  const bodyWeightLogs = useHistoryStore(state => state.bodyWeightLogs);
  const logBodyWeight = useHistoryStore(state => state.logBodyWeight);
  const theme = useAppTheme();
  
  const [weightInput, setWeightInput] = useState('');
  const ALLEX = useAllExercises();
  
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('peito1');
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'heatmap' | 'history' | 'gallery' | 'body'>('stats');

  const handleSaveWeight = () => {
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 30 && w < 300) {
      logBodyWeight(w);
      setWeightInput('');
    }
  };

  const rmChartData = useMemo(() => {
    return get1RMTrendData(completedWorkouts, selectedExerciseId);
  }, [completedWorkouts, selectedExerciseId]);
  
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
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={[{ paddingBottom: 100 }, Platform.OS === 'web' && { alignItems: 'center' }]} showsVerticalScrollIndicator={false}>
      <View style={{ width: '100%', maxWidth: theme.layout?.maxContentWidth || 1200 }}>
        <Text style={[styles.pageTitle, { color: theme.colors.textPrimary }]}>Meu Perfil</Text>

      {/* Profile Tabs */}
      <View style={{ marginBottom: theme.spacing.xl }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={[styles.tabContainer, { backgroundColor: theme.colors.surfaceHighlight }]}
        >
          <AnimatedPressable 
            style={[styles.tab, activeTab === 'stats' && { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            onPress={() => { sensoryManager.trigger({ sound: 'click', haptic: 'selection' }); setActiveTab('stats'); }}
          >
            <Text style={[styles.tabText, { color: activeTab === 'stats' ? theme.colors.textPrimary : theme.colors.textMuted }]}>Estatísticas</Text>
          </AnimatedPressable>
          <AnimatedPressable 
            style={[styles.tab, activeTab === 'heatmap' && { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            onPress={() => { sensoryManager.trigger({ sound: 'click', haptic: 'selection' }); setActiveTab('heatmap'); }}
          >
            <Text style={[styles.tabText, { color: activeTab === 'heatmap' ? theme.colors.textPrimary : theme.colors.textMuted }]}>Mapa Muscular</Text>
          </AnimatedPressable>
          <AnimatedPressable 
            style={[styles.tab, activeTab === 'history' && { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            onPress={() => { sensoryManager.trigger({ sound: 'click', haptic: 'selection' }); setActiveTab('history'); }}
          >
            <Text style={[styles.tabText, { color: activeTab === 'history' ? theme.colors.textPrimary : theme.colors.textMuted }]}>Histórico</Text>
          </AnimatedPressable>
          <AnimatedPressable 
            style={[styles.tab, activeTab === 'gallery' && { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            onPress={() => { sensoryManager.trigger({ sound: 'click', haptic: 'selection' }); setActiveTab('gallery'); }}
          >
            <Text style={[styles.tabText, { color: activeTab === 'gallery' ? theme.colors.textPrimary : theme.colors.textMuted }]}>Galeria</Text>
          </AnimatedPressable>
          <AnimatedPressable 
            style={[styles.tab, activeTab === 'body' && { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            onPress={() => { sensoryManager.trigger({ sound: 'click', haptic: 'selection' }); setActiveTab('body'); }}
          >
            <Text style={[styles.tabText, { color: activeTab === 'body' ? theme.colors.textPrimary : theme.colors.textMuted }]}>Corpo</Text>
          </AnimatedPressable>
        </ScrollView>
      </View>

      {activeTab === 'stats' ? (
        <>
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
                    sensoryManager.trigger({ sound: 'click', haptic: 'selection' });
                    handleSaveWeight();
                  }} 
                  hapticFeedback="medium"
                >
                  <Save color={theme.colors.background} size={20} />
                </AnimatedPressable>
              </View>

              {bodyWeightLogs.length > 0 && (
                <View style={{ height: 180, marginTop: 10 }}>
                  <SimpleWebChart 
                    data={bodyWeightLogs.slice(-10).map((log, i) => ({ x: i, y: log.weightKg }))}
                    labels={bodyWeightLogs.slice(-10).map(log => {
                        const d = new Date(log.date);
                        return `${d.getDate()}/${d.getMonth()+1}`;
                    })}
                    color={theme.colors.secondary}
                    height={180}
                    ySuffix="kg"
                  />
                </View>
              )}
            </BlurView>
          </View>

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
                  sensoryManager.trigger({ sound: 'click', haptic: 'selection' });
                  setIsExercisePickerOpen(!isExercisePickerOpen);
                }}
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
                    >
                      <Text style={[styles.pickerItemText, selectedExerciseId === ex.id && { color: theme.colors.primary }]}>
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
                    <SimpleWebChart 
                      data={rmChartData.data.map((v, i) => ({ x: i, y: v }))}
                      labels={rmChartData.labels}
                      color={theme.colors.primary}
                      height={240}
                      ySuffix="kg"
                    />
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
      ) : activeTab === 'gallery' ? (
        <View style={{ flex: 1, minHeight: 500 }}>
          <BodyAlbum />
        </View>
      ) : activeTab === 'body' ? (
        <BodyStatsScreen />
      ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: staticTheme.spacing.xl,
    paddingTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: staticTheme.radii.md,
    padding: 4,
    minWidth: '100%',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: staticTheme.radii.sm,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabText: {
    fontFamily: staticTheme.typography.fonts.bold,
    fontSize: staticTheme.typography.sizes.sm,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  pageTitle: {
    fontSize: staticTheme.typography.sizes.display,
    fontFamily: staticTheme.typography.fonts.displayBlack,
    letterSpacing: -1,
    marginBottom: staticTheme.spacing.xl,
  },
  section: {
    marginBottom: staticTheme.spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: staticTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: staticTheme.typography.sizes.xl,
    fontFamily: staticTheme.typography.fonts.bold,
    marginLeft: 10,
  },
  sectionDesc: {
    fontSize: staticTheme.typography.sizes.sm,
    fontFamily: staticTheme.typography.fonts.regular,
    marginBottom: staticTheme.spacing.md,
    lineHeight: 20,
  },
  glassCard: {
    borderRadius: staticTheme.radii.lg,
    padding: staticTheme.spacing.cardPadding,
    overflow: 'hidden',
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: staticTheme.radii.md,
    paddingRight: 6,
    marginBottom: staticTheme.spacing.lg,
  },
  weightInput: {
    flex: 1,
    padding: 16,
    fontSize: staticTheme.typography.sizes.xl,
    fontFamily: staticTheme.typography.fonts.black,
  },
  kgLabel: {
    fontFamily: staticTheme.typography.fonts.bold,
    marginRight: 10,
  },
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: staticTheme.radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChart: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyChartText: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: staticTheme.typography.fonts.medium,
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: staticTheme.radii.md,
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: staticTheme.typography.sizes.lg,
    fontFamily: staticTheme.typography.fonts.bold,
    flex: 1,
  },
  pickerList: {
    maxHeight: 250,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: staticTheme.radii.md,
    padding: 10,
  },
  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: staticTheme.colors.border,
  },
  pickerItemText: {
    fontSize: staticTheme.typography.sizes.md,
    fontFamily: staticTheme.typography.fonts.medium,
  }
});

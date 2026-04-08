import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { CartesianChart, Line } from 'victory-native';
import { vec, LinearGradient as SkiaGradient } from '@shopify/react-native-skia';
import { Save, TrendingUp, Scale, ChevronDown, Activity, Camera, Search, Trophy, Pencil } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

import { useHistoryStore } from '../store/useHistoryStore';
import { useConfigStore } from '../store/useConfigStore';
import { useSocialStore } from '../store/useSocialStore';
import { get1RMTrendData } from '../utils/math';
import { useAllExercises } from '../utils/exerciseSelectors';
import { useAppTheme } from '../hooks/useAppTheme';
import { sensoryManager } from '../utils/SensoryManager';
import AnimatedPressable from './common/AnimatedPressable';
import MuscleHeatmap from './MuscleHeatmap';
import SimpleWebChart from './common/SimpleWebChart';
import SessionHistoryTab from './SessionHistoryTab';
import BodyStatsScreen from './BodyStatsScreen';
import BodyAlbum from './profile/BodyAlbum';
import FluidChart from './common/FluidChart';
import { getLatestBodyWeight } from '../utils/healthSync';

export default function ProfileScreen() {
  const isWeb = Platform.OS === 'web';

  const completedWorkouts = useHistoryStore(state => state.completedWorkouts);
  const bodyWeightLogs = useHistoryStore(state => state.bodyWeightLogs);
  const logBodyWeight = useHistoryStore(state => state.logBodyWeight);
  const currentUserProfile = useSocialStore(state => state.currentUserProfile);
  const theme = useAppTheme();

  const [weightInput, setWeightInput] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const ALLEX = useAllExercises();
  
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('peito1');
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'heatmap' | 'history' | 'gallery' | 'body'>('stats');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfileName, setTempProfileName] = useState(currentUserProfile.name);
  const [tempProfileAvatar, setTempProfileAvatar] = useState(currentUserProfile.avatar);

  const screenWidth = Dimensions.get('window').width;
  const isLargeScreen = screenWidth > 768;

  const pickImage = async (target: 'weight' | 'profile' = 'weight') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (target === 'weight') {
          setSelectedPhoto(result.assets[0].uri);
        } else {
          setTempProfileAvatar(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  const handleUpdateProfile = () => {
    if (tempProfileName.trim()) {
      useSocialStore.getState().updateProfile(tempProfileName, tempProfileAvatar);
      setIsEditingProfile(false);
      sensoryManager.trigger({ sound: 'pop', haptic: 'heavy' });
    }
  };

  const handleSaveWeight = () => {
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 30 && w < 300) {
      logBodyWeight(w, selectedPhoto || undefined);
      setWeightInput('');
      setSelectedPhoto(null);
    }
  };

  React.useEffect(() => {
    const isHealthSyncEnabled = useConfigStore.getState().healthSyncEnabled;
    if (isHealthSyncEnabled && !isWeb) {
      getLatestBodyWeight((weight) => {
        const logs = useHistoryStore.getState().bodyWeightLogs;
        const lastLog = logs[logs.length - 1];
        if (!lastLog || Math.abs(lastLog.weightKg - weight) > 0.1) {
          logBodyWeight(weight);
        }
      });
    }
  }, [isWeb, logBodyWeight]);

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
  const filteredALLEX = ALLEX.filter(ex => ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()));
  const currentAthleteLevel = Math.floor(completedWorkouts.length / 5) + 1;

  return (
    <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      
      {/* 1. Hero Header */}
      <View style={[styles.heroHeader, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: currentUserProfile.avatar }} style={[styles.heroAvatar, { borderColor: theme.colors.primary }]} />
          {isEditingProfile && (
            <TouchableOpacity style={styles.avatarEditOverlay} onPress={() => pickImage('profile')}>
               <Camera color="#FFF" size={16} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.heroInfo}>
          {isEditingProfile ? (
            <TextInput 
              style={[styles.heroNameInput, { color: theme.colors.textPrimary, borderBottomColor: theme.colors.primary }]}
              value={tempProfileName}
              onChangeText={setTempProfileName}
              autoFocus
              maxLength={20}
            />
          ) : (
            <Text style={[styles.heroName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{currentUserProfile.name}</Text>
          )}
          <View style={styles.heroBadges}>
             <View style={[styles.heroBadge, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
               <Trophy size={12} color="#FFD700" />
               <Text style={[styles.heroBadgeText, { color: '#FFD700' }]}>Nível {currentAthleteLevel}</Text>
             </View>
             <View style={[styles.heroBadge, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
               <Activity size={12} color={theme.colors.primary} />
               <Text style={[styles.heroBadgeText, { color: theme.colors.primary }]}>{completedWorkouts.length} Treinos</Text>
             </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.editBtn, isEditingProfile && { backgroundColor: theme.colors.primary }]} 
          onPress={() => {
            if (isEditingProfile) {
              handleUpdateProfile();
            } else {
              setTempProfileName(currentUserProfile.name);
              setTempProfileAvatar(currentUserProfile.avatar);
              setIsEditingProfile(true);
            }
          }}
        >
          {isEditingProfile ? (
            <Save color="#000" size={18} />
          ) : (
            <Pencil color={theme.colors.primary} size={18} />
          )}
        </TouchableOpacity>
      </View>

      {/* Profile Tabs */}
      <View style={{ marginBottom: theme.spacing.xl }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={[styles.tabContainer, { backgroundColor: theme.colors.surfaceHighlight }, isLargeScreen && { alignSelf: 'center', minWidth: 'auto' }]}
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

      {/* Content Rendering based on Tab */}
      {activeTab === 'stats' ? (
        <View style={isLargeScreen ? styles.statsGridDesktop : styles.statsGridMobile}>
          
          {/* Bodyweight Section Column */}
          <View style={[styles.section, isLargeScreen && styles.gridCol]}>
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
                
                <AnimatedPressable style={styles.photoBtn} onPress={() => pickImage()}>
                  {selectedPhoto ? (
                    <Image source={{ uri: selectedPhoto }} style={styles.thumbnail} />
                  ) : (
                    <Camera color={theme.colors.textMuted} size={20} />
                  )}
                </AnimatedPressable>

                <AnimatedPressable 
                  style={[styles.saveBtn, { backgroundColor: theme.colors.secondary }]} 
                  onPress={() => { sensoryManager.trigger({ sound: 'pop', haptic: 'medium' }); handleSaveWeight(); }} 
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
                        <Line points={points.y} color={theme.colors.secondary} strokeWidth={3} curveType="natural">
                          <SkiaGradient start={vec(0, chartBounds.top)} end={vec(0, chartBounds.bottom)} colors={["rgba(56, 189, 248, 0.3)", "transparent"]} />
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

          {/* 1RM Force Section Column */}
          <View style={[styles.section, isLargeScreen && styles.gridCol]}>
            <View style={styles.sectionHeader}>
              <TrendingUp color={theme.colors.primary} size={24} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Força Bruta (1RM Estimado)</Text>
            </View>

            <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
              
              <AnimatedPressable 
                style={[styles.dropdownBtn, { backgroundColor: theme.colors.surfaceHighlight }]} 
                onPress={() => { sensoryManager.trigger({ sound: 'click', haptic: 'light' }); setIsExercisePickerOpen(!isExercisePickerOpen); }}
              >
                <Text style={[styles.dropdownText, { color: theme.colors.textPrimary }]} numberOfLines={1}>{selectedExerciseName}</Text>
                <ChevronDown color={theme.colors.textPrimary} size={20} />
              </AnimatedPressable>

              {isExercisePickerOpen && (
                <View style={styles.pickerList}>
                  <View style={styles.searchRow}>
                    <Search color={theme.colors.textMuted} size={16} />
                    <TextInput 
                      style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                      placeholder="Procurar Exercício..."
                      placeholderTextColor={theme.colors.textMuted}
                      value={exerciseSearchQuery}
                      onChangeText={setExerciseSearchQuery}
                    />
                  </View>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {filteredALLEX.map(ex => (
                      <AnimatedPressable 
                        key={ex.id} 
                        style={styles.pickerItem}
                        onPress={() => {
                          setSelectedExerciseId(ex.id);
                          setIsExercisePickerOpen(false);
                          setExerciseSearchQuery('');
                        }}
                      >
                        <Text style={[styles.pickerItemText, selectedExerciseId === ex.id && { color: theme.colors.primary, fontFamily: theme.typography.fonts.bold }]}>
                          {ex.name}
                        </Text>
                      </AnimatedPressable>
                    ))}
                  </ScrollView>
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
                          <Line points={points.y} color={theme.colors.primary} strokeWidth={3} curveType="natural">
                            <SkiaGradient start={vec(0, chartBounds.top)} end={vec(0, chartBounds.bottom)} colors={["rgba(0, 230, 118, 0.3)", "transparent"]} />
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
        </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
  },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarEditOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    fontSize: 24,
    fontFamily: 'Outfit-Bold',
    marginBottom: 6,
  },
  heroNameInput: {
    fontSize: 22,
    fontFamily: 'Outfit-Bold',
    marginBottom: 6,
    paddingVertical: 2,
    borderBottomWidth: 2,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  heroBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    minWidth: '100%',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  statsGridDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  statsGridMobile: {
    flexDirection: 'column',
    gap: 0,
  },
  gridCol: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Outfit-Bold',
    marginLeft: 10,
  },
  glassCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingRight: 6,
    marginBottom: 20,
  },
  weightInput: {
    flex: 1,
    padding: 16,
    fontSize: 24,
    fontFamily: 'Outfit-Black',
  },
  kgLabel: {
    fontFamily: 'Inter-Bold',
    marginRight: 10,
  },
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  emptyChart: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyChartText: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'Inter-Medium',
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  pickerList: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  pickerItemText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  }
});

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Save, TrendingUp, Scale, ChevronDown } from 'lucide-react-native';

import { useWorkoutStore } from '../store/useWorkoutStore';
import { get1RMTrendData } from '../utils/math';
import { EXERCISE_DATABASE } from '../data/exercises';
import { theme } from '../theme/theme';
import AnimatedPressable from './common/AnimatedPressable';
import SimpleWebChart from './common/SimpleWebChart';

export default function ProfileScreen() {
  const completedWorkouts = useWorkoutStore(state => state.completedWorkouts);
  const bodyWeightLogs = useWorkoutStore(state => state.bodyWeightLogs);
  const logBodyWeight = useWorkoutStore(state => state.logBodyWeight);
  
  const [weightInput, setWeightInput] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(EXERCISE_DATABASE[0].id);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);

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

  const selectedExerciseName = EXERCISE_DATABASE.find(e => e.id === selectedExerciseId)?.name || 'Exercício';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Meu Perfil</Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Scale color="#38BDF8" size={24} />
          <Text style={styles.sectionTitle}>Peso Corporal</Text>
        </View>

        <BlurView intensity={20} tint="dark" style={styles.glassCard}>
          <View style={styles.weightInputRow}>
            <TextInput
              style={styles.weightInput}
              keyboardType="numeric"
              placeholder="Ex: 80.5"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={weightInput}
              onChangeText={setWeightInput}
            />
            <Text style={styles.kgLabel}>KG</Text>
            
            <AnimatedPressable style={styles.saveBtn} onPress={handleSaveWeight} hapticFeedback="medium">
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
          <TrendingUp color="#00E676" size={24} />
          <Text style={styles.sectionTitle}>Força Bruta (1RM Estimado)</Text>
        </View>
        <Text style={styles.sectionDesc}>Evolução da carga máxima para 1 repetição limpa (Fórmula de Epley).</Text>

        <BlurView intensity={20} tint="dark" style={styles.glassCard}>
          <AnimatedPressable 
            style={styles.dropdownBtn} 
            onPress={() => setIsExercisePickerOpen(!isExercisePickerOpen)}
          >
            <Text style={styles.dropdownText} numberOfLines={1}>{selectedExerciseName}</Text>
            <ChevronDown color={theme.colors.textPrimary} size={20} />
          </AnimatedPressable>

          {isExercisePickerOpen && (
            <View style={styles.pickerList}>
              {EXERCISE_DATABASE.map(ex => (
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 20,
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

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { Save, TrendingUp, Scale, ChevronDown } from 'lucide-react-native';

import { useWorkoutStore } from '../store/useWorkoutStore';
import { get1RMTrendData } from '../utils/math';
import { EXERCISE_DATABASE } from '../data/exercises';

export default function ProfileScreen() {
  const completedWorkouts = useWorkoutStore(state => state.completedWorkouts);
  const bodyWeightLogs = useWorkoutStore(state => state.bodyWeightLogs);
  const logBodyWeight = useWorkoutStore(state => state.logBodyWeight);
  
  const [weightInput, setWeightInput] = useState('');
  
  // By default, select the first exercise from the DB that has some history, or just the first one.
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(EXERCISE_DATABASE[0].id);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);

  const screenWidth = Dimensions.get('window').width;

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

  const bwChartData = useMemo(() => {
    const recent = bodyWeightLogs.slice(-10);
    if (recent.length === 0) return { labels: ['N/A'], data: [0] };
    
    return {
      labels: recent.map(log => {
        const d = new Date(log.date);
        return `${d.getDate()}/${d.getMonth()+1}`;
      }),
      data: recent.map(log => log.weightKg)
    };
  }, [bodyWeightLogs]);

  const selectedExerciseName = EXERCISE_DATABASE.find(e => e.id === selectedExerciseId)?.name || 'Exercício';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Meu Perfil</Text>

      {/* Bodyweight Section */}
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
            
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveWeight}>
              <Save color="#000" size={20} />
            </TouchableOpacity>
          </View>

          {bodyWeightLogs.length > 0 && (
            <View style={styles.chartWrapper}>
              <LineChart
                data={{
                  labels: bwChartData.labels,
                  datasets: [{ data: bwChartData.data }]
                }}
                width={screenWidth - 80}
                height={160}
                yAxisSuffix="kg"
                withDots={true}
                withInnerLines={false}
                withOuterLines={false}
                chartConfig={chartConfigBW}
                bezier
                style={styles.chart}
              />
            </View>
          )}
        </BlurView>
      </View>

      {/* 1RM Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp color="#00E676" size={24} />
          <Text style={styles.sectionTitle}>Força Bruta (1RM Estimado)</Text>
        </View>
        <Text style={styles.sectionDesc}>Evolução da carga máxima para 1 repetição limpa (Fórmula de Epley).</Text>

        <BlurView intensity={20} tint="dark" style={styles.glassCard}>
          
          <TouchableOpacity 
            style={styles.dropdownBtn} 
            onPress={() => setIsExercisePickerOpen(!isExercisePickerOpen)}
          >
            <Text style={styles.dropdownText} numberOfLines={1}>{selectedExerciseName}</Text>
            <ChevronDown color="#FFF" size={20} />
          </TouchableOpacity>

          {isExercisePickerOpen && (
            <View style={styles.pickerList}>
              {EXERCISE_DATABASE.map(ex => (
                <TouchableOpacity 
                  key={ex.id} 
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedExerciseId(ex.id);
                    setIsExercisePickerOpen(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, selectedExerciseId === ex.id && { color: '#00E676', fontWeight: 'bold' }]}>
                    {ex.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!isExercisePickerOpen && (
            <View style={styles.chartWrapper}>
              {rmChartData.data.reduce((a,b)=>a+b, 0) === 0 ? (
                <View style={styles.emptyChart}>
                  <Text style={styles.emptyChartText}>Não há histórico suficiente para calcular o 1RM deste exercício.</Text>
                </View>
              ) : (
                <LineChart
                  data={{
                    labels: rmChartData.labels,
                    datasets: [{ data: rmChartData.data }]
                  }}
                  width={screenWidth - 80}
                  height={220}
                  yAxisSuffix="kg"
                  withDots={true}
                  withInnerLines={true}
                  withOuterLines={false}
                  chartConfig={chartConfigRM}
                  bezier
                  style={styles.chart}
                />
              )}
            </View>
          )}
        </BlurView>
      </View>
    </ScrollView>
  );
}

const chartConfigBW = {
  backgroundGradientFromOpacity: 0,
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.5})`,
  strokeWidth: 3,
  propsForDots: { r: "4", strokeWidth: "2", stroke: "#0F172A" }
};

const chartConfigRM = {
  backgroundGradientFromOpacity: 0,
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(0, 230, 118, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.5})`,
  strokeWidth: 3,
  propsForDots: { r: "5", strokeWidth: "2", stroke: "#0F172A" }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
    marginBottom: 30,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginLeft: 10,
  },
  sectionDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 20,
  },
  glassCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  weightInput: {
    flex: 1,
    padding: 16,
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  kgLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '800',
    marginRight: 10,
  },
  saveBtn: {
    backgroundColor: '#38BDF8',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 40,
  },
  emptyChart: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyChartText: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  dropdownText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  pickerList: {
    maxHeight: 250,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 10,
  },
  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  pickerItemText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
  }
});

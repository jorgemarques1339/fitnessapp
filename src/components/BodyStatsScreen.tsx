import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar,
  ChevronRight,
  Info
} from 'lucide-react-native';
import { useBodyStore } from '../store/useBodyStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { useAppTheme } from '../hooks/useAppTheme';
import AnimatedPressable from './common/AnimatedPressable';
import FluidChart from './common/FluidChart';
import SimpleWebChart from './common/SimpleWebChart';

const { width } = Dimensions.get('window');

export default function BodyStatsScreen() {
  const theme = useAppTheme();
  const { measurements, addMeasurement } = useBodyStore();
  const completedWorkouts = useHistoryStore(state => state.completedWorkouts);

  const [isLogging, setIsLogging] = useState(false);
  const [inputs, setInputs] = useState({
    weight: '',
    waist: '',
    biceps: '',
    chest: '',
    bodyFat: '',
  });

  const handleSave = () => {
    addMeasurement({
      weight: parseFloat(inputs.weight) || undefined,
      waist: parseFloat(inputs.waist) || undefined,
      biceps: parseFloat(inputs.biceps) || undefined,
      chest: parseFloat(inputs.chest) || undefined,
      bodyFat: parseFloat(inputs.bodyFat) || undefined,
    });
    setIsLogging(false);
    setInputs({ weight: '', waist: '', biceps: '', chest: '', bodyFat: '' });
  };

  const correlationData = useMemo(() => {
    // Logic to correlate Tonnage vs Waist
    if (measurements.length < 2) return null;
    
    // Simplistic correlation logic for demo
    const latestTonnage = completedWorkouts.slice(-5).reduce((acc, w) => acc + w.totalTonnageKg, 0) / 5;
    const prevTonnage = completedWorkouts.slice(-10, -5).reduce((acc, w) => acc + w.totalTonnageKg, 0) / 5;
    
    const latestWaist = measurements[0]?.waist || 0;
    const prevWaist = measurements[1]?.waist || 0;

    const tonnageDiffPercent = prevTonnage > 0 ? ((latestTonnage - prevTonnage) / prevTonnage) * 100 : 0;
    const waistDiff = prevWaist > 0 ? latestWaist - prevWaist : 0;

    return {
      tonnageBonus: tonnageDiffPercent,
      waistDrop: waistDiff,
    };
  }, [measurements, completedWorkouts]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Composição Corporal</Text>
        <TouchableOpacity 
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => setIsLogging(true)}
        >
          <Plus color="#000" size={20} />
          <Text style={styles.addBtnText}>Novo Registo</Text>
        </TouchableOpacity>
      </View>

      {isLogging && (
        <BlurView intensity={40} tint="dark" style={styles.logCard}>
          <Text style={styles.logTitle}>ADICIONAR MEDIDAS</Text>
          <View style={styles.inputGrid}>
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>Peso (kg)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={inputs.weight} 
                onChangeText={(v) => setInputs({...inputs, weight: v})}
              />
            </View>
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>Cintura (cm)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={inputs.waist} 
                onChangeText={(v) => setInputs({...inputs, waist: v})}
              />
            </View>
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>Bíceps (cm)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={inputs.biceps} 
                onChangeText={(v) => setInputs({...inputs, biceps: v})}
              />
            </View>
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>% Gordura</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={inputs.bodyFat} 
                onChangeText={(v) => setInputs({...inputs, bodyFat: v})}
              />
            </View>
          </View>
          <View style={styles.logActions}>
            <TouchableOpacity onPress={() => setIsLogging(false)}>
              <Text style={{ color: theme.colors.textMuted }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: theme.colors.secondary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      )}

      {/* Correlation Insight Card */}
      {correlationData && (
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          style={styles.insightCard}
        >
          <View style={styles.insightHeader}>
            <Activity color={theme.colors.primary} size={20} />
            <Text style={styles.insightTitle}>ANÁLISE DE CORRELAÇÃO PRO</Text>
          </View>
          
          <View style={styles.correlationRow}>
            <View style={styles.corItem}>
              <TrendingUp color={theme.colors.primary} size={24} />
              <Text style={styles.corValue}>+{correlationData.tonnageBonus.toFixed(1)}%</Text>
              <Text style={styles.corLabel}>Volume Semanal</Text>
            </View>
            <View style={styles.corDivider} />
            <View style={styles.corItem}>
              <TrendingDown color="#FF5252" size={24} />
              <Text style={styles.corValue}>{correlationData.waistDrop > 0 ? `+${correlationData.waistDrop}` : correlationData.waistDrop} cm</Text>
              <Text style={styles.corLabel}>Perímetro Cintura</Text>
            </View>
          </View>

          <View style={styles.insightFooter}>
            <Info color="rgba(255,255,255,0.4)" size={14} />
            <Text style={styles.insightText}>
              "A tua força subiu enquanto a cintura estabilizou. Estás a ganhar massa magra com eficiência!"
            </Text>
          </View>
        </LinearGradient>
      )}

      {/* Statistics Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Evolução de Medidas</Text>
         <View style={{ height: 200, marginBottom: 20 }}>
            {measurements.length > 0 ? (
               <SimpleWebChart 
                 data={measurements.slice(0, 7).reverse().map((m, i) => ({ x: i, y: m.waist || 0 }))}
                 labels={measurements.slice(0, 7).reverse().map(m => new Date(m.date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }))}
                 color={theme.colors.secondary}
                 height={200}
                 ySuffix="cm"
               />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={{ color: theme.colors.textMuted }}>Adiciona o teu primeiro registo para ver o gráfico.</Text>
              </View>
            )}
         </View>
      </View>

      {/* History Table */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Histórico Recente</Text>
        {measurements.map((m, i) => (
          <View key={m.id} style={[styles.historyRow, { borderBottomColor: theme.colors.border }]}>
            <View>
              <Text style={styles.historyDate}>{new Date(m.date).toLocaleDateString('pt-PT')}</Text>
              <Text style={styles.historyWeight}>{m.weight} kg</Text>
            </View>
            <View style={styles.historyMedidas}>
              <Text style={styles.medidaText}>Cintura: {m.waist}cm</Text>
              <Text style={styles.medidaText}>Bíceps: {m.biceps}cm</Text>
            </View>
            <ChevronRight color={theme.colors.textMuted} size={16} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 12,
  },
  logCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  inputItem: {
    width: '47%',
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 10,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  logActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 20,
    marginTop: 20,
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '800',
  },
  insightCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  insightTitle: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  correlationRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  corItem: {
    alignItems: 'center',
    gap: 4,
  },
  corValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  corLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  corDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  insightFooter: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 12,
  },
  insightText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 16,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  historySection: {
    gap: 12,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  historyWeight: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '800',
  },
  historyMedidas: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
    paddingRight: 10,
  },
  medidaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  }
});

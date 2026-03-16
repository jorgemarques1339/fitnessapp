import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronRight, Play, Activity } from 'lucide-react-native';

import { ROUTINES, RoutineDef } from '../data/routines';
import { useWorkoutStore } from '../store/useWorkoutStore';
import TonnageChart from './TonnageChart';

interface DashboardProps {
  onSelectRoutine: (routine: RoutineDef) => void;
  onResumeWorkout: () => void;
}

export default function Dashboard({ onSelectRoutine, onResumeWorkout }: DashboardProps) {
  const activeRoutine = useWorkoutStore(state => state.activeRoutine);
  const completedWorkouts = useWorkoutStore(state => state.completedWorkouts);
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const contentMaxWidth = 768;

  const safeWorkouts = completedWorkouts || [];
  const recentWorkouts = [...safeWorkouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-6);
  
  let tonnageLabels = recentWorkouts.map((w, i) => `T${i + 1}`);
  let tonnageData = recentWorkouts.map(w => w.totalTonnageKg / 1000);

  if (tonnageData.length === 0) {
    tonnageLabels = ['Início', 'Hoje'];
    tonnageData = [0, 0];
  } else if (tonnageData.length === 1) {
    tonnageLabels = ['', 'T1'];
    tonnageData = [0, tonnageData[0]];
  }

  return (
    <LinearGradient
      colors={['#0F172A', '#000000']}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={[
            styles.contentContainer,
            isLargeScreen && { alignItems: 'center' }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.innerContent, isLargeScreen && { width: contentMaxWidth }]}>
            <View style={styles.header}>
              <Text style={styles.greeting}>Bem-vindo, Atleta</Text>
              <Text style={styles.subtitle}>Pronto para destruir metas hoje?</Text>
            </View>

            <View style={styles.chartWrapper}>
              <TonnageChart 
                title="Progresso de Tonelagem (Kg)" 
                labels={tonnageLabels} 
                data={tonnageData} 
              />
            </View>

            {activeRoutine && (
              <TouchableOpacity activeOpacity={0.7} onPress={onResumeWorkout} style={styles.recoveryMargin}>
                <BlurView intensity={30} tint="dark" style={styles.glassCard}>
                  <View style={styles.recoveryContent}>
                    <View style={styles.recoveryIconBox}>
                      <Activity color="#FF3366" size={24} />
                    </View>
                    <View style={styles.recoveryTexts}>
                      <Text style={styles.recoveryTitle}>⏱️ Treino em Andamento</Text>
                      <Text style={styles.recoverySubtitle}>{activeRoutine.title}</Text>
                    </View>
                    <ChevronRight color="rgba(255,255,255,0.4)" size={20} />
                  </View>
                </BlurView>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>Plano de Treino</Text>
            
            <View style={styles.routinesGrid}>
              {ROUTINES.map((routine) => (
                <TouchableOpacity 
                  key={routine.id}
                  onPress={() => onSelectRoutine(routine)}
                  activeOpacity={0.7}
                  style={styles.cardContainer}
                >
                  <BlurView intensity={25} tint="dark" style={styles.glassCard}>
                    <View style={styles.cardIndicator} />
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{routine.title}</Text>
                        <Play color="rgba(255,255,255,0.7)" size={20} />
                      </View>
                      
                      <Text style={styles.cardSubtitle}>{routine.subtitle}</Text>
                      
                      <View style={styles.tagContainer}>
                        <BlurView intensity={20} tint="light" style={styles.glassTag}>
                          <Text style={styles.tagText}>{routine.exercises.length} Excs</Text>
                        </BlurView>
                      </View>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 60,
  },
  innerContent: {
    flex: 1,
    width: '100%',
  },
  header: {
    marginBottom: 40,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 6,
    fontWeight: '500',
  },
  chartWrapper: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  routinesGrid: {
    gap: 16,
  },
  cardContainer: {
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  glassCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    borderLeftColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  cardIndicator: {
    width: 6,
    backgroundColor: '#38BDF8',
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
  },
  glassTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  recoveryMargin: {
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  recoveryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  recoveryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recoveryTexts: {
    flex: 1,
  },
  recoveryTitle: {
    color: '#FF3366',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  recoverySubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

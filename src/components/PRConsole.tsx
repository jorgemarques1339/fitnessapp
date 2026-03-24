import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { Trophy, TrendingUp, ChevronRight, Weight, Target, Dumbbell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { useHistoryStore } from '../store/useHistoryStore';
import { getAllTimePRs, BestRecord } from '../utils/weeklyStats';
import { useAppTheme } from '../hooks/useAppTheme';
import { EXERCISE_DATABASE, MuscleGroup } from '../data/exercises';

const { width } = Dimensions.get('window');

export function PRConsoleModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <PRConsole />
        <TouchableOpacity 
          onPress={onClose} 
          style={{ 
            position: 'absolute', 
            top: 50, 
            right: 20, 
            padding: 10,
            zIndex: 10
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 24 }}>✕</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function PRConsole() {
  const theme = useAppTheme();
  const completedWorkouts = useHistoryStore(state => state.completedWorkouts);
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Todos');

  const allPRs = useMemo(() => getAllTimePRs(completedWorkouts), [completedWorkouts]);

  const muscleGroups: string[] = [
    'Todos', 'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'
  ];

  const filteredPRs = useMemo(() => {
    if (selectedMuscle === 'Todos') return allPRs;
    
    return allPRs.filter(pr => {
      const ex = EXERCISE_DATABASE.find(e => e.id === pr.exerciseId);
      if (!ex) return false;
      
      const muscle = ex.category as string;
      if (selectedMuscle === 'Legs') return ['Quads', 'Hamstrings', 'Glutes', 'Calves'].includes(muscle);
      if (selectedMuscle === 'Arms') return ['Biceps', 'Triceps', 'Forearms'].includes(muscle);
      return muscle === selectedMuscle;
    });
  }, [allPRs, selectedMuscle]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={['rgba(255,215,0,0.05)', 'transparent', 'transparent']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerGlow} />
          <Trophy color="#FFD700" size={40} strokeWidth={2} />
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Sala de Troféus</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Os teus recordes históricos</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {muscleGroups.map((muscle) => (
            <TouchableOpacity
              key={muscle}
              onPress={() => setSelectedMuscle(muscle)}
              style={[
                styles.filterBadge,
                selectedMuscle === muscle && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
              ]}
            >
              <Text style={[
                styles.filterText,
                { color: selectedMuscle === muscle ? '#000' : theme.colors.textMuted }
              ]}>
                {muscle === 'Todos' ? 'Todos' : muscle}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.listContainer}>
          {filteredPRs.length === 0 ? (
            <View style={styles.emptyState}>
              <Dumbbell color={theme.colors.textMuted} size={48} strokeWidth={1} style={{ marginBottom: 15 }} />
              <Text style={{ color: theme.colors.textMuted, textAlign: 'center' }}>
                Ainda não há recordes nesta categoria. Hora de treinar!
              </Text>
            </View>
          ) : (
            filteredPRs.map((pr, index) => (
              <PRCard key={pr.exerciseId} pr={pr} index={index} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function PRCard({ pr, index }: { pr: BestRecord; index: number }) {
  const theme = useAppTheme();

  return (
    <Animated.View entering={FadeInDown.delay(index * 50)} style={styles.cardWrapper}>
      <BlurView intensity={20} tint="dark" style={[styles.prCard, { borderColor: 'rgba(255,215,0,0.1)' }]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Trophy color="#FFD700" size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.exerciseName, { color: theme.colors.textPrimary }]}>{pr.exerciseName}</Text>
            <Text style={[styles.lastDate, { color: theme.colors.textMuted }]}>
              Último Recorde: {new Date(pr.lastDate).toLocaleDateString('pt-PT')}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Weight color={theme.colors.primary} size={16} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.statLabel}>Carga Máxima</Text>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{pr.bestWeight} kg</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Target color={theme.colors.secondary} size={16} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.statLabel}>Est. 1RM</Text>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{Math.round(pr.best1RM)} kg</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <TrendingUp color="#00E676" size={16} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.statLabel}>Vol. Máx</Text>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{(pr.totalVolume / 1000).toFixed(1)}t</Text>
            </View>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerGlow: {
    position: 'absolute',
    top: 40,
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  filterScroll: {
    paddingVertical: 10,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    padding: 20,
    gap: 16,
  },
  cardWrapper: {
    width: '100%',
  },
  prCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,215,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '800',
  },
  lastDate: {
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    opacity: 0.5,
  }
});

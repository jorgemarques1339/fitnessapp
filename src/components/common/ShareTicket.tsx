import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, Clock, Flame, Zap } from 'lucide-react-native';
import { CompletedWorkout } from '../../store/types';

interface ShareTicketProps {
  workout: CompletedWorkout | null;
}

const ShareTicket = forwardRef<View, ShareTicketProps>(({ workout }, ref) => {
  if (!workout) return null;

  const formatDuration = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} min`;
  };

  return (
    <View ref={ref} style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E1F26']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Visual Accent */}
      <View style={styles.gradientGlow}>
        <LinearGradient
          colors={['rgba(0, 230, 118, 0.4)', 'rgba(56, 189, 248, 0.4)', 'transparent']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>TREINO DESTRUÍDO 🚀</Text>
          <Text style={styles.routine}>{workout.routineTitle.toUpperCase()}</Text>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {new Date(workout.date).toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient colors={['rgba(0,230,118,0.1)', 'transparent']} style={StyleSheet.absoluteFillObject} />
            <Dumbbell color="#00E676" size={28} />
            <Text style={styles.statValue}>{workout.totalTonnageKg.toLocaleString()}kg</Text>
            <Text style={styles.statLabel}>VOLUME TOTAL</Text>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['rgba(56,189,248,0.1)', 'transparent']} style={StyleSheet.absoluteFillObject} />
            <Clock color="#38BDF8" size={28} />
            <Text style={styles.statValue}>{formatDuration(workout.durationMs)}</Text>
            <Text style={styles.statLabel}>DURAÇÃO</Text>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['rgba(244,63,94,0.1)', 'transparent']} style={StyleSheet.absoluteFillObject} />
            <Zap color="#F43F5E" size={28} />
            <Text style={styles.statValue}>{workout.totalSets}</Text>
            <Text style={styles.statLabel}>SÉRIES ÉPICAS</Text>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['rgba(245,158,11,0.1)', 'transparent']} style={StyleSheet.absoluteFillObject} />
            <Flame color="#F59E0B" size={28} />
            <Text style={styles.statValue}>MAX</Text>
            <Text style={styles.statLabel}>ESFORÇO</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.brand}>💪 Registado com Fitness App</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 400, // Fixed width for optimal sharing
    height: 600,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    position: 'absolute', // To keep it off-screen during capture
    left: -10000,
    top: -10000,
  },
  gradientGlow: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    bottom: -100,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    color: '#38BDF8',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
    textShadowColor: 'rgba(56,189,248,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  routine: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  dateBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dateText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  statCard: {
    width: '46%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  brand: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  }
});

export default ShareTicket;

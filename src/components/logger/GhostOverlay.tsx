import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ghost, Zap, TrendingUp } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { SetLog } from '../../store/types';

interface Props {
  previousSets: SetLog[];
}

export default function GhostOverlay({ previousSets }: Props) {
  if (previousSets.length === 0) return null;

  const totalTonnage = previousSets.reduce((acc, s) => acc + (parseFloat(s.weightKg) * parseInt(s.reps, 10)), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ghost color="rgba(255,255,255,0.4)" size={16} />
        <Text style={styles.title}>MODO GHOST (SESSÃO ANTERIOR)</Text>
      </View>
      
      <View style={styles.setsGrid}>
        {previousSets.slice(0, 4).map((s, i) => (
          <View key={i} style={styles.setRow}>
            <Text style={styles.setNum}>S{s.setNumber}</Text>
            <Text style={styles.setValue}>{s.weightKg}kg × {s.reps}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TrendingUp color="#00E676" size={14} />
        <Text style={styles.tonnage}>Volume: {totalTonnage.toLocaleString()} kg</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    opacity: 0.6,
  },
  title: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  setsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  setNum: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '700',
  },
  setValue: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8,
  },
  tonnage: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: 'bold',
  }
});

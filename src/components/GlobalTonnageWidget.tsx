import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../hooks/useAppTheme';
import PremiumCard from './common/PremiumCard';

export default function GlobalTonnageWidget() {
  const theme = useAppTheme();
  
  // Simulated community data
  const currentTonnage = 1245800; // 1.2M kg
  const targetTonnage = 1500000; // 1.5M kg
  const progress = currentTonnage / targetTonnage;
  const activeAthletes = 452;

  const formatTonnage = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toString();
  };

  return (
    <PremiumCard style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Users color={theme.colors.secondary} size={18} />
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Esforço Coletivo</Text>
        </View>
        <View style={[styles.activeBadge, { backgroundColor: 'rgba(0,230,118,0.1)' }]}>
          <View style={[styles.pulseDot, { backgroundColor: '#00E676' }]} />
          <Text style={[styles.activeText, { color: '#00E676' }]}>{activeAthletes} Atletas Live</Text>
        </View>
      </View>

      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        A comunidade moveu <Text style={{ color: theme.colors.primary, fontFamily: 'Outfit-Bold' }}>{formatTonnage(currentTonnage)}kg</Text> esta semana.
      </Text>

      <View style={[styles.track, { backgroundColor: theme.colors.surfaceHighlight }]}>
        <LinearGradient
          colors={theme.colors.gradients.liquid as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${progress * 100}%` }]}
        />
      </View>

      <View style={styles.footer}>
        <TrendingUp color={theme.colors.textMuted} size={12} />
        <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
          Objetivo: 1.5M kg (Peso de 10 Baleias Azuis 🐋)
        </Text>
      </View>
    </PremiumCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  }
});

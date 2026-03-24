import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { useConfigStore } from '../../store/useConfigStore';

interface PlateCalculatorProps {
  targetWeight: number;
  barWeight?: number;
}

const PLATE_CONFIG: Record<number, { color: string }> = {
  25: { color: '#EF4444' },
  20: { color: '#3B82F6' },
  15: { color: '#FACC15' },
  10: { color: '#22C55E' },
  5: { color: '#FFFFFF' },
  2.5: { color: '#94A3B8' },
  1.25: { color: '#475569' },
};

export default function PlateCalculator({ targetWeight, barWeight = 20 }: PlateCalculatorProps) {
  const theme = useAppTheme();
  const availablePlates = useConfigStore(state => state.availablePlates);

  const platesPerSide = useMemo(() => {
    let remaining = (targetWeight - barWeight) / 2;
    if (remaining < 0) return [];
    
    const result: number[] = [];
    const plates = availablePlates || [25, 20, 15, 10, 5, 2.5, 1.25];
    const sortedPlates = [...plates].sort((a, b) => b - a);

    for (const p of sortedPlates) {
      while (remaining >= p) {
        result.push(p);
        remaining -= p;
        remaining = Math.round(remaining * 100) / 100;
      }
    }
    return result;
  }, [targetWeight, barWeight, availablePlates]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Matemático do Ginásio</Text>
        <View style={styles.weightBadge}>
          <Text style={styles.weightText}>{targetWeight} kg</Text>
        </View>
      </View>

      <View style={[styles.webVisual, { borderColor: theme.colors.border }]}>
         <View style={[styles.bar, { backgroundColor: theme.colors.border }]} />
         <View style={styles.platesContainer}>
            {platesPerSide.map((p, i) => (
                <View key={i} style={[styles.plateGraphic, { backgroundColor: PLATE_CONFIG[p]?.color || '#94A3B8', height: 40 + (p * 2) }]} />
            ))}
         </View>
      </View>

      <View style={styles.legend}>
        <Text style={[styles.legendTitle, { color: theme.colors.textSecondary }]}>Anilhas por lado:</Text>
        <View style={styles.platesList}>
          {platesPerSide.length > 0 ? (
            platesPerSide.map((p, i) => (
              <View key={i} style={[styles.plateChip, { backgroundColor: (PLATE_CONFIG[p]?.color || '#94A3B8') + '40', borderColor: PLATE_CONFIG[p]?.color || '#94A3B8' }]}>
                <Text style={[styles.plateChipText, { color: PLATE_CONFIG[p]?.color === '#FFFFFF' ? '#000' : '#FFF' }]}>{p}kg</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: theme.colors.textMuted }}>Apenas a barra ({barWeight}kg)</Text>
          )}
        </View>
      </View>

      <Text style={[styles.info, { color: theme.colors.textMuted }]}>
        Baseado numa barra standard de {barWeight}kg.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  weightBadge: {
    backgroundColor: '#00E676',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weightText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16,
  },
  webVisual: {
    width: '100%',
    height: 120,
    backgroundColor: 'transparent',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
  },
  bar: {
    width: '90%',
    height: 12,
    borderRadius: 6,
    opacity: 0.3,
  },
  platesContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    left: '50%',
  },
  plateGraphic: {
    width: 14,
    borderRadius: 4,
  },
  legend: {
    width: '100%',
    marginTop: 30,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  platesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  plateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  plateChipText: {
    fontWeight: '800',
    fontSize: 14,
  },
  info: {
    marginTop: 20,
    fontSize: 11,
    opacity: 0.6,
  }
});

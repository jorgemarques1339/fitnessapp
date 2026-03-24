import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { 
  Canvas, 
  Rect, 
  Group, 
  RoundedRect, 
  Text as SkiaText, 
  useFont, 
  vec,
  LinearGradient
} from '@shopify/react-native-skia';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  FadeIn,
  FadeInDown,
  LayoutAnimation
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { useConfigStore } from '../../store/useConfigStore';

interface PlateCalculatorProps {
  targetWeight: number;
  barWeight?: number;
}

const PLATE_CONFIG: Record<number, { color: string, height: number, width: number }> = {
  25: { color: '#EF4444', height: 160, width: 28 },
  20: { color: '#3B82F6', height: 150, width: 26 },
  15: { color: '#FACC15', height: 140, width: 24 },
  10: { color: '#22C55E', height: 120, width: 22 },
  5: { color: '#FFFFFF', height: 90, width: 18 },
  2.5: { color: '#94A3B8', height: 75, width: 14 },
  1.25: { color: '#475569', height: 60, width: 12 },
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
        // Float precision fix
        remaining = Math.round(remaining * 100) / 100;
      }
    }
    return result;
  }, [targetWeight, barWeight, availablePlates]);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Matemático do Ginásio</Text>
        <View style={styles.weightBadge}>
          <Text style={styles.weightText}>{targetWeight} kg</Text>
        </View>
      </Animated.View>

      <View style={styles.canvasContainer}>
        <Canvas style={styles.canvas}>
          {/* Barbell Bar */}
          <Rect 
            x={0} 
            y={100 - 10} 
            width={400} 
            height={20} 
            color="#334155" 
          />
          
          {/* Barbell Sleeve Stopper */}
          <Rect 
            x={80} 
            y={100 - 35} 
            width={15} 
            height={70} 
            color="#475569" 
          />

          {/* Plates on the right side (Visualization of one side) */}
          <Group transform={[{ translateX: 100 }]}>
            {platesPerSide.map((weight, index) => {
              const config = PLATE_CONFIG[weight];
              if (!config) return null; // Safety check

              // Calculate x position based on previous plates widths
              let currentX = 0;
              for(let i=0; i<index; i++) {
                const prevWeight = platesPerSide[i];
                if (PLATE_CONFIG[prevWeight]) {
                  currentX += PLATE_CONFIG[prevWeight].width + 4;
                }
              }

              return (
                <Group key={`${weight}-${index}`} transform={[{ translateX: currentX }]}>
                  <RoundedRect
                    x={0}
                    y={100 - config.height / 2}
                    width={config.width}
                    height={config.height}
                    r={4}
                    color={config.color}
                  >
                    {/* Add a subtle highlight to make the plate look 3D */}
                    <LinearGradient
                      start={vec(0, 0)}
                      end={vec(config.width, 0)}
                      colors={['rgba(255,255,255,0.2)', 'rgba(0,0,0,0.1)']}
                    />
                  </RoundedRect>
                </Group>
              );
            })}
          </Group>
        </Canvas>
      </View>

      <View style={styles.legend}>
        <Text style={[styles.legendTitle, { color: theme.colors.textSecondary }]}>Anilhas por lado:</Text>
        <View style={styles.platesList}>
          {platesPerSide.length > 0 ? (
            platesPerSide
              .filter(p => !!PLATE_CONFIG[p])
              .map((p, i) => (
                <View key={i} style={[styles.plateChip, { backgroundColor: PLATE_CONFIG[p].color + '40', borderColor: PLATE_CONFIG[p].color }]}>
                  <Text style={[styles.plateChipText, { color: PLATE_CONFIG[p].color === '#FFFFFF' ? '#000' : '#FFF' }]}>{p}kg</Text>
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
  canvasContainer: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  canvas: {
    width: 400,
    height: 200,
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
    fontSize: 12,
    opacity: 0.6,
  }
});

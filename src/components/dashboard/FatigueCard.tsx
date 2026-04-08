import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import StatusPill from '../common/StatusPill';

interface FatigueCardProps {
  item: any;
  theme: any;
}

export default function FatigueCard({ item, theme }: FatigueCardProps) {
  const muscleNames: Record<string, string> = {
    'Chest': 'Peito',
    'Back': 'Costas',
    'Shoulders': 'Ombros',
    'Biceps': 'Bíceps',
    'Triceps': 'Tríceps',
    'Quads': 'Quadríceps',
    'Hamstrings': 'Isquios',
    'Glutes': 'Glúteos',
    'Calves': 'Gémeos',
    'Core': 'Core'
  };

  const isCritical = item.recoveryPercent < 30;
  const statusColor = item.status === 'Ready' ? '#00E676' : item.status === 'Recovering' ? '#FFA000' : theme.colors.danger;

  const pulse = useSharedValue(1);
  React.useEffect(() => {
    if (isCritical) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [isCritical]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.fatigueCard, 
        { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border },
        isCritical && { borderColor: theme.colors.danger },
        isCritical && animatedStyle
      ]}
    >
      <View style={styles.fatigueTop}>
        <Text style={[styles.fatigueLabel, { color: theme.colors.textMuted }]}>{muscleNames[item.muscle] || item.muscle}</Text>
        <StatusPill 
          label={item.status === 'Ready' ? 'Pronto' : item.status === 'Recovering' ? 'Médio' : 'Baixo'} 
          type={item.status === 'Ready' ? 'success' : item.status === 'Recovering' ? 'warning' : 'danger'}
          style={styles.miniPill}
        />
      </View>
      
      <View style={styles.fatigueBody}>
        <Text style={[styles.fatiguePercent, { color: theme.colors.textPrimary }]}>{item.recoveryPercent}%</Text>
        <View style={styles.fatigueBarBase}>
          <View style={[
            styles.fatigueBar, 
            { 
              width: `${item.recoveryPercent}%`, 
              backgroundColor: statusColor 
            }
          ]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fatigueCard: {
    padding: 12,
    borderRadius: 18,
    width: 130,
    borderWidth: 1,
  },
  fatigueTop: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: 8,
  },
  miniPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 50,
  },
  fatigueLabel: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  fatigueBody: {
    flexDirection: 'column',
  },
  fatigueBarBase: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 1.5,
    marginTop: 6,
    overflow: 'hidden',
  },
  fatigueBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  fatiguePercent: {
    fontSize: 18,
    letterSpacing: -0.5,
  },
});

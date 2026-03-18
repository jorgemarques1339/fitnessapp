import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Trophy, Dumbbell, Zap, Crown, Weight } from 'lucide-react-native';

interface AchievementBadgeProps {
  type: 'squat_king' | 'deadlift_pro' | 'volume_warrior' | 'streak_hero';
  size?: number;
}

export default function AchievementBadge({ type, size = 120 }: AchievementBadgeProps) {
  const R = size / 2;
  
  const badgeConfig = {
    squat_king: { label: 'Rei do Agachamento', icon: <Crown size={R} color="#FFD700" />, color: '#FFD700' },
    deadlift_pro: { label: 'Mestre do Peso Morto', icon: <Zap size={R} color="#00E676" />, color: '#00E676' },
    volume_warrior: { label: 'Guerrilheiro de Volume', icon: <Weight size={R} color="#38BDF8" />, color: '#38BDF8' },
    streak_hero: { label: 'Herói da Consistência', icon: <Trophy size={R} color="#F472B6" />, color: '#F472B6' },
  }[type];

  return (
    <View style={[styles.container, { width: size, height: size + 30 }]}>
      <View style={[styles.badgeCircle, { width: size, height: size, borderColor: badgeConfig.color, backgroundColor: 'rgba(30, 41, 59, 0.8)' }]}>
        {badgeConfig.icon}
      </View>
      <Text style={styles.badgeLabel}>{badgeConfig.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badgeCircle: {
    borderRadius: 1000,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeLabel: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    width: '120%',
  }
});

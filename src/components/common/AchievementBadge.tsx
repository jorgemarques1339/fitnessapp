import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { 
  Canvas, 
  Circle, 
  Group, 
  LinearGradient, 
  vec, 
  Mask,
  Rect,
  Skia,
  SweepGradient,
  Blur
} from '@shopify/react-native-skia';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  useDerivedValue,
  withSpring,
  interpolate
} from 'react-native-reanimated';
import { DeviceMotion } from 'expo-sensors';
import { Trophy, Dumbbell, Zap, Crown, Weight } from 'lucide-react-native';

interface AchievementBadgeProps {
  type: 'squat_king' | 'deadlift_pro' | 'volume_warrior' | 'streak_hero';
  size?: number;
}

export default function AchievementBadge({ type, size = 120 }: AchievementBadgeProps) {
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  
  const R = size / 2;
  const STROKE = 8;
  const INNER_R = R - STROKE;

  useEffect(() => {
    let subscription: any;
    
    // Check availability and subscribe
    DeviceMotion.isAvailableAsync().then(available => {
      if (available) {
        subscription = DeviceMotion.addListener(({ rotation }) => {
          if (rotation) {
            tiltX.value = withSpring(rotation.gamma, { damping: 15 });
            tiltY.value = withSpring(rotation.beta, { damping: 15 });
          }
        });
        DeviceMotion.setUpdateInterval(50);
      }
    });

    return () => subscription?.remove();
  }, []);

  const shineX = useDerivedValue(() => {
    return interpolate(tiltX.value, [-1, 1], [0, size]);
  });
  
  const shineY = useDerivedValue(() => {
    return interpolate(tiltY.value, [0, 1.5], [0, size]);
  });

  const badgeConfig = {
    squat_king: { label: 'Rei do Agachamento', icon: <Crown size={R} color="#FFD700" />, colors: ['#FFD700', '#FFA000', '#FFD700'] },
    deadlift_pro: { label: 'Mestre do Peso Morto', icon: <Zap size={R} color="#00E676" />, colors: ['#00E676', '#00C853', '#00E676'] },
    volume_warrior: { label: 'Guerrilheiro de Volume', icon: <Weight size={R} color="#38BDF8" />, colors: ['#38BDF8', '#0284C7', '#38BDF8'] },
    streak_hero: { label: 'Herói da Consistência', icon: <Trophy size={R} color="#F472B6" />, colors: ['#F472B6', '#DB2777', '#F472B6'] },
  }[type];

  return (
    <View style={[styles.container, { width: size, height: size + 30 }]}>
      <Canvas style={{ width: size, height: size }}>
        <Group>
          {/* Main Badge Background */}
          <Circle cx={R} cy={R} r={INNER_R} color="#1E293B" />
          
          {/* Metallic Border */}
          <Circle 
            cx={R} 
            cy={R} 
            r={INNER_R} 
            style="stroke" 
            strokeWidth={STROKE}
          >
            <SweepGradient
              c={vec(R, R)}
              colors={badgeConfig.colors}
            />
          </Circle>

          {/* Gyro Shine Effect */}
          <Mask
            mask={
              <Circle cx={R} cy={R} r={INNER_R} color="white" />
            }
          >
            <Rect x={0} y={0} width={size} height={size}>
              <LinearGradient
                start={useDerivedValue(() => vec(shineX.value - 40, shineY.value - 40))}
                end={useDerivedValue(() => vec(shineX.value + 40, shineY.value + 40))}
                colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
              />
            </Rect>
          </Mask>

          {/* Inner Glow */}
          <Circle cx={R} cy={R} r={INNER_R - 10} opacity={0.1} color={badgeConfig.colors[0]}>
            <Blur blur={10} />
          </Circle>
        </Group>
      </Canvas>
      
      {/* Icon Overlay */}
      <View style={[StyleSheet.absoluteFill, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
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

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { MuscleVolume } from '../../utils/weeklyStats';
import { useAppTheme } from '../../hooks/useAppTheme';

interface Props {
  volumeData: MuscleVolume[];
  size?: number;
}

export default function MuscleHeatmap({ volumeData, size = 300 }: Props) {
  const theme = useAppTheme();

  const getIntensityColor = (muscle: string) => {
    const data = volumeData.find(v => v.muscle === muscle);
    if (!data || data.sets === 0) return 'rgba(255,255,255,0.05)';
    
    // Scale: 0-20 sets
    const intensity = Math.min(1, data.sets / 20);
    
    // Heatmap colors: Blue -> Cyan -> Green -> Yellow -> Orange -> Red
    // For this app premium theme, we use: SurfaceHighlight -> Primary -> Secondary -> Accent
    if (intensity < 0.2) return 'rgba(0,230,118,0.2)'; // Light green
    if (intensity < 0.5) return 'rgba(0,230,118,0.5)'; // Medium green
    if (intensity < 0.8) return '#00E676'; // Bright green (Success)
    return '#FF6B35'; // Orange/Accent (Hyper)
  };

  return (
    <View style={[styles.container, { width: size, height: size * 1.8 }]}>
      <Svg viewBox="0 0 100 180" width="100%" height="100%">
        {/* Simplified Human Silhouette Paths (Frente) */}
        <G id="Front_Anatomy">
          {/* Head */}
          <Path d="M50 5 a 5 5 0 1 1 0 10 a 5 5 0 1 1 0 -10" fill="rgba(255,255,255,0.05)" />
          
          {/* Chest */}
          <Path 
            d="M35 35 Q50 30 65 35 L62 50 Q50 55 38 50 Z" 
            fill={getIntensityColor('Chest')} 
          />
          
          {/* Shoulders */}
          <Path d="M30 35 Q35 30 40 35 L35 45 Z" fill={getIntensityColor('Shoulders')} />
          <Path d="M70 35 Q65 30 60 35 L65 45 Z" fill={getIntensityColor('Shoulders')} />

          {/* Abdominals / Core */}
          <Path d="M38 55 Q50 55 62 55 L60 85 Q50 90 40 85 Z" fill={getIntensityColor('Core')} />

          {/* Biceps */}
          <Path d="M25 45 Q28 55 32 65 L25 65 Z" fill={getIntensityColor('Biceps')} />
          <Path d="M75 45 Q72 55 68 65 L75 65 Z" fill={getIntensityColor('Biceps')} />

          {/* Forearms */}
          <Path d="M25 70 L30 95 L22 95 Z" fill={getIntensityColor('Forearms')} />
          <Path d="M75 70 L70 95 L78 95 Z" fill={getIntensityColor('Forearms')} />

          {/* Quads */}
          <Path d="M35 95 Q40 115 45 135 L33 135 Z" fill={getIntensityColor('Quads')} />
          <Path d="M65 95 Q60 115 55 135 L67 135 Z" fill={getIntensityColor('Quads')} />

          {/* Calves */}
          <Path d="M35 145 L42 170 L30 170 Z" fill={getIntensityColor('Calves')} />
          <Path d="M65 145 L58 170 L70 170 Z" fill={getIntensityColor('Calves')} />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }
});

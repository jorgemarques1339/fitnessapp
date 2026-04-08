import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../../hooks/useAppTheme';

interface ElevatedCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gradientColors?: string[];
  intensity?: number;
  hasPremiumShadow?: boolean;
}

export default function ElevatedCard({ 
  children, 
  style, 
  gradientColors, 
  intensity, 
  hasPremiumShadow = true 
}: ElevatedCardProps) {
  const theme = useAppTheme();
  
  const borderGradient = gradientColors || theme.colors.gradients.vibrant;
  const blurIntensity = intensity ?? (theme.isDark ? 30 : 60);

  return (
    <View style={[
      styles.outerContainer, 
      hasPremiumShadow && theme.shadows.premium,
      style
    ]}>
      <LinearGradient
        colors={borderGradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={[styles.innerContent, { backgroundColor: theme.colors.background }]}>
          <BlurView 
            intensity={blurIntensity} 
            tint={theme.isDark ? "dark" : "light"}
            style={styles.blur}
          >
            {children}
          </BlurView>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  gradientBorder: {
    padding: 1.5, // The thickness of the border
    borderRadius: 28,
  },
  innerContent: {
    borderRadius: 26.5,
    overflow: 'hidden',
  },
  blur: {
    padding: 1, // Slight offset to ensure blur starts inside border
  }
});

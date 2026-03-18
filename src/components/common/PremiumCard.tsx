import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../../hooks/useAppTheme';

export type CardVariant = 'default' | 'primary' | 'secondary' | 'alert' | 'ghost';

interface PremiumCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  variant?: CardVariant;
  intensity?: number;
  borderGradient?: string[];
  backgroundGradient?: string[];
  hasShadow?: boolean;
}

export default function PremiumCard({ 
  children, 
  style, 
  innerStyle,
  variant = 'default', 
  intensity, 
  borderGradient,
  backgroundGradient,
  hasShadow = true 
}: PremiumCardProps) {
  const theme = useAppTheme();
  
  // Resolve border gradient based on variant
  const getBorderGradient = () => {
    if (borderGradient) return borderGradient;
    switch (variant) {
      case 'primary': return theme.colors.gradients.vibrant;
      case 'secondary': return ['#00BCD4', '#00E676'];
      case 'alert': return ['rgba(255,120,0,0.5)', 'rgba(255,60,0,0.3)'];
      case 'ghost': return ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)'];
      default: return [theme.colors.border, theme.colors.border];
    }
  };

  // Resolve background (inner) color/gradient based on variant
  const getBackgroundContent = () => {
    if (backgroundGradient) {
      return (
        <LinearGradient
          colors={backgroundGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.innerBackground]}
        />
      );
    }
    
    // Default background color
    let bgColor = theme.colors.surfaceHighlight;
    if (variant === 'alert') bgColor = 'rgba(255,100,0,0.05)';
    if (variant === 'ghost') bgColor = 'transparent';

    return <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }, styles.innerBackground]} />;
  };

  const blurIntensity = intensity ?? (theme.isDark ? 30 : 60);
  const borders = getBorderGradient();

  return (
    <View style={[
      styles.outerContainer, 
      hasShadow && theme.shadows.premium,
      style
    ]}>
      <LinearGradient
        colors={borders as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.innerContent}>
          {getBackgroundContent()}
          <BlurView 
            intensity={blurIntensity} 
            tint={theme.isDark ? "dark" : "light"}
            style={[styles.blur, innerStyle]}
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
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradientBorder: {
    padding: 1.2, // Border thickness
    borderRadius: 24,
  },
  innerContent: {
    borderRadius: 23,
    overflow: 'hidden',
    position: 'relative',
  },
  innerBackground: {
    opacity: 0.8,
  },
  blur: {
    padding: 2,
  }
});

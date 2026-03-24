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
  glow?: boolean;
}

export default function PremiumCard({ 
  children, 
  style, 
  innerStyle,
  variant = 'default', 
  intensity, 
  borderGradient,
  backgroundGradient,
  hasShadow = true,
  glow = false
}: PremiumCardProps) {
  const theme = useAppTheme();
  
  // Resolve border gradient based on variant
  const getBorderGradient = () => {
    if (borderGradient) return borderGradient;
    switch (variant) {
      case 'primary': return theme.colors.gradients.liquid;
      case 'secondary': return ['#38BDF8', '#00E676'];
      case 'alert': return ['#FF3366', '#FFD700'];
      case 'ghost': return ['transparent', 'transparent'];
      default: return [theme.colors.glassBorder, 'transparent'];
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
    let bgColor = theme.colors.glassSurface;
    if (variant === 'alert') bgColor = 'rgba(255, 51, 102, 0.05)';
    if (variant === 'ghost') bgColor = 'transparent';
    if (variant === 'primary') bgColor = 'rgba(0, 230, 118, 0.03)';

    return (
      <View 
        style={[
          StyleSheet.absoluteFill, 
          { backgroundColor: bgColor }, 
          styles.innerBackground
        ]} 
      />
    );
  };

  const blurIntensity = intensity ?? (theme.isDark ? 20 : 40);
  const borders = getBorderGradient();
  const borderThickness = variant === 'primary' ? 1.5 : 1;

  return (
    <View style={[
      styles.outerContainer, 
      hasShadow && {
        shadowColor: glow ? theme.colors.primary : theme.colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: (variant === 'primary' || glow) ? 0.3 : 0.1,
        shadowRadius: glow ? 25 : 20,
        elevation: (variant === 'primary' || glow) ? 10 : 4,
        ...(glow && theme.shadows?.[`glow${(variant === 'secondary' ? 'Secondary' : 'Primary')}` as keyof typeof theme.shadows] || {}),
      },
      style
    ]}>
      <LinearGradient
        colors={borders as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientBorder, { padding: borderThickness }]}
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
    // Opacity is now handled dynamically in the component for theme support
  },
  blur: {
    padding: 2,
  }
});

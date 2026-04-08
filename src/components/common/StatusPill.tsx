import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';

type StatusType = 'success' | 'warning' | 'danger' | 'neutral';

interface StatusPillProps {
  label: string;
  type?: StatusType;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function StatusPill({ label, type = 'neutral', style, textStyle }: StatusPillProps) {
  const theme = useAppTheme();

  const getGradient = () => {
    switch (type) {
      case 'success': return theme.colors.gradients.success;
      case 'warning': return theme.colors.gradients.warning;
      case 'danger': return theme.colors.gradients.danger;
      default: return [theme.colors.surfaceHighlight, theme.colors.surfaceHighlight];
    }
  };

  return (
    <LinearGradient
      colors={getGradient() as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.pill, style]}
    >
      <Text style={[
        styles.text, 
        { color: type === 'neutral' ? theme.colors.textSecondary : '#FFFFFF' },
        textStyle
      ]}>
        {label}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});

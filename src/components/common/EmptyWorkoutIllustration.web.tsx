import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Dumbbell } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

export default function EmptyWorkoutIllustration() {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { backgroundColor: theme.colors.surfaceHighlight }]}>
        <Dumbbell color={theme.colors.secondary} size={48} opacity={0.5} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  }
});

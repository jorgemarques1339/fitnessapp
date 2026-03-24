import React from 'react';
import { View } from 'react-native';
import ResponsiveContainer from '../../src/components/common/ResponsiveContainer';
import ProfileScreen from '../../src/components/ProfileScreen';
import LivingBackground from '../../src/components/common/LivingBackground';
import { useAppTheme } from '../../src/hooks/useAppTheme';

export default function ProfileRoute() {
  const theme = useAppTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <LivingBackground />
      <ResponsiveContainer>
        <ProfileScreen />
      </ResponsiveContainer>
    </View>
  );
}

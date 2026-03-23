import React from 'react';
import { View } from 'react-native';
import ResponsiveContainer from '../../src/components/common/ResponsiveContainer';
import SettingsScreen from '../../src/components/SettingsScreen';

export default function SettingsRoute() {
  return (
    <ResponsiveContainer>
      <SettingsScreen />
    </ResponsiveContainer>
  );
}

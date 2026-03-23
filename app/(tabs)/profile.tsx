import React from 'react';
import { View } from 'react-native';
import ResponsiveContainer from '../../src/components/common/ResponsiveContainer';
import ProfileScreen from '../../src/components/ProfileScreen';

export default function ProfileRoute() {
  return (
    <ResponsiveContainer>
      <ProfileScreen />
    </ResponsiveContainer>
  );
}

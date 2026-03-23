import React from 'react';
import { View } from 'react-native';
import ResponsiveContainer from '../../src/components/common/ResponsiveContainer';
import ExerciseLibrary from '../../src/components/ExerciseLibrary';

export default function ExercisesRoute() {
  return (
    <ResponsiveContainer>
      <ExerciseLibrary />
    </ResponsiveContainer>
  );
}

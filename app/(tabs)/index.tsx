import React from 'react';
import ResponsiveContainer from '../../src/components/common/ResponsiveContainer';
import Dashboard from '../../src/components/Dashboard';
import { useWorkoutStore } from '../../src/store/useWorkoutStore';
import { useHistoryStore } from '../../src/store/useHistoryStore';

export default function IndexRoute() {
  const startWorkout = useWorkoutStore(state => state.startWorkout);
  const setIsInLogger = useWorkoutStore(state => state.setIsInLogger);

  return (
    <ResponsiveContainer>
      <Dashboard 
        onSelectRoutine={startWorkout}
        onResumeWorkout={() => setIsInLogger(true)}
      />
    </ResponsiveContainer>
  );
}

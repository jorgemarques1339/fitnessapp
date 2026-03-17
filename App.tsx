import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';

import Dashboard from './src/components/Dashboard';
import WorkoutLogger from './src/components/WorkoutLogger';
import { RoutineDef } from './src/data/routines';
import { useWorkoutStore } from './src/store/useWorkoutStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const isInLogger = useWorkoutStore(state => state.isInLogger);
  const activeRoutine = useWorkoutStore(state => state.activeRoutine);
  const startWorkout = useWorkoutStore(state => state.startWorkout);

  const handleSelectRoutine = (routine: RoutineDef) => {
    startWorkout(routine);
  };

  const handleResumeWorkout = () => {
    useWorkoutStore.setState({ isInLogger: true });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={styles.container}>
        {isInLogger && activeRoutine ? (
          <WorkoutLogger />
        ) : (
          <Dashboard 
            onSelectRoutine={handleSelectRoutine} 
            onResumeWorkout={handleResumeWorkout}
          />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
});

import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { Outfit_700Bold, Outfit_900Black } from '@expo-google-fonts/outfit';

import * as Notifications from 'expo-notifications';
import { useWorkoutStore } from '../src/store/useWorkoutStore';

import WorkoutLogger from '../src/components/WorkoutLogger';
import TrophyScreen from '../src/components/TrophyScreen';
import { initHealthKit } from '../src/utils/healthSync';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-Black': Inter_900Black,
    'Outfit-Bold': Outfit_700Bold,
    'Outfit-Black': Outfit_900Black,
  });

  const isInLogger = useWorkoutStore(state => state.isInLogger);
  const lastCompletedWorkout = useWorkoutStore(state => state.lastCompletedWorkout);

  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      const isHealthEnabled = useWorkoutStore.getState().healthSyncEnabled;
      if (isHealthEnabled) {
         initHealthKit();
      }

      Notifications.setNotificationCategoryAsync('REST_TIMER_ALARM', [
        { identifier: 'ADD_30', buttonTitle: '+30 Segundos', options: { opensAppToForeground: true } },
        { identifier: 'DISMISS', buttonTitle: 'Ignorar', options: { opensAppToForeground: false } }
      ]).catch(err => console.log("Category Set Error", err));
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {lastCompletedWorkout ? (
          <TrophyScreen />
        ) : isInLogger ? (
          <WorkoutLogger />
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

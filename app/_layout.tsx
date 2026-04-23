import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";

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
import { useHistoryStore } from '../src/store/useHistoryStore';
import { useConfigStore } from '../src/store/useConfigStore';

import WorkoutLogger from '../src/components/WorkoutLogger';
import OnboardingScreen from '../src/components/OnboardingScreen';
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

// We will manage Skia initialization inside the component now
let skiaInitializationPromise: Promise<void> | null = null;
if (Platform.OS === 'web') {
  skiaInitializationPromise = LoadSkiaWeb({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.40.0/bin/full/${file}`,
  }).catch(err => console.error("Skia failed to load on web", err));
}

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

  const [skiaLoaded, setSkiaLoaded] = React.useState(Platform.OS !== 'web');

  const isInLogger = useWorkoutStore(state => state.isInLogger);
  const lastCompletedWorkout = useHistoryStore(state => state.lastCompletedWorkout);
  const onboardingCompleted = useConfigStore(state => state.onboardingCompleted);

  React.useEffect(() => {
    if (Platform.OS === 'web' && skiaInitializationPromise) {
      skiaInitializationPromise.then(() => {
        setSkiaLoaded(true);
      });
    }
  }, []);

  React.useEffect(() => {
    useHistoryStore.getState().initHistory();
    const isWeb = Platform.OS === 'web';
    const healthSyncEnabled = useConfigStore.getState().healthSyncEnabled;

    if (healthSyncEnabled && !isWeb) {
      initHealthKit(); // Assuming syncHealthData is initHealthKit based on original code
    }

    if (!isWeb) {
      Notifications.setNotificationCategoryAsync('REST_TIMER_ALARM', [
        { identifier: 'ADD_30', buttonTitle: '+30 Segundos', options: { opensAppToForeground: true } },
        { identifier: 'DISMISS', buttonTitle: 'Ignorar', options: { opensAppToForeground: false } }
      ]).catch(err => console.log("Category Set Error", err));
    }
  }, []);

  if (!fontsLoaded || !skiaLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {!onboardingCompleted ? (
          <OnboardingScreen />
        ) : lastCompletedWorkout ? (
          <TrophyScreen />
        ) : isInLogger ? (
          <WorkoutLogger />
        ) : (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

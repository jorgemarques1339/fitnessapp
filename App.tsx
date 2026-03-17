import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { BlurView } from 'expo-blur';
import { Home, User, Settings } from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { Outfit_700Bold, Outfit_900Black } from '@expo-google-fonts/outfit';

import Dashboard from './src/components/Dashboard';
import WorkoutLogger from './src/components/WorkoutLogger';
import ProfileScreen from './src/components/ProfileScreen';
import SettingsScreen from './src/components/SettingsScreen';
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
  const activeRoutine = useWorkoutStore(state => state.activeRoutine);
  const startWorkout = useWorkoutStore(state => state.startWorkout);
  const getPreviousExerciseLog = useWorkoutStore(state => state.getPreviousExerciseLog);

  const [currentTab, setCurrentTab] = React.useState<'dashboard'|'profile'|'settings'>('dashboard');

  if (!fontsLoaded) {
    return null;
  }

  const handleSelectRoutine = (routine: any) => {
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
          <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
            {currentTab === 'dashboard' ? (
              <Dashboard
                onSelectRoutine={handleSelectRoutine}
                onResumeWorkout={handleResumeWorkout}
              />
            ) : currentTab === 'profile' ? (
              <ProfileScreen />
            ) : (
              <SettingsScreen />
            )}

            {/* Simple Bottom Tab Navigation */}
            <BlurView intensity={50} tint="dark" style={styles.tabBar}>
              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setCurrentTab('dashboard')}
              >
                <Home color={currentTab === 'dashboard' ? '#38BDF8' : 'rgba(255,255,255,0.4)'} size={24} />
                <Text style={[styles.tabText, currentTab === 'dashboard' && { color: '#38BDF8' }]}>Treino</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setCurrentTab('profile')}
              >
                <User color={currentTab === 'profile' ? '#00E676' : 'rgba(255,255,255,0.4)'} size={24} />
                <Text style={[styles.tabText, currentTab === 'profile' && { color: '#00E676' }]}>Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setCurrentTab('settings')}
              >
                <Settings color={currentTab === 'settings' ? '#FFD700' : 'rgba(255,255,255,0.4)'} size={24} />
                <Text style={[styles.tabText, currentTab === 'settings' && { color: '#FFD700' }]}>Definições</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabBar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 24, // Safe area bottom
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 10,
    marginTop: 4,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    textTransform: 'uppercase',
  }
});

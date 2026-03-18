import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import { BlurView } from 'expo-blur';
import { Home, User, Settings as SettingsIcon } from 'lucide-react-native';

import { useWorkoutStore } from './src/store/useWorkoutStore';
import { useAppTheme } from './src/hooks/useAppTheme';

import Dashboard from './src/components/Dashboard';
import ProfileScreen from './src/components/ProfileScreen';
import SettingsScreen from './src/components/SettingsScreen';
import WorkoutLogger from './src/components/WorkoutLogger';
import TrophyScreen from './src/components/TrophyScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const { width } = Dimensions.get('window');

function MainApp() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [currentTab, setCurrentTab] = React.useState<'dashboard' | 'profile' | 'settings'>('dashboard');
  
  const isInLogger = useWorkoutStore(state => state.isInLogger);
  const lastCompletedWorkout = useWorkoutStore(state => state.lastCompletedWorkout);
  const startWorkout = useWorkoutStore(state => state.startWorkout);
  const setIsInLogger = useWorkoutStore(state => state.setIsInLogger);

  const handleSelectRoutine = (routine: any) => {
    startWorkout(routine);
  };

  const handleResumeWorkout = () => {
    setIsInLogger(true);
  };

  if (lastCompletedWorkout) {
    return <TrophyScreen />;
  }

  if (isInLogger) {
    return <WorkoutLogger />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1 }}>
        {currentTab === 'dashboard' && (
          <Dashboard 
            onSelectRoutine={handleSelectRoutine}
            onResumeWorkout={handleResumeWorkout}
          />
        )}
        {currentTab === 'profile' && <ProfileScreen />}
        {currentTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Glassmorphic Tab Bar */}
      <View style={[
        styles.tabBarContainer,
        { paddingBottom: Math.max(insets.bottom, 20) }
      ]}>
        <BlurView 
          intensity={theme.isDark ? 30 : 60} 
          tint={theme.isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.tabBar, { borderTopColor: theme.colors.border }]}>
          <TouchableOpacity 
            onPress={() => setCurrentTab('dashboard')}
            style={styles.tabItem}
          >
            <Home 
              size={24} 
              color={currentTab === 'dashboard' ? theme.colors.primary : theme.colors.textMuted} 
              strokeWidth={currentTab === 'dashboard' ? 2.5 : 2}
            />
            <Text style={[
              styles.tabText,
              { color: currentTab === 'dashboard' ? theme.colors.primary : theme.colors.textMuted }
            ]}>Início</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setCurrentTab('profile')}
            style={styles.tabItem}
          >
            <User 
              size={24} 
              color={currentTab === 'profile' ? theme.colors.primary : theme.colors.textMuted}
              strokeWidth={currentTab === 'profile' ? 2.5 : 2}
            />
            <Text style={[
              styles.tabText,
              { color: currentTab === 'profile' ? theme.colors.primary : theme.colors.textMuted }
            ]}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setCurrentTab('settings')}
            style={styles.tabItem}
          >
            <SettingsIcon 
              size={24} 
              color={currentTab === 'settings' ? theme.colors.primary : theme.colors.textMuted}
              strokeWidth={currentTab === 'settings' ? 2.5 : 2}
            />
            <Text style={[
              styles.tabText,
              { color: currentTab === 'settings' ? theme.colors.primary : theme.colors.textMuted }
            ]}>Definições</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MainApp />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    height: '100%',
    paddingTop: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  }
});

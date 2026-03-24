import React from 'react';
import { Tabs } from 'expo-router';
import { View, useWindowDimensions, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Home, User, Settings as SettingsIcon, Dumbbell, Users } from 'lucide-react-native';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { themeBase } from '../../src/theme/theme';
import Sidebar from '../../src/components/common/Sidebar';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      <BlurView intensity={theme.isDark ? 30 : 60} tint={theme.isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      <View style={[styles.tabBar, { borderTopColor: theme.colors.border }]}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          
          const onPress = () => {
             const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
             if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          let Icon = Home;
          let label = "Início";
          if (route.name === 'index') { Icon = Home; label = "Início"; }
          if (route.name === 'social') { Icon = Users; label = "Comunidade"; }
          if (route.name === 'exercises') { Icon = Dumbbell; label = "Exercícios"; }
          if (route.name === 'profile') { Icon = User; label = "Perfil"; }
          if (route.name === 'settings') { Icon = SettingsIcon; label = "Definições"; }

          return (
            <TouchableOpacity key={route.name} onPress={onPress} style={styles.tabItem}>
              <Icon size={24} color={isFocused ? theme.colors.primary : theme.colors.textMuted} strokeWidth={isFocused ? 2.5 : 2} />
              <Text style={[styles.tabText, { color: isFocused ? theme.colors.primary : theme.colors.textMuted }]}>{label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
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

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const theme = useAppTheme();
  const isLargeScreen = width >= themeBase.breakpoints.tablet;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, flexDirection: isLargeScreen ? 'row' : 'column' }}>
      {isLargeScreen && <Sidebar />}
      
      <View style={{ flex: 1 }}>
        <Tabs 
          tabBar={props => isLargeScreen ? <View style={{display:'none'}} /> : <CustomTabBar {...props} />} 
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="social" />
          <Tabs.Screen name="exercises" />
          <Tabs.Screen name="profile" />
          <Tabs.Screen name="settings" />
        </Tabs>
      </View>
    </View>
  );
}

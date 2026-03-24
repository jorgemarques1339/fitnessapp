import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, User, Settings as SettingsIcon, Dumbbell, Users } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { themeBase } from '../../theme/theme';
import { useRouter, usePathname } from 'expo-router';
import AnimatedPressable from './AnimatedPressable';

export default function Sidebar() {
  const theme = useAppTheme();
  const router = useRouter();
  const pathname = usePathname();
  
  const navItems = [
    { id: '/', label: 'Início', icon: Home },
    { id: '/social', label: 'Comunidade', icon: Users },
    { id: '/exercises', label: 'Exercícios', icon: Dumbbell },
    { id: '/profile', label: 'Perfil', icon: User },
    { id: '/settings', label: 'Definições', icon: SettingsIcon },
  ] as const;

  return (
    <View style={[styles.container, { borderRightColor: theme.colors.border }]}>
      <BlurView 
        intensity={theme.isDark ? 20 : 40} 
        tint={theme.isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <Text style={[styles.logo, { color: theme.colors.primary }]}>Fitness</Text>
        <Text style={[styles.logoSub, { color: theme.colors.textMuted }]}>ULTRA</Text>
      </View>

      <View style={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.id;
          
          return (
            <AnimatedPressable
              key={item.id}
              onPress={() => router.push(item.id)}
              style={[
                styles.navItem,
                isActive && { backgroundColor: theme.colors.surfaceHighlight }
              ]}
              scaleTo={0.98}
            >
              <Icon 
                size={22} 
                color={isActive ? theme.colors.primary : theme.colors.textMuted} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text style={[
                styles.navLabel,
                { color: isActive ? theme.colors.textPrimary : theme.colors.textMuted }
              ]}>
                {item.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.version, { color: theme.colors.textMuted }]}>v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: themeBase.layout.sidebarWidth,
    height: '100%',
    borderRightWidth: 1,
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  logo: {
    fontSize: 24,
    fontFamily: 'Outfit-Black',
    letterSpacing: -1,
  },
  logoSub: {
    fontSize: 10,
    fontFamily: 'Inter-Black',
    letterSpacing: 2,
    marginTop: -4,
  },
  nav: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  navLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    padding: 24,
  },
  version: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  }
});

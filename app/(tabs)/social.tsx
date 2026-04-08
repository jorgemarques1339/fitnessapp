import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { themeBase } from '../../src/theme/theme';
import { BlurView } from 'expo-blur';
import SocialFeed from '../../src/components/SocialFeed';
import Leaderboard from '../../src/components/Leaderboard';
import DuelModal from '../../src/components/DuelModal';
import LivingBackground from '../../src/components/common/LivingBackground';

export default function SocialScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard'>('feed');
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const contentMaxWidth = 600;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LivingBackground />
      <View style={[
        styles.innerContainer,
        isLargeScreen && { alignSelf: 'center', width: '100%', maxWidth: contentMaxWidth, borderLeftWidth: 1, borderRightWidth: 1, borderColor: theme.colors.border }
      ]}>
        {/* Header with Glassmorphism */}
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 20) }]}>
          <BlurView intensity={theme.isDark ? 30 : 60} tint={theme.isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Comunidade</Text>
            
            <View style={[styles.segmentControl, { backgroundColor: theme.colors.surfaceHighlight }]}>
              <TouchableOpacity 
                onPress={() => setActiveTab('feed')}
                style={[
                  styles.segmentButton, 
                  activeTab === 'feed' && { backgroundColor: theme.colors.primary }
                ]}
              >
                <Text style={[
                  styles.segmentText, 
                  { color: activeTab === 'feed' ? '#000' : theme.colors.textMuted }
                ]}>Feed</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setActiveTab('leaderboard')}
                style={[
                  styles.segmentButton, 
                  activeTab === 'leaderboard' && { backgroundColor: theme.colors.primary }
                ]}
              >
                <Text style={[
                  styles.segmentText, 
                  { color: activeTab === 'leaderboard' ? '#000' : theme.colors.textMuted }
                ]}>Leaderboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {activeTab === 'feed' ? <SocialFeed /> : <Leaderboard />}
        </View>
        
        <DuelModal />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    position: 'relative',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Outfit-Bold',
    letterSpacing: -0.5,
  },
  segmentControl: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  }
});

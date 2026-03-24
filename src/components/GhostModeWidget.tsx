import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ghost, Trophy, TrendingUp } from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolate
} from 'react-native-reanimated';
import { useAppTheme } from '../hooks/useAppTheme';
import { CompletedWorkout } from '../store/types';
import { getWorkoutsForWeek } from '../utils/weeklyStats';
import PremiumCard from './common/PremiumCard';

interface GhostModeWidgetProps {
  completedWorkouts: CompletedWorkout[];
}

export default function GhostModeWidget({ completedWorkouts }: GhostModeWidgetProps) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const thisWeek = useMemo(() => getWorkoutsForWeek(completedWorkouts, 0), [completedWorkouts]);
  const lastWeek = useMemo(() => getWorkoutsForWeek(completedWorkouts, 1), [completedWorkouts]);

  const thisVolume = useMemo(() => thisWeek.reduce((s, w) => s + (w.totalTonnageKg || 0), 0), [thisWeek]);
  const lastVolume = useMemo(() => lastWeek.reduce((s, w) => s + (w.totalTonnageKg || 0), 0), [lastWeek]);

  const progress = lastVolume > 0 ? thisVolume / lastVolume : 1;
  const isAhead = thisVolume > lastVolume;
  const delta = Math.abs(thisVolume - lastVolume);

  // Animation values
  const currentPos = useSharedValue(0);
  const ghostPos = useSharedValue(0);

  useEffect(() => {
    currentPos.value = withSpring(Math.min(progress, 1.1), { damping: 15 });
    ghostPos.value = withSpring(1, { damping: 20 });
  }, [progress]);

  const currentAnimStyle = useAnimatedStyle(() => ({
    left: `${Math.min(currentPos.value * 80, 90)}%`,
  }));

  const ghostAnimStyle = useAnimatedStyle(() => ({
    left: `80%`, // The ghost represents the target (last week)
    opacity: 0.4,
  }));

  if (lastWeek.length === 0 && thisWeek.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.springify()}>
      <PremiumCard style={styles.container} glow={isAhead} variant={isAhead ? 'primary' : 'default'}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ghost color={isAhead ? theme.colors.primary : theme.colors.textMuted} size={20} />
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Modo Ghost</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: isAhead ? 'rgba(0,230,118,0.1)' : 'rgba(255,255,255,0.05)' }]}>
            <Text style={[styles.badgeText, { color: isAhead ? theme.colors.primary : theme.colors.textSecondary }]}>
              {isAhead ? 'À FRENTE' : 'EM PERSEGUIÇÃO'}
            </Text>
          </View>
        </View>

        <View style={styles.trackContainer}>
          <View style={[styles.track, { backgroundColor: theme.colors.surfaceHighlight }]}>
            {/* Target Line for Ghost */}
            <View style={[styles.targetLine, { backgroundColor: theme.colors.border }]} />
            
            {/* Ghost Marker */}
            <Animated.View style={[styles.marker, ghostAnimStyle]}>
              <Ghost color={theme.colors.textMuted} size={16} />
              <Text style={[styles.markerLabel, { color: theme.colors.textMuted }]}>Passado</Text>
            </Animated.View>

            {/* Current Marker */}
            <Animated.View style={[styles.marker, currentAnimStyle, styles.activeMarker]}>
              <Trophy color={theme.colors.primary} size={18} />
              <Text style={[styles.markerLabel, { color: theme.colors.primary }]}>Tu</Text>
            </Animated.View>
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={[styles.volumeValue, { color: theme.colors.textPrimary }]}>
              {Math.round(thisVolume / 100) / 10}t
            </Text>
            <Text style={[styles.volumeLabel, { color: theme.colors.textMuted }]}>Volume Atual</Text>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.messageCol}>
            <Text style={[styles.message, { color: isAhead ? theme.colors.primary : theme.colors.textSecondary }]}>
              {isAhead 
                ? `Superaste o fantasma por ${Math.round(delta)}kg! 🔥`
                : `Faltam ${Math.round(delta)}kg para venceres! 🏃‍♂️`
              }
            </Text>
          </View>
        </View>
      </PremiumCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  trackContainer: {
    height: 60,
    justifyContent: 'center',
    marginBottom: 16,
  },
  track: {
    height: 4,
    borderRadius: 2,
    position: 'relative',
    width: '100%',
  },
  targetLine: {
    position: 'absolute',
    left: '80%',
    top: -10,
    bottom: -10,
    width: 1,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  marker: {
    position: 'absolute',
    top: -28,
    alignItems: 'center',
    width: 60,
    marginLeft: -30,
  },
  activeMarker: {
    zIndex: 10,
  },
  markerLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  volumeValue: {
    fontSize: 20,
    fontFamily: 'Outfit-Bold',
  },
  volumeLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    textTransform: 'uppercase',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 15,
  },
  activeTabItem: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  messageCol: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'right',
  }
});

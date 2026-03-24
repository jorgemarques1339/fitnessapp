import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useAnimatedStyle, withSpring, withRepeat, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';
import { Zap, Timer, Trophy } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import PremiumCard from './common/PremiumCard';
import { DualChallenge } from '../store/useSocialStore';

interface Props {
  duel: DualChallenge;
}

export default function EliteDuelWidget({ duel }: Props) {
  const theme = useAppTheme();
  
  const totalTonnage = duel.myTonnage + duel.opponentTonnage;
  const myRatio = totalTonnage > 0 ? duel.myTonnage / totalTonnage : 0.5;
  const opponentRatio = 1 - myRatio;

  const pulse = useSharedValue(1);
  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const vsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const getTimeRemaining = () => {
    const end = new Date(duel.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 'Terminado';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h restantes`;
  };

  return (
    <Animated.View entering={FadeInDown.springify()}>
      <PremiumCard variant="ghost" style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Zap size={18} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Guerra de Tonelagem 1v1</Text>
          </View>
          <View style={styles.timerRow}>
            <Timer size={12} color={theme.colors.textMuted} />
            <Text style={[styles.timerText, { color: theme.colors.textMuted }]}>{getTimeRemaining()}</Text>
          </View>
        </View>

        <View style={styles.duelRow}>
          {/* My Side */}
          <View style={styles.athleteSide}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=my-user-id' }} style={[styles.avatar, { borderColor: theme.colors.primary }]} />
            <Text style={[styles.name, { color: theme.colors.textPrimary }]}>Tu</Text>
            <Text style={[styles.tonnage, { color: theme.colors.primary }]}>{duel.myTonnage.toLocaleString()} kg</Text>
          </View>

          {/* VS Center */}
          <Animated.View style={[styles.vsContainer, vsStyle]}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.accent]}
              style={styles.vsBadge}
            >
              <Text style={styles.vsText}>VS</Text>
            </LinearGradient>
          </Animated.View>

          {/* Opponent Side */}
          <View style={styles.athleteSide}>
            <Image source={{ uri: duel.opponentAvatar }} style={[styles.avatar, { borderColor: theme.colors.accent }]} />
            <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{duel.opponentName}</Text>
            <Text style={[styles.tonnage, { color: theme.colors.accent }]}>{duel.opponentTonnage.toLocaleString()} kg</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBase}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  flex: myRatio, 
                  backgroundColor: theme.colors.primary,
                  borderTopLeftRadius: 4,
                  borderBottomLeftRadius: 4,
                }
              ]} 
            />
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  flex: opponentRatio, 
                  backgroundColor: theme.colors.accent,
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                }
              ]} 
            />
          </View>
          <View style={styles.ratioLabels}>
            <Text style={styles.ratioText}>{Math.round(myRatio * 100)}%</Text>
            <Text style={styles.ratioText}>{Math.round(opponentRatio * 100)}%</Text>
          </View>
        </View>

        {duel.myTonnage > duel.opponentTonnage ? (
          <View style={[styles.statusBanner, { backgroundColor: 'rgba(0, 230, 118, 0.1)' }]}>
            <Trophy size={14} color={theme.colors.primary} />
            <Text style={[styles.statusText, { color: theme.colors.primary }]}>Estás a ganhar! Mantém a pressão.</Text>
          </View>
        ) : (
          <View style={[styles.statusBanner, { backgroundColor: 'rgba(255, 107, 53, 0.1)' }]}>
            <Timer size={14} color={theme.colors.accent} />
            <Text style={[styles.statusText, { color: theme.colors.accent }]}>Estás em desvantagem. Mais uma série!</Text>
          </View>
        )}
      </PremiumCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Outfit-Bold',
    letterSpacing: 0.5,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  duelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  athleteSide: {
    alignItems: 'center',
    width: '35%',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    marginBottom: 8,
  },
  name: {
    fontSize: 12,
    fontFamily: 'Outfit-Bold',
    marginBottom: 2,
  },
  tonnage: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  vsContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  vsText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'Outfit-Bold',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBase: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  ratioLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  ratioText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: 'rgba(255,255,255,0.4)',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  }
});

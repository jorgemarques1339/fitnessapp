import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Trophy, TrendingUp, Medal, Zap } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useSocialStore } from '../store/useSocialStore';
import { sensoryManager } from '../utils/SensoryManager';
import PremiumCard from './common/PremiumCard';

const LEADERS = [
  { id: '1', name: 'Ricardo G.', volume: '45.2k', rank: 1, avatar: 'https://i.pravatar.cc/150?u=ricardo' },
  { id: '2', name: 'Ana Silva', volume: '38.1k', rank: 2, avatar: 'https://i.pravatar.cc/150?u=ana' },
  { id: '3', name: 'Wolfi (Tu)', volume: '32.5k', rank: 3, avatar: 'https://i.pravatar.cc/150?u=wolfi' },
];

export default function HallOfFame() {
  const theme = useAppTheme();
  const leaderboard = useSocialStore(state => state.leaderboard);
  const startDuel = useSocialStore(state => state.startDuel);
  const activeDuels = useSocialStore(state => state.activeDuels);

  const isUserChallenged = (userId: string) => {
    return activeDuels.some(d => d.opponentId === userId && d.status === 'active');
  };

  return (
    <PremiumCard style={styles.container}>
      <View style={styles.header}>
        <Trophy color={theme.colors.primary} size={20} />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Hall of Fame Semanal</Text>
      </View>

      <View style={styles.list}>
        {leaderboard.map((item, index) => (
          <View key={item.userId} style={[styles.leaderRow, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.left}>
              <View style={styles.rankContainer}>
                {index === 0 ? (
                  <Medal color="#FFD700" size={24} />
                ) : index === 1 ? (
                  <Medal color="#C0C0C0" size={22} />
                ) : (
                  <Medal color="#CD7F32" size={20} />
                )}
              </View>
              <View style={styles.entryMain}>
                <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
                <View>
                  <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{item.userName}</Text>
                  <View style={styles.tonnageRow}>
                    <TrendingUp size={12} color={theme.colors.textMuted} />
                    <Text style={[styles.tonnage, { color: theme.colors.textMuted }]}>{item.value.toLocaleString()} kg</Text>
                  </View>
                </View>
              </View>
            </View>
          
            {item.userId !== 'my-user-id' && (
              <TouchableOpacity 
                onPress={() => {
                  if (!isUserChallenged(item.userId)) {
                    sensoryManager.trigger({ sound: 'click', haptic: 'selection' });
                    startDuel(item);
                  }
                }}
                style={[
                  styles.challengeBtn, 
                  { 
                    backgroundColor: isUserChallenged(item.userId) ? 'transparent' : 'rgba(0, 230, 118, 0.1)',
                    borderColor: isUserChallenged(item.userId) ? theme.colors.border : 'transparent',
                    borderWidth: isUserChallenged(item.userId) ? 1 : 0
                  }
                ]}
                disabled={isUserChallenged(item.userId)}
              >
                {isUserChallenged(item.userId) ? (
                  <Text style={[styles.challengeBtnText, { color: theme.colors.textMuted }]}>Duelando</Text>
                ) : (
                  <>
                    <Zap size={12} color={theme.colors.primary} />
                    <Text style={[styles.challengeBtnText, { color: theme.colors.primary }]}>Desafiar</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </PremiumCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
  },
  list: {
    gap: 2,
  },
  leaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankContainer: {
    width: 24,
    alignItems: 'center',
  },
  entryMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
  },
  name: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  volume: {
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
  },
  unit: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  tonnageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tonnage: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  challengeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  challengeBtnText: {
    fontSize: 11,
    fontFamily: 'Outfit-Bold',
  }
});

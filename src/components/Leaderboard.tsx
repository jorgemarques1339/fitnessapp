import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useSocialStore, LeaderboardEntry } from '../store/useSocialStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { Trophy, Medal, Zap, Crown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Leaderboard() {
  const { leaderboard, currentUserProfile, setSelectedDuelUser } = useSocialStore();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const sorted = [...leaderboard].sort((a, b) => b.value - a.value);
  const top3 = sorted.slice(0, 3);
  const remaining = sorted.slice(3);

  const meRankIndex = sorted.findIndex(l => l.userId === currentUserProfile.id);
  const myEntry = sorted[meRankIndex];

  const renderItem = ({ item, index }: { item: LeaderboardEntry, index: number }) => {
    const isMe = item.userId === currentUserProfile.id;
    const realIndex = index + 3; // Shifted by top 3
    
    return (
      <View style={[
        styles.row, 
        { 
          backgroundColor: isMe ? theme.colors.surfaceHighlight : theme.colors.surface,
          borderColor: isMe ? theme.colors.primary : theme.colors.border,
          borderWidth: isMe ? 1 : 1
        }
      ]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rankNumber, { color: theme.colors.textMuted }]}>{realIndex + 1}</Text>
        </View>
        
        <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
        
        <View style={styles.nameContainer}>
          <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{item.userName}</Text>
          {isMe && <Text style={[styles.meBadge, { color: theme.colors.primary }]}>You</Text>}
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: theme.colors.textPrimary }]}>{(item.value / 1000).toFixed(1)}k</Text>
          <Text style={[styles.scoreLabel, { color: theme.colors.textMuted }]}>kg lifted</Text>
        </View>

        {!isMe && (
          <TouchableOpacity 
            style={[styles.duelBtn, { backgroundColor: theme.colors.surfaceHighlight }]}
            onPress={() => setSelectedDuelUser(item)}
          >
            <Zap size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={remaining}
        keyExtractor={item => item.userId}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.iconFrame, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
              <Trophy size={32} color="#FFD700" />
            </View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Ranking Global</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Top Toneladas movidas</Text>

            {/* Pódio Top 3 */}
            {top3.length >= 3 && (
              <View style={styles.podiumContainer}>
                <PodiumStep pos={2} user={top3[1]} theme={theme} color="#C0C0C0" height={90} />
                <PodiumStep pos={1} user={top3[0]} theme={theme} color="#FFD700" height={130} />
                <PodiumStep pos={3} user={top3[2]} theme={theme} color="#CD7F32" height={70} />
              </View>
            )}
          </View>
        }
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      />

      {/* Fixated "You" bar at the bottom if user goes outside top viewport or just generally */}
      {myEntry && (
        <View style={[styles.floatingMeBar, { backgroundColor: theme.colors.surfaceHighlight, borderTopColor: theme.colors.primary, bottom: insets.bottom + 65 }]}>
          <View style={styles.rankContainer}>
            <Text style={[styles.rankNumber, { color: theme.colors.primary }]}>{meRankIndex + 1}</Text>
          </View>
          <Image source={{ uri: myEntry.userAvatar }} style={styles.avatar} />
          <View style={styles.nameContainer}>
            <Text style={[styles.name, { color: theme.colors.textPrimary }]}>A tua Posição</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={[styles.score, { color: theme.colors.textPrimary }]}>{(myEntry.value / 1000).toFixed(1)}k</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function PodiumStep({ pos, user, theme, color, height }: any) {
  const isMe = user?.userId === 'my-user-id'; // using mock id comparison
  return (
    <View style={styles.podiumStepWrapper}>
      {pos === 1 && <Crown size={20} color={color} style={{ marginBottom: 4 }} />}
      <Image source={{ uri: user.userAvatar }} style={[styles.podiumAvatar, { borderColor: color, borderWidth: pos === 1 ? 3 : 2 }]} />
      <Text style={[styles.podiumName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
        {user.userName.split(' ')[0]}
      </Text>
      <Text style={[styles.podiumScore, { color: color }]}>{(user.value / 1000).toFixed(1)}k</Text>
      
      <View style={[styles.podiumBase, { height, backgroundColor: `${color}20`, borderTopColor: color }]}>
         <Text style={[styles.podiumRank, { color: color }]}>{pos}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 110, // Top bar adjustment 
    paddingBottom: 24,
    gap: 8,
  },
  iconFrame: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Outfit-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
    height: 250,
  },
  podiumStepWrapper: {
    alignItems: 'center',
    width: 90,
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  podiumName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    marginBottom: 2,
    textAlign: 'center',
  },
  podiumScore: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    marginBottom: 8,
  },
  podiumBase: {
    width: '100%',
    borderTopWidth: 2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRank: {
    fontSize: 32,
    fontFamily: 'Outfit-Bold',
    opacity: 0.5,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  meBadge: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  duelBtn: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 4,
  },
  floatingMeBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    borderTopWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  }
});

import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useSocialStore, LeaderboardEntry } from '../store/useSocialStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { Trophy, Medal, Zap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Leaderboard() {
  const { leaderboard, currentUserProfile, setSelectedDuelUser } = useSocialStore();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  // sort descending
  const sorted = [...leaderboard].sort((a, b) => b.value - a.value);

  const renderItem = ({ item, index }: { item: LeaderboardEntry, index: number }) => {
    const isMe = item.userId === currentUserProfile.id;
    
    let rankColor = theme.colors.textMuted;
    if (index === 0) rankColor = '#FFD700'; // Gold
    if (index === 1) rankColor = '#C0C0C0'; // Silver
    if (index === 2) rankColor = '#CD7F32'; // Bronze

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
          {index < 3 ? (
            <Medal size={24} color={rankColor} />
          ) : (
            <Text style={[styles.rankNumber, { color: theme.colors.textMuted }]}>{index + 1}</Text>
          )}
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
      <View style={styles.header}>
        <View style={[styles.iconFrame, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
          <Trophy size={32} color="#FFD700" />
        </View>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Tonnage Leaderboard</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>All Time • Friends</Text>
      </View>
      
      <FlatList
        data={sorted}
        keyExtractor={item => item.userId}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 130, // to account for the top bar
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
    backgroundColor: 'rgba(204, 255, 0, 0.1)', // assumption based on primary color
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
  }
});

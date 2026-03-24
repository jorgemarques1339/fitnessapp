import { View, StyleSheet, FlatList, ListRenderItem, Image, Text } from 'react-native';
import { useSocialStore, SocialPost } from '../store/useSocialStore';
import WorkoutPostCard from './WorkoutPostCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import ChallengesSection from './ChallengesSection';

export default function SocialFeed() {
  const { posts, toggleLike, addComment, currentUserProfile } = useSocialStore();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const renderItem: ListRenderItem<SocialPost> = ({ item }) => (
    <WorkoutPostCard 
      post={item} 
      currentUserId={currentUserProfile.id}
      onToggleLike={() => toggleLike(item.id)}
      onComment={(text: string) => addComment(item.id, text)}
    />
  );

  const renderLiveFriend = ({ item }: { item: typeof LEADERS[0] }) => (
    <View style={styles.liveFriend}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={[styles.liveIndicator, { backgroundColor: '#00E676' }]} />
      </View>
      <Text style={[styles.liveName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            <View style={styles.liveNowSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Treinando Agora</Text>
              <FlatList
                horizontal
                data={LEADERS}
                renderItem={renderLiveFriend}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.liveList}
              />
            </View>
            <ChallengesSection />
          </>
        }
        contentContainerStyle={[styles.listContent, { paddingTop: 130, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const LEADERS = [
  { id: '1', name: 'Alex Silva', avatar: 'https://i.pravatar.cc/150?u=alex' },
  { id: '2', name: 'Maria C.', avatar: 'https://i.pravatar.cc/150?u=maria' },
  { id: '3', name: 'João S.', avatar: 'https://i.pravatar.cc/150?u=joao' },
  { id: '4', name: 'Vítor F.', avatar: 'https://i.pravatar.cc/150?u=vitor' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  liveNowSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  liveList: {
    gap: 15,
    paddingLeft: 4,
  },
  liveFriend: {
    alignItems: 'center',
    width: 60,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00E676',
  },
  liveIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000',
  },
  liveName: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  }
});

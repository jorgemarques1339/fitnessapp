import { View, StyleSheet, FlatList, ListRenderItem, Image, Text, Dimensions, TouchableOpacity } from 'react-native';
import { useSocialStore, SocialPost } from '../store/useSocialStore';
import WorkoutPostCard from './WorkoutPostCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { useState } from 'react';
import ChallengesSection from './ChallengesSection';
import LiveWorkoutViewerModal from './LiveWorkoutViewerModal';
import { Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SocialFeed() {
  const { posts, toggleLike, addComment, currentUserProfile } = useSocialStore();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [liveViewerUser, setLiveViewerUser] = useState<any>(null);

  const renderItem: ListRenderItem<SocialPost> = ({ item }) => (
    <WorkoutPostCard 
      post={item} 
      currentUserId={currentUserProfile.id}
      onToggleLike={() => toggleLike(item.id)}
      onComment={(text: string) => addComment(item.id, text)}
    />
  );

  const renderStory = ({ item, index }: { item: typeof LEADERS[0] | any, index: number }) => {
    const isMe = index === 0;
    return (
      <TouchableOpacity style={styles.storyContainer} onPress={() => setLiveViewerUser(item)}>
        <View style={[styles.avatarRing, { borderColor: isMe ? theme.colors.border : theme.colors.primary }]}>
          <Image source={{ uri: item.avatar }} style={styles.storyAvatar} />
          {isMe && (
            <View style={[styles.addStoryIcon, { backgroundColor: theme.colors.primary }]}>
              <Plus size={12} color="#000" />
            </View>
          )}
        </View>
        <Text style={[styles.storyName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {isMe ? 'Seu Story' : item.name.split(' ')[0]}
        </Text>
      </TouchableOpacity>
    );
  };

  const storiesData = [
    { id: 'me', name: currentUserProfile.name, avatar: currentUserProfile.avatar },
    ...LEADERS
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            <View style={styles.storiesSection}>
              <FlatList
                horizontal
                data={storiesData}
                renderItem={renderStory}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.storiesList}
              />
            </View>
          </>
        }
        // Remove horizontal padding to allow full-bleed images in cards
        contentContainerStyle={[styles.listContent, { paddingTop: 130, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />

      <LiveWorkoutViewerModal 
        visible={!!liveViewerUser} 
        onClose={() => setLiveViewerUser(null)} 
        user={liveViewerUser} 
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
    // 0 horizontal padding makes the card width equal to screen width
    paddingHorizontal: 0,
  },
  storiesSection: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 10,
  },
  storiesList: {
    gap: 16,
    paddingHorizontal: 16,
  },
  storyContainer: {
    alignItems: 'center',
    width: 68,
  },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  addStoryIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000', // matches background typically
  },
  storyName: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  }
});

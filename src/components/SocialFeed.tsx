import React from 'react';
import { View, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { useSocialStore, SocialPost } from '../store/useSocialStore';
import WorkoutPostCard from './WorkoutPostCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';

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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingTop: 130, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 16,
  }
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, Share2, Award, Clock, Dumbbell } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { SocialPost } from '../store/useSocialStore';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import CommentsModal from './CommentsModal';

interface Props {
  post: SocialPost;
  currentUserId: string;
  onToggleLike: () => void;
  onComment: (text: string) => void;
}

const formatDuration = (ms: number) => {
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
};

const timeAgo = (isoString: string) => {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

export default function WorkoutPostCard({ post, currentUserId, onToggleLike, onComment }: Props) {
  const theme = useAppTheme();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const scale = useSharedValue(1);
  
  const hasLiked = post.likes.includes(currentUserId);

  const handleLike = () => {
    scale.value = withSpring(1.3, {}, () => {
      scale.value = withSpring(1);
    });
    onToggleLike();
  };

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
        <View style={styles.headerTextInfo}>
          <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>{post.userName}</Text>
          <Text style={[styles.timeAgo, { color: theme.colors.textMuted }]}>{timeAgo(post.timestamp)} • Terminou um treino</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.workoutTitle, { color: theme.colors.textPrimary }]}>{post.workoutTitle}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Clock size={16} color={theme.colors.textMuted} />
            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{formatDuration(post.durationMs)}</Text>
          </View>
          <View style={styles.statItem}>
            <Dumbbell size={16} color={theme.colors.textMuted} />
            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{(post.tonnageKg / 1000).toFixed(1)}k kg</Text>
          </View>
          {post.personalRecords > 0 && (
            <View style={styles.statItem}>
              <Award size={16} color="#FFD700" />
              <Text style={[styles.statValue, { color: '#FFD700' }]}>{post.personalRecords} PRs</Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Animated.View style={animatedHeartStyle}>
            <Heart 
              size={20} 
              color={hasLiked ? theme.colors.danger : theme.colors.textMuted} 
              fill={hasLiked ? theme.colors.danger : 'transparent'} 
            />
          </Animated.View>
          <Text style={[styles.actionText, { color: hasLiked ? theme.colors.danger : theme.colors.textMuted }]}>
            {post.likes.length > 0 ? post.likes.length : 'Like'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => setIsCommentsOpen(true)}>
          <MessageCircle size={20} color={theme.colors.textMuted} />
          <Text style={[styles.actionText, { color: theme.colors.textMuted }]}>
            {post.comments.length > 0 ? post.comments.length : 'Comentar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <CommentsModal 
        visible={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        post={post}
        onComment={onComment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  headerTextInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  content: {
    gap: 12,
  },
  workoutTitle: {
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  actions: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  }
});

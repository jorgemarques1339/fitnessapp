import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MessageCircle, Share2, Award, Clock, Dumbbell, Zap as Punch, MoreHorizontal, Copy } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { SocialPost } from '../store/useSocialStore';
import Animated, { useAnimatedStyle, withSpring, withSequence, withDelay, useSharedValue, runOnJS, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import CommentsModal from './CommentsModal';
import { LinearGradient } from 'expo-linear-gradient';
import MuscleHeatmap from './MuscleHeatmap';
import { useAllExercises } from '../utils/exerciseSelectors';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useRouter } from 'expo-router';

interface Props {
  post: SocialPost;
  currentUserId: string;
  onToggleLike: () => void;
  onComment: (text: string) => void;
}

// format functions

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
  const router = useRouter();
  const ALLEX = useAllExercises();
  const startWorkout = useWorkoutStore(state => state.startWorkout);

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const scale = useSharedValue(1);
  const bigPunchScale = useSharedValue(0);
  const bigPunchOpacity = useSharedValue(0);
  
  const hasLiked = post.likes.includes(currentUserId);

  const handleStealRoutine = () => {
    if (!post.completedWorkout) return;
    const routineExercises = post.completedWorkout.exerciseLogs.map(log => {
      const dbEx = ALLEX.find(e => e.id === log.exerciseId);
      if (dbEx) {
        return { ...dbEx, targetSets: log.sets.length };
      }
      return null;
    }).filter(Boolean);

    startWorkout({
      id: `stolen-${Date.now()}`,
      title: `Copiado: ${post.workoutTitle}`,
      subtitle: `Rotina copiada da comunidade por ${post.userName}`,
      exercises: routineExercises as any
    });
    
    router.replace('/');
  };

  const handleLike = useCallback(() => {
    scale.value = withSequence(
      withSpring(1.3),
      withSpring(1)
    );
    onToggleLike();
  }, [onToggleLike, scale]);

  const handleDoubleTapLike = useCallback(() => {
    if (!hasLiked) {
      onToggleLike();
    }
    bigPunchOpacity.value = 1;
    bigPunchScale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withDelay(400, withTiming(0, { duration: 300 }))
    );
    setTimeout(() => {
      bigPunchOpacity.value = 0;
    }, 800);
  }, [hasLiked, onToggleLike, bigPunchScale, bigPunchOpacity]);

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      runOnJS(handleDoubleTapLike)();
    });

  const animatedActionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const animatedBigPunchStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bigPunchScale.value }],
    opacity: bigPunchOpacity.value,
  }));

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
      {/* IG Style Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
          <View>
            <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>{post.userName}</Text>
            <Text style={[styles.timeAgo, { color: theme.colors.textMuted }]}>{post.workoutTitle} • {timeAgo(post.timestamp)}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <MoreHorizontal size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Media Content with Double Tap & Carousel */}
      <View style={styles.mediaContainer} onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {/* Slide 1: Image / Double Tap / Stats */}
          <GestureDetector gesture={doubleTapGesture}>
            <View style={{ width: containerWidth || '100%', height: '100%' }}>
              {post.type === 'challenge_badge' ? (
                <LinearGradient
                  colors={['#FFD700', '#DAA520', '#B8860B']}
                  style={[styles.mediaFallback, { justifyContent: 'center', alignItems: 'center' }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Award size={80} color="#FFF" style={{ marginBottom: 16 }} />
                  <Text style={{ color: '#FFF', fontFamily: 'Outfit-Bold', fontSize: 24, textAlign: 'center', paddingHorizontal: 20 }}>
                    CONQUISTA DESBLOQUEADA
                  </Text>
                </LinearGradient>
              ) : post.mediaUri ? (
                <Image source={{ uri: post.mediaUri }} style={styles.mediaImage} resizeMode="cover" />
              ) : (
                <LinearGradient
                  colors={theme.colors.gradients.vibrant as [string, string, ...string[]]}
                  style={styles.mediaFallback}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Punch size={48} color="rgba(255,255,255,0.3)" />
                </LinearGradient>
              )}

              {/* Stats Overlay on Image */}
              {(!post.type || post.type === 'workout') && (
                <View style={styles.statsOverlay}>
                  <View style={[styles.statBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <Dumbbell size={14} color="#FFF" />
                    <Text style={styles.statBadgeText}>{(post.tonnageKg / 1000).toFixed(1)}k kg</Text>
                  </View>
                  <View style={[styles.statBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <Clock size={14} color="#FFF" />
                    <Text style={styles.statBadgeText}>{formatDuration(post.durationMs)}</Text>
                  </View>
                  {post.personalRecords > 0 && (
                    <View style={[styles.statBadge, { backgroundColor: 'rgba(255, 215, 0, 0.2)', borderColor: '#FFD700', borderWidth: 1 }]}>
                      <Award size={14} color="#FFD700" />
                      <Text style={[styles.statBadgeText, { color: '#FFD700' }]}>{post.personalRecords} PRs</Text>
                    </View>
                  )}
                </View>
              )}

              {/* VBT Overlay */}
              {post.peakVelocity && (
                <View style={styles.vbtBadge}>
                  <Punch size={12} color="#00E676" />
                  <Text style={[styles.statBadgeText, { color: '#00E676' }]}>{post.peakVelocity.toFixed(2)} m/s</Text>
                </View>
              )}

              {/* Animated Big Punch (Heart) */}
              <Animated.View style={[StyleSheet.absoluteFill, styles.bigPunchContainer, animatedBigPunchStyle]}>
                <Punch size={100} color={theme.colors.primary} fill={theme.colors.primary} />
              </Animated.View>
            </View>
          </GestureDetector>

          {/* Slide 2: Dynamic Muscle Heatmap */}
          {post.completedWorkout && containerWidth > 0 && (
            <View style={{ width: containerWidth, height: '100%', backgroundColor: theme.colors.surfaceHighlight, padding: 16 }}>
              <Text style={[styles.slideTitle, { color: theme.colors.textPrimary }]}>Análise Muscular</Text>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <MuscleHeatmap completedWorkouts={[post.completedWorkout]} />
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.actionLeft}>
          <TouchableOpacity onPress={handleLike} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Animated.View style={animatedActionStyle}>
              <Punch 
                size={28} 
                color={hasLiked ? theme.colors.primary : theme.colors.textPrimary} 
                fill={hasLiked ? theme.colors.primary : 'transparent'} 
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsCommentsOpen(true)}>
            <MessageCircle size={28} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Share2 size={26} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          {post.completedWorkout && (
             <TouchableOpacity style={styles.stealBtn} onPress={handleStealRoutine}>
               <Copy size={16} color={theme.colors.primary} />
               <Text style={[styles.stealBtnText, { color: theme.colors.primary }]}>Roubar</Text>
             </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Likes Count */}
      {post.likes.length > 0 && (
        <View style={styles.likesContainer}>
          <Text style={[styles.likesText, { color: theme.colors.textPrimary }]}>
            {post.likes.length} {post.likes.length === 1 ? 'punch' : 'punches'}
          </Text>
        </View>
      )}

      {/* Caption & Comments */}
      <View style={styles.captionContainer}>
        {post.caption && (
          <Text style={styles.captionText}>
            <Text style={[styles.captionUsername, { color: theme.colors.textPrimary }]}>{post.userName} </Text>
            <Text style={{ color: theme.colors.textPrimary }}>{post.caption}</Text>
          </Text>
        )}
        {post.comments.length > 0 && (
          <TouchableOpacity onPress={() => setIsCommentsOpen(true)} style={styles.viewCommentsBtn}>
            <Text style={[styles.viewCommentsText, { color: theme.colors.textMuted }]}>
              Ver todos os {post.comments.length} comentários
            </Text>
          </TouchableOpacity>
        )}
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
    marginBottom: 20,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 0.8, // 4:5 aspect ratio (Instagram portrait style)
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  vbtBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.3)',
  },
  bigPunchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  likesContainer: {
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  likesText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  captionContainer: {
    paddingHorizontal: 16,
    gap: 4,
  },
  captionUsername: {
    fontFamily: 'Inter-SemiBold',
  },
  captionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  viewCommentsBtn: {
    marginTop: 4,
  },
  viewCommentsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  slideTitle: {
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
    marginBottom: 16,
  },
  stealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto', // Puxar para a direita
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,230,118,0.1)',
  },
  stealBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    textTransform: 'uppercase',
  }
});

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from './storage';

export interface SocialComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface SocialPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  workoutTitle: string;
  tonnageKg: number;
  durationMs: number;
  personalRecords: number; // number of PRs broken
  timestamp: string;
  likes: string[]; // array of userIds who liked
  comments: SocialComment[];
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string;
  value: number; // e.g. Tonnage or PR weight
}

export interface DualChallenge {
  id: string;
  opponentId: string;
  opponentName: string;
  opponentAvatar: string;
  myTonnage: number;
  opponentTonnage: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed';
}

interface SocialState {
  posts: SocialPost[];
  currentUserProfile: {
    id: string;
    name: string;
    avatar: string;
  };
  leaderboard: LeaderboardEntry[];
  
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  addMockPost: () => void;
  createPostFromWorkout: (workout: any) => void;
  
  selectedDuelUser: LeaderboardEntry | null;
  setSelectedDuelUser: (user: LeaderboardEntry | null) => void;
  activeDuels: DualChallenge[];
  startDuel: (user: LeaderboardEntry) => void;
  updateDuelTonnage: (tonnage: number) => void;
  simulateOpponentProgress: () => void;
}

const MOCK_AVATARS = [
  'https://i.pravatar.cc/150?u=a042581f4e29026024d',
  'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  'https://i.pravatar.cc/150?u=a04258114e29026702d',
];

const INITIAL_MOCK_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    userId: 'user-2',
    userName: 'Alex Silva',
    userAvatar: MOCK_AVATARS[0],
    workoutTitle: 'Leg Day Killer',
    tonnageKg: 8500,
    durationMs: 4500000, // 75 mins
    personalRecords: 2,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    likes: [],
    comments: [
      {
        id: 'c-1',
        userId: 'user-3',
        userName: 'Maria Costa',
        userAvatar: MOCK_AVATARS[1],
        text: 'Aquela última série de agachamento foi insana 🔥',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
      }
    ]
  },
  {
    id: 'post-2',
    userId: 'user-3',
    userName: 'Maria Costa',
    userAvatar: MOCK_AVATARS[1],
    workoutTitle: 'Upper Body Power',
    tonnageKg: 6200,
    durationMs: 3600000, // 60 mins
    personalRecords: 0,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    likes: ['my-user-id'],
    comments: []
  },
  {
    id: 'post-3',
    userId: 'user-4',
    userName: 'João Santos',
    userAvatar: MOCK_AVATARS[2],
    workoutTitle: 'Full Body 5x5',
    tonnageKg: 9100,
    durationMs: 5400000, // 90 mins
    personalRecords: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    likes: ['user-2', 'user-3'],
    comments: []
  }
];

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { userId: 'user-4', userName: 'João Santos', userAvatar: MOCK_AVATARS[2], value: 45000 },
  { userId: 'user-2', userName: 'Alex Silva', userAvatar: MOCK_AVATARS[0], value: 42300 },
  { userId: 'my-user-id', userName: 'You (Me)', userAvatar: 'https://i.pravatar.cc/150?u=my-user-id', value: 38000 },
  { userId: 'user-3', userName: 'Maria Costa', userAvatar: MOCK_AVATARS[1], value: 31000 },
];

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      posts: INITIAL_MOCK_POSTS,
      currentUserProfile: {
        id: 'my-user-id',
        name: 'You (Me)',
        avatar: 'https://i.pravatar.cc/150?u=my-user-id'
      },
      leaderboard: INITIAL_LEADERBOARD,

      toggleLike: (postId) => {
        const { posts, currentUserProfile } = get();
        const updatedPosts = posts.map(post => {
          if (post.id === postId) {
            const hasLiked = post.likes.includes(currentUserProfile.id);
            const newLikes = hasLiked
              ? post.likes.filter(id => id !== currentUserProfile.id)
              : [...post.likes, currentUserProfile.id];
            return { ...post, likes: newLikes };
          }
          return post;
        });
        set({ posts: updatedPosts });
      },

      addComment: (postId, text) => {
        const { posts, currentUserProfile } = get();
        if (!text.trim()) return;

        const newComment: SocialComment = {
          id: `comment-${Date.now()}`,
          userId: currentUserProfile.id,
          userName: currentUserProfile.name,
          userAvatar: currentUserProfile.avatar,
          text: text.trim(),
          timestamp: new Date().toISOString()
        };

        const updatedPosts = posts.map(post => {
          if (post.id === postId) {
            return { ...post, comments: [...post.comments, newComment] };
          }
          return post;
        });

        set({ posts: updatedPosts });
      },

      addMockPost: () => {
        const { posts } = get();
        const randIndex = Math.floor(Math.random() * MOCK_AVATARS.length);
        const newPost: SocialPost = {
          id: `post-${Date.now()}`,
          userId: `user-mock`,
          userName: `Gym Bro ${randIndex + 1}`,
          userAvatar: MOCK_AVATARS[randIndex],
          workoutTitle: 'Beast Mode Activated 🦍',
          tonnageKg: Math.floor(Math.random() * 5000) + 3000,
          durationMs: Math.floor(Math.random() * 3600000) + 1800000,
          personalRecords: Math.floor(Math.random() * 3),
          timestamp: new Date().toISOString(),
          likes: [],
          comments: []
        };

        set({ posts: [newPost, ...posts] });
      },

      selectedDuelUser: null,
      setSelectedDuelUser: (user) => set({ selectedDuelUser: user }),

      activeDuels: [],

      startDuel: (user) => {
        const { activeDuels } = get();
        if (activeDuels.some(d => d.opponentId === user.userId)) return;

        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 7);

        const newDuel: DualChallenge = {
          id: `duel-${Date.now()}`,
          opponentId: user.userId,
          opponentName: user.userName,
          opponentAvatar: user.userAvatar,
          myTonnage: 0,
          opponentTonnage: Math.floor(Math.random() * 5000), // Mock opponent progress
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          status: 'active'
        };

        set({ activeDuels: [...activeDuels, newDuel] });
      },

      updateDuelTonnage: (tonnage) => {
        const { activeDuels } = get();
        const updated = activeDuels.map(d => {
          if (d.status === 'active') {
            return { ...d, myTonnage: d.myTonnage + tonnage };
          }
          return d;
        });
        set({ activeDuels: updated });
      },

      simulateOpponentProgress: () => {
        const { activeDuels } = get();
        const updated = activeDuels.map(d => {
          if (d.status === 'active') {
            const extra = Math.floor(Math.random() * 2000) + 500;
            const newOpponentTonnage = d.opponentTonnage + extra;
            
            if (d.myTonnage >= d.opponentTonnage && d.myTonnage < newOpponentTonnage) {
              console.log(`[DUEL] Overtaken by ${d.opponentName}!`);
            }
            
            return { ...d, opponentTonnage: newOpponentTonnage };
          }
          return d;
        });
        set({ activeDuels: updated });
      },

      createPostFromWorkout: (workout: any) => {
        const { posts, currentUserProfile } = get();
        const newPost: SocialPost = {
          id: `post-${Date.now()}`,
          userId: currentUserProfile.id,
          userName: currentUserProfile.name,
          userAvatar: currentUserProfile.avatar,
          workoutTitle: workout.routineTitle,
          tonnageKg: workout.totalTonnageKg,
          durationMs: workout.durationMs,
          personalRecords: 0, 
          timestamp: new Date().toISOString(),
          likes: [],
          comments: []
        };
        set({ posts: [newPost, ...posts] });
      }
    }),
    {
      name: 'social-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from './storage';
import type { CompletedWorkout } from './types';

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
  personalRecords: number;
  timestamp: string;
  likes: string[];
  comments: SocialComment[];
  mediaUri?: string;
  caption?: string;
  completedWorkout?: CompletedWorkout;
  peakVelocity?: number;
  type?: 'workout' | 'duel_event' | 'challenge_badge';
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
  createPostFromWorkout: (workout: any, mediaUri?: string, caption?: string, peakVelocity?: number) => void;
  createDuelPost: (duelEventMsg: string) => void;
  createBadgePost: (badgeTitle: string) => void;
  
  selectedDuelUser: LeaderboardEntry | null;
  setSelectedDuelUser: (user: LeaderboardEntry | null) => void;
  activeDuels: DualChallenge[];
  startDuel: (user: LeaderboardEntry) => void;
  updateDuelTonnage: (tonnage: number) => void;
  simulateOpponentProgress: () => void;
  updateProfile: (name: string, avatar: string) => void;
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
        userId: 'ai-coach',
        userName: 'Antigravity AI',
        userAvatar: 'https://cdn-icons-png.flaticon.com/512/1188/1188151.png',
        text: 'Trabalho insano hoje, Alex! Mais de 8 toneladas movidas. Parecias uma máquina! 🤖🔋',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9).toISOString(),
      },
      {
        id: 'c-2',
        userId: 'user-3',
        userName: 'Maria Costa',
        userAvatar: MOCK_AVATARS[1],
        text: 'Aquela última série de agachamento foi insana 🔥',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
      }
    ],
    mediaUri: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1000&auto=format&fit=crop',
    caption: 'Bati o meu RP no agachamento! As pernas estão mortas, mas o coração está cheio. Vamosssss! 🔥🦵',
    type: 'workout',
    completedWorkout: {
      id: 'mock-w1',
      routineId: 'mock-r1',
      routineTitle: 'Leg Day Killer',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      durationMs: 4500000,
      totalTonnageKg: 8500,
      totalSets: 20,
      exerciseLogs: [
        {
          exerciseId: 'ex-squat',
          exerciseName: 'Agachamento Livre',
          sets: [
            { setNumber: 1, weightKg: '100', reps: '10', rpe: '8', isCompleted: true },
            { setNumber: 2, weightKg: '120', reps: '8', rpe: '9', isCompleted: true },
          ]
        },
        {
          exerciseId: 'ex-legpress',
          exerciseName: 'Leg Press',
          sets: [
            { setNumber: 1, weightKg: '200', reps: '12', rpe: '8', isCompleted: true },
          ]
        }
      ]
    }
  },
  {
    id: 'post-2',
    userId: 'user-3',
    userName: 'Maria Costa',
    userAvatar: MOCK_AVATARS[1],
    workoutTitle: 'Duelo Semanal',
    tonnageKg: 0,
    durationMs: 0,
    personalRecords: 0,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    likes: ['user-2'],
    comments: [],
    caption: 'Maria Costa venceu o duelo épico de volume contra João Santos! 🏆⚔️',
    type: 'duel_event',
    mediaUri: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'post-3',
    userId: 'user-4',
    userName: 'João Santos',
    userAvatar: MOCK_AVATARS[2],
    workoutTitle: 'Força Bruta',
    tonnageKg: 6200,
    durationMs: 3600000, // 60 mins
    personalRecords: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    likes: ['my-user-id', 'user-2'],
    comments: [],
    mediaUri: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000&auto=format&fit=crop',
    caption: 'Velocidade na barra foi top class hoje! Foco total. 💪⚡',
    type: 'workout',
    peakVelocity: 1.12, // VBT Sticker triggering
  },
  {
    id: 'post-4',
    userId: 'user-2',
    userName: 'Alex Silva',
    userAvatar: MOCK_AVATARS[0],
    workoutTitle: 'Nova Conquista',
    tonnageKg: 0,
    durationMs: 0,
    personalRecords: 0,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    likes: ['user-3', 'user-4'],
    comments: [],
    caption: 'Desbloqueei o troféu: Senhor do Agachamento 🥇',
    type: 'challenge_badge'
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

      createPostFromWorkout: (workout: any, mediaUri?: string, caption?: string, peakVelocity?: number) => {
        const { posts, currentUserProfile } = get();
        
        let initialComments: SocialComment[] = [];
        
        if (workout.totalTonnageKg >= 5000) {
           initialComments.push({
             id: `comment-ai-${Date.now()}`,
             userId: 'ai-coach',
             userName: 'Antigravity AI',
             userAvatar: 'https://cdn-icons-png.flaticon.com/512/1188/1188151.png',
             text: `Trabalho insano hoje, ${currentUserProfile.name.split(' ')[0]}! Mais de ${Math.floor(workout.totalTonnageKg/1000)} toneladas movidas. Parecias uma máquina! 🤖🔋`,
             timestamp: new Date().toISOString(),
           })
        }

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
          comments: initialComments,
          mediaUri,
          caption,
          completedWorkout: workout,
          peakVelocity,
          type: 'workout'
        };
        set({ posts: [newPost, ...posts] });
      },

      createDuelPost: (duelEventMsg: string) => {
        const { posts, currentUserProfile } = get();
        const newPost: SocialPost = {
          id: `post-${Date.now()}`,
          userId: currentUserProfile.id,
          userName: currentUserProfile.name,
          userAvatar: currentUserProfile.avatar,
          workoutTitle: 'Duelo',
          tonnageKg: 0,
          durationMs: 0,
          personalRecords: 0,
          timestamp: new Date().toISOString(),
          likes: [],
          comments: [],
          caption: duelEventMsg,
          type: 'duel_event',
          mediaUri: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=1000&auto=format&fit=crop'
        };
        set({ posts: [newPost, ...posts] });
      },

      createBadgePost: (badgeTitle: string) => {
        const { posts, currentUserProfile } = get();
        const newPost: SocialPost = {
          id: `post-${Date.now()}`,
          userId: currentUserProfile.id,
          userName: currentUserProfile.name,
          userAvatar: currentUserProfile.avatar,
          workoutTitle: 'Nova Conquista',
          tonnageKg: 0,
          durationMs: 0,
          personalRecords: 0,
          timestamp: new Date().toISOString(),
          likes: [],
          comments: [],
          caption: `Desbloqueei o troféu: ${badgeTitle} 🥇`,
          type: 'challenge_badge'
        };
        set({ posts: [newPost, ...posts] });
      },

      updateProfile: (name, avatar) => {
        const { currentUserProfile, leaderboard } = get();
        const newProfile = { ...currentUserProfile, name, avatar };
        
        // Sync leaderboard
        const updatedLeaderboard = leaderboard.map(entry => 
          entry.userId === currentUserProfile.id 
            ? { ...entry, userName: name, userAvatar: avatar }
            : entry
        );

        set({ 
          currentUserProfile: newProfile,
          leaderboard: updatedLeaderboard
        });
      }
    }),
    {
      name: 'social-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);

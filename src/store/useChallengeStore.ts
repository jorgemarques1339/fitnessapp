import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from './storage';
import { Challenge, COMMUNITY_CHALLENGES } from '../data/challenges';

interface ChallengeProgress {
  challengeId: string;
  currentValue: number;
  isCompleted: boolean;
  awardedAt?: string;
}

interface ChallengeState {
  activeChallenges: Challenge[];
  userProgress: Record<string, ChallengeProgress>;
  updateProgress: (challengeId: string, value: number) => void;
  checkWorkoutsForProgress: (workouts: any[]) => void;
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      activeChallenges: COMMUNITY_CHALLENGES,
      userProgress: {},

      updateProgress: (challengeId, value) => {
        const { userProgress, activeChallenges } = get();
        const challenge = activeChallenges.find(c => c.id === challengeId);
        if (!challenge) return;

        const currentProg = userProgress[challengeId] || { 
          challengeId, 
          currentValue: 0, 
          isCompleted: false 
        };

        const newValue = currentProg.currentValue + value;
        const isNowCompleted = newValue >= challenge.targetGoal && !currentProg.isCompleted;

        set({
          userProgress: {
            ...userProgress,
            [challengeId]: {
              ...currentProg,
              currentValue: newValue,
              isCompleted: currentProg.isCompleted || isNowCompleted,
              awardedAt: isNowCompleted ? new Date().toISOString() : currentProg.awardedAt
            }
          }
        });
      },

      checkWorkoutsForProgress: (workouts) => {
        // Logic to scan recent workouts and update all relevant challenges
        // This could be called after every finished workout
      }
    }),
    {
      name: 'challenge-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);

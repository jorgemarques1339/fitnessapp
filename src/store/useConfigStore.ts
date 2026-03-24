import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from './storage';

interface ConfigState {
  healthSyncEnabled: boolean;
  setHealthSyncEnabled: (val: boolean) => void;

  themeMode: 'oled' | 'frosted';
  setThemeMode: (mode: 'oled' | 'frosted') => void;

  lastBackupDate: string | null;
  setLastBackupDate: (date: string) => void;

  availablePlates: number[];
  setAvailablePlates: (plates: number[]) => void;

  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  setExperienceLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;

  onboardingCompleted: boolean;
  setOnboardingCompleted: (val: boolean) => void;

  voiceCoachEnabled: boolean;
  setVoiceCoachEnabled: (val: boolean) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      healthSyncEnabled: true,
      setHealthSyncEnabled: (val) => set({ healthSyncEnabled: val }),

      themeMode: 'oled',
      setThemeMode: (mode) => set({ themeMode: mode }),

      lastBackupDate: null,
      setLastBackupDate: (date) => set({ lastBackupDate: date }),

      availablePlates: [25, 20, 15, 10, 5, 2.5, 1.25],
      setAvailablePlates: (plates) => set({ availablePlates: plates }),

      experienceLevel: 'intermediate',
      setExperienceLevel: (level) => set({ experienceLevel: level }),

      onboardingCompleted: false,
      setOnboardingCompleted: (val) => set({ onboardingCompleted: val }),

      voiceCoachEnabled: true,
      setVoiceCoachEnabled: (val) => set({ voiceCoachEnabled: val }),
    }),
    {
      name: 'config-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);

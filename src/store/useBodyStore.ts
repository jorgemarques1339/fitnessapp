import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from './storage';

export interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  waist?: number;
  biceps?: number;
  chest?: number;
  thigh?: number;
  bodyFat?: number;
  frontPhotoUri?: string;
  sidePhotoUri?: string;
  backPhotoUri?: string;
}

interface BodyState {
  measurements: BodyMeasurement[];
  addMeasurement: (m: Omit<BodyMeasurement, 'id' | 'date'>) => void;
  updateMeasurement: (id: string, data: Partial<BodyMeasurement>) => void;
  deleteMeasurement: (id: string) => void;
  getLatestMeasurement: () => BodyMeasurement | null;
  getCorrelationData: (metric: keyof BodyMeasurement) => { date: string; value: number | string }[];
}

export const useBodyStore = create<BodyState>()(
  persist(
    (set, get) => ({
      measurements: [],

      addMeasurement: (m) => {
        const newEntry: BodyMeasurement = {
          ...m,
          id: Date.now().toString(),
          date: new Date().toISOString(),
        };
        set({ measurements: [newEntry, ...get().measurements] });
      },

      updateMeasurement: (id, data) => {
        set({
          measurements: get().measurements.map(m => m.id === id ? { ...m, ...data } : m)
        });
      },

      deleteMeasurement: (id) => {
        set({ measurements: get().measurements.filter(m => m.id !== id) });
      },

      getLatestMeasurement: () => {
        const { measurements } = get();
        return measurements.length > 0 ? measurements[0] : null;
      },

      getCorrelationData: (metric) => {
        return get().measurements
          .filter(m => m[metric] !== undefined)
          .map(m => ({
            date: m.date,
            value: m[metric] as number
          }))
          .reverse();
      }
    }),
    {
      name: 'body-composition-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);

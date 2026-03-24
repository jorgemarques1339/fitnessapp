import { NativeModules, Platform } from 'react-native';

// This is a bridge for the potential Native Module that handles Live Activities.
// In a managed Expo app, this won't work in Expo Go.
// It requires `npx expo prebuild` and a custom development client.

const { LiveActivityModule } = NativeModules;

export interface LiveActivityData {
  exerciseName: string;
  totalSets: number;
  currentSet: number;
  remainingSeconds: number;
  endTime: number; // timestamp
}

export const startRestLiveActivity = (data: LiveActivityData) => {
  if (Platform.OS !== 'ios') return;
  
  if (LiveActivityModule) {
    LiveActivityModule.startActivity(data);
  } else {
    console.warn('LiveActivityModule not found. Make sure you are running in a custom dev client with the appropriate Swift code.');
  }
};

export const updateRestLiveActivity = (seconds: number) => {
  if (Platform.OS !== 'ios') return;
  
  if (LiveActivityModule) {
    LiveActivityModule.updateActivity(seconds);
  }
};

export const endRestLiveActivity = () => {
  if (Platform.OS !== 'ios') return;
  
  if (LiveActivityModule) {
    LiveActivityModule.endActivity();
  }
};

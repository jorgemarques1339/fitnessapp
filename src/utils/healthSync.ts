import { Platform } from 'react-native';
import AppleHealthKit, { HealthKitPermissions, HealthValue } from 'react-native-health';

const permissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.Weight],
    write: [
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
    ],
  },
} as HealthKitPermissions;

export const initHealthKit = () => {
  if (Platform.OS !== 'ios') return;
  
  AppleHealthKit.initHealthKit(permissions, (error: string) => {
    if (error) {
      console.log('[HealthKit] Cannot grant permissions:', error);
    } else {
      console.log('[HealthKit] Permissions granted successfully.');
    }
  });
};

export const saveWorkoutToHealth = (
  title: string,
  calories: number,
  startDate: Date,
  endDate: Date
) => {
  if (Platform.OS !== 'ios') return;

  const options = {
    type: 'TraditionalStrengthTraining', 
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    energyBurned: calories,
    energyBurnedUnit: 'calorie'
  };

  // @ts-ignore - The types in react-native-health for workouts can be strict
  AppleHealthKit.saveWorkout(options, (err: Object, res: any) => {
    if (err) {
      console.log('[HealthKit] Error saving workout: ', err);
      return;
    }
    console.log('[HealthKit] Workout synchronized successfully: ', res);
  });
};

export const getLatestBodyWeight = (callback: (weight: number) => void) => {
  if (Platform.OS !== 'ios') return;
  
  const options = {
    unit: 'kg',
  };

  // @ts-ignore - The react-native-health generic types strictly expect the HealthUnit enum.
  AppleHealthKit.getLatestWeight(options, (err: string, results: HealthValue) => {
    if (err) {
      console.log('[HealthKit] Error fetching weight: ', err);
      return;
    }
    if (results && results.value) {
      callback(results.value);
    }
  });
};

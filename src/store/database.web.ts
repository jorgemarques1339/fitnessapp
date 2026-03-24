import { CompletedWorkout } from './types';

export async function initDatabase() {
  return null;
}

export async function getCompletedWorkoutsFromDB(): Promise<CompletedWorkout[]> {
  return [];
}

export async function saveWorkoutToDB(workout: CompletedWorkout) {
  return;
}

export async function deleteWorkoutFromDB(id: string) {
  return;
}

export async function clearAllWorkoutsFromDB() {
  return;
}

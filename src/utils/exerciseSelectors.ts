import { useMemo } from 'react';
import { EXERCISE_DATABASE, ExerciseDef } from '../data/exercises';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useHistoryStore } from '../store/useHistoryStore';

export const useAllExercises = (): ExerciseDef[] => {
  const customExercises = useHistoryStore(state => state.customExercises);
  return useMemo(() => [...EXERCISE_DATABASE, ...customExercises], [customExercises]);
};

export const getAllExercisesStatic = (): ExerciseDef[] => {
  const customExercises = useHistoryStore.getState().customExercises;
  return [...EXERCISE_DATABASE, ...customExercises];
};

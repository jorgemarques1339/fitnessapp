import { useMemo } from 'react';
import { EXERCISE_DATABASE, ExerciseDef } from '../data/exercises';
import { useWorkoutStore } from '../store/useWorkoutStore';

export const useAllExercises = (): ExerciseDef[] => {
  const customExercises = useWorkoutStore(state => state.customExercises || []);
  return useMemo(() => [...EXERCISE_DATABASE, ...customExercises], [customExercises]);
};

export const getAllExercisesStatic = (): ExerciseDef[] => {
  const customExercises = useWorkoutStore.getState().customExercises || [];
  return [...EXERCISE_DATABASE, ...customExercises];
};

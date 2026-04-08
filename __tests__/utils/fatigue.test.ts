import { calculateMuscleFatigue } from '../../src/utils/fatigue';
import type { CompletedWorkout } from '../../src/store/useWorkoutStore';
import * as exerciseSelectors from '../../src/utils/exerciseSelectors';

jest.mock('../../src/utils/exerciseSelectors', () => ({
  getAllExercisesStatic: jest.fn(),
}));

const mockExercises = [
  { id: 'ex-chest', name: 'Bench Press', category: 'Chest', secondaryMuscles: ['Triceps'] },
  { id: 'ex-back', name: 'Pull Up', category: 'Back', secondaryMuscles: ['Biceps'] },
];

describe('calculateMuscleFatigue', () => {
  beforeEach(() => {
    (exerciseSelectors.getAllExercisesStatic as jest.Mock).mockReturnValue(mockExercises);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initially returns all muscles as Ready and 100% recovered', () => {
    const workouts: CompletedWorkout[] = [];
    const result = calculateMuscleFatigue(workouts);

    result.forEach(muscle => {
      expect(muscle.status).toBe('Ready');
      expect(muscle.recoveryPercent).toBe(100);
      expect(muscle.lastTrained).toBeNull();
    });
  });

  it('applies fatigue correctly matching primary and secondary muscles', () => {
    const now = new Date();
    const workoutDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h ago
    
    const workouts: CompletedWorkout[] = [{
      id: 'mock-1',
      routineId: 'mock-routine',
      date: workoutDate.toISOString(),
      routineTitle: 'Mock Routine',
      totalTonnageKg: 1000,
      totalSets: 3,
      durationMs: 3600000,
      exerciseLogs: [
        {
          exerciseId: 'ex-chest',
          exerciseName: 'Bench Press',
          sets: [
            { setNumber: 1, reps: '10', weightKg: '100', isCompleted: true, rpe: '8' },
            { setNumber: 2, reps: '10', weightKg: '100', isCompleted: true, rpe: '8' },
            { setNumber: 3, reps: '10', weightKg: '100', isCompleted: true, rpe: '9' }
          ]
        }
      ]
    }];

    const result = calculateMuscleFatigue(workouts);
    
    const chest = result.find(m => m.muscle === 'Chest');
    const triceps = result.find(m => m.muscle === 'Triceps');
    const back = result.find(m => m.muscle === 'Back');

    expect(chest?.recoveryPercent).toBeLessThan(100);
    expect(triceps?.recoveryPercent).toBeLessThan(100);
    expect(back?.recoveryPercent).toBe(100); // untouched

    // Primary should be more fatigued than secondary
    expect(chest!.recoveryPercent).toBeLessThan(triceps!.recoveryPercent);
    // Last trained should be updated
    expect(chest!.lastTrained).toEqual(workoutDate);
  });

  it('ignores workouts older than 96 hours', () => {
    const now = new Date();
    const workoutDate = new Date(now.getTime() - 100 * 60 * 60 * 1000); // 100h ago
    
    const workouts: CompletedWorkout[] = [{
      id: 'mock-2',
      routineId: 'mock-routine-2',
      date: workoutDate.toISOString(),
      routineTitle: 'Mock Routine',
      totalTonnageKg: 1000,
      totalSets: 3,
      durationMs: 3600000,
      exerciseLogs: [
        {
          exerciseId: 'ex-chest',
          exerciseName: 'Bench Press',
          sets: [
            { setNumber: 1, reps: '10', weightKg: '100', isCompleted: true, rpe: '10' }
          ]
        }
      ]
    }];

    const result = calculateMuscleFatigue(workouts);
    const chest = result.find(m => m.muscle === 'Chest');
    
    expect(chest?.recoveryPercent).toBe(100); // Should be completely restored/ignored
  });
});

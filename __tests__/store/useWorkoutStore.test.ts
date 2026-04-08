import { renderHook, act } from '@testing-library/react-native';
import { useWorkoutStore } from '../../src/store/useWorkoutStore';
import { RoutineDef } from '../../src/data/routines';

// Mock storage to prevent persist issues
jest.mock('../../src/store/storage', () => ({
  safeStorage: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  }
}));

jest.mock('../../src/store/useHistoryStore', () => ({
    useHistoryStore: {
        getState: () => ({
            addCompletedWorkout: jest.fn(),
            completedWorkouts: []
        })
    }
}));

jest.mock('../../src/store/useSocialStore', () => ({
    useSocialStore: {
        getState: () => ({
            updateDuelTonnage: jest.fn()
        })
    }
}));

jest.mock('../../src/store/useChallengeStore', () => ({
    useChallengeStore: {
        getState: () => ({
            updateProgress: jest.fn()
        })
    }
}));

jest.mock('../../src/store/useConfigStore', () => ({
    useConfigStore: {
        getState: () => ({
            healthSyncEnabled: false
        })
    }
}));

const mockRoutine: RoutineDef = {
    id: 'r-test',
    title: 'Test Routine',
    subtitle: 'Test',
    level: 'beginner',
    exercises: [
        { id: 'ex-1', name: 'Test Ex 1', category: 'Chest' },
        { id: 'ex-2', name: 'Test Ex 2', category: 'Back' }
    ]
};

describe('useWorkoutStore', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    act(() => {
      useWorkoutStore.setState({
        isInLogger: false,
        activeRoutine: null,
        currentExerciseIndex: 0,
        currentExerciseSets: [],
        sessionLogs: [],
        sessionStartTime: null,
        lastCompletedWorkoutId: null,
      });
    });
  });

  it('starts a workout correctly', () => {
    const { result } = renderHook(() => useWorkoutStore());
    
    act(() => {
      result.current.startWorkout(mockRoutine);
    });

    expect(result.current.isInLogger).toBe(true);
    expect(result.current.activeRoutine).toEqual(mockRoutine);
    expect(result.current.currentExerciseIndex).toBe(0);
    expect(result.current.sessionLogs).toEqual([]);
    expect(result.current.sessionStartTime).not.toBeNull();
  });

  it('logs a set correctly', () => {
    const { result } = renderHook(() => useWorkoutStore());
    
    act(() => {
      result.current.startWorkout(mockRoutine);
    });

    act(() => {
      result.current.logSet({
        reps: '10',
        weightKg: '100',
        isCompleted: true
      });
    });

    expect(result.current.currentExerciseSets).toHaveLength(1);
    expect(result.current.currentExerciseSets[0]).toEqual({
      setNumber: 1,
      reps: '10',
      weightKg: '100',
      isCompleted: true
    });
  });

  it('aborts workout cleanly', () => {
    const { result } = renderHook(() => useWorkoutStore());
    
    act(() => {
      result.current.startWorkout(mockRoutine);
      result.current.logSet({ reps: '10', weightKg: '100', isCompleted: true });
    });

    act(() => {
      result.current.abortWorkout();
    });

    expect(result.current.isInLogger).toBe(false);
    expect(result.current.activeRoutine).toBeNull();
    expect(result.current.sessionLogs).toEqual([]);
    expect(result.current.currentExerciseSets).toEqual([]);
  });
});

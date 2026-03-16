import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';

interface UseWorkoutTimerProps {
  onTimerEnd?: () => void;
}

export function useWorkoutTimer({ onTimerEnd }: UseWorkoutTimerProps = {}) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // We store the target absolute timestamp when the timer should end.
  const targetTimeRef = useRef<number | null>(null);
  
  // Track AppState to recalculate timer when returning to foreground
  const appState = useRef(AppState.currentState);

  const startTimer = useCallback((seconds: number) => {
    targetTimeRef.current = Date.now() + seconds * 1000;
    setRemainingSeconds(seconds);
    setIsActive(true);
  }, []);

  const stopTimer = useCallback(() => {
    targetTimeRef.current = null;
    setRemainingSeconds(0);
    setIsActive(false);
  }, []);

  // Recalculate based on target time
  const tick = useCallback(() => {
    if (!targetTimeRef.current) return;

    const now = Date.now();
    const diff = targetTimeRef.current - now;

    if (diff <= 0) {
      // Timer finished
      stopTimer();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (onTimerEnd) {
        onTimerEnd();
      }
    } else {
      setRemainingSeconds(Math.ceil(diff / 1000));
    }
  }, [stopTimer, onTimerEnd]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(tick, 500); // Check twice a second for precision
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, tick]);

  // Handle App sending to background/foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground, force a tick to recalulate immediately
        console.log('App has come to the foreground, recalculating timer');
        if (isActive) {
          tick();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive, tick]);

  return {
    remainingSeconds,
    isActive,
    startTimer,
    stopTimer,
  };
}

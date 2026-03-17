import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

interface UseWorkoutTimerProps {
  onTimerEnd?: () => void;
}

export function useWorkoutTimer({ onTimerEnd }: UseWorkoutTimerProps = {}) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // We store the target absolute timestamp when the timer should end.
  const targetTimeRef = useRef<number | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  
  // Track AppState to recalculate timer when returning to foreground
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    async function requestPermissions() {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
    }
    requestPermissions();
  }, []);

  const startTimer = useCallback(async (seconds: number) => {
    targetTimeRef.current = Date.now() + seconds * 1000;
    setRemainingSeconds(seconds);
    setIsActive(true);

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "💪 Recuperação Terminada",
          body: "O tempo de descanso acabou. Hora de voltar à carga!",
          sound: true,
        },
        trigger: {
          seconds: seconds,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });
      notificationIdRef.current = id;
    } catch (e) {
      console.log('Failed to schedule notification', e);
    }
  }, []);

  const stopTimer = useCallback(async () => {
    targetTimeRef.current = null;
    setRemainingSeconds(0);
    setIsActive(false);

    if (notificationIdRef.current) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
        notificationIdRef.current = null;
      } catch (e) {
        console.log('Failed to cancel notification', e);
      }
    }
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

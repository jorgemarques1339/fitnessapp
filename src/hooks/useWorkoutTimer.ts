import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { startRestLiveActivity, endRestLiveActivity } from '../utils/liveActivities';

interface UseWorkoutTimerProps {
  onTimerEnd?: () => void;
  exerciseName?: string;
  totalSets?: number;
  currentSet?: number;
}

export function useWorkoutTimer({ onTimerEnd, exerciseName, totalSets, currentSet }: UseWorkoutTimerProps = {}) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // We store the target absolute timestamp when the timer should end.
  const targetTimeRef = useRef<number | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  
  // Track AppState to recalculate timer when returning to foreground
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    async function requestPermissions() {
      if (Platform.OS === 'web') return;
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

    if (Platform.OS !== 'web') {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: exerciseName ? `💪 Descanso: ${exerciseName}` : "💪 Descanso Terminado",
            body: "Hora de voltar à carga para a próxima série!",
            sound: true,
            categoryIdentifier: 'REST_TIMER_ALARM',
          },
          trigger: {
            seconds: seconds,
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          },
        });
        notificationIdRef.current = id;

        // Start Live Activity (iOS only)
        startRestLiveActivity({
          exerciseName: exerciseName || 'Exercício',
          totalSets: totalSets || 3,
          currentSet: currentSet || 1,
          remainingSeconds: seconds,
          endTime: Date.now() + seconds * 1000,
        });
      } catch (e) {
        console.log('Failed to schedule notification', e);
      }
    }
  }, [exerciseName, totalSets, currentSet]);

  const stopTimer = useCallback(async () => {
    targetTimeRef.current = null;
    setRemainingSeconds(0);
    setIsActive(false);

    if (notificationIdRef.current && Platform.OS !== 'web') {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
        notificationIdRef.current = null;
      } catch (e) {
        console.log('Failed to cancel notification', e);
      }
    }
    
    // Always end Live Activity to clear the Island
    endRestLiveActivity();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const actionId = response.actionIdentifier;
      if (actionId === 'ADD_30') {
        startTimer(30);
      } else if (actionId === 'DISMISS') {
        stopTimer();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [startTimer, stopTimer]);

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

  const isActiveRef = useRef(isActive);
  const tickRef = useRef(tick);

  useEffect(() => {
    isActiveRef.current = isActive;
    tickRef.current = tick;
  }, [isActive, tick]);

  // Handle App sending to background/foreground safely
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (isActiveRef.current) {
          tickRef.current();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    remainingSeconds,
    isActive,
    startTimer,
    stopTimer,
  };
}

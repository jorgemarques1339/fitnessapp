import { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

interface VBTData {
  velocity: number;
  power: number;
  isMoving: boolean;
  peakVelocity: number;
}

export function useVBT(isEnabled: boolean, weightKg: number) {
  const [data, setData] = useState<VBTData>({
    velocity: 0,
    power: 0,
    isMoving: false,
    peakVelocity: 0,
  });

  const lastVelocity = useRef(0);
  const lastTime = useRef(Date.now());
  const peakInSet = useRef(0);

  useEffect(() => {
    let subscription: any;

    if (isEnabled) {
      subscription = Accelerometer.addListener(accelerometerData => {
        // Vertical acceleration (Y-axis usually depends on orientation, but let's assume standard)
        // Adjusting for gravity (~1g = 9.81 m/s^2)
        const accY = accelerometerData.y * 9.81; 
        const currentTime = Date.now();
        const dt = (currentTime - lastTime.current) / 1000;

        // Simple integration v = u + at (High-pass filter would be better but let's keep it direct for now)
        // We only care about positive velocity (upward movement)
        let currentVel = lastVelocity.current + accY * dt;
        
        // Zero-velocity reset (if acceleration is near gravity, we're likely static)
        if (Math.abs(accelerometerData.y - 1) < 0.05) {
          currentVel = 0;
        }

        currentVel = Math.max(0, currentVel);

        if (currentVel > peakInSet.current) {
          peakInSet.current = currentVel;
        }

        const power = weightKg * 9.81 * currentVel; // P = F * v

        setData({
          velocity: currentVel,
          power: power,
          isMoving: currentVel > 0.1,
          peakVelocity: peakInSet.current,
        });

        lastVelocity.current = currentVel;
        lastTime.current = currentTime;
      });

      Accelerometer.setUpdateInterval(100); // 10Hz
    }

    return () => {
      subscription?.remove();
    };
  }, [isEnabled, weightKg]);

  const resetSet = () => {
    peakInSet.current = 0;
    lastVelocity.current = 0;
    setData({
      velocity: 0,
      power: 0,
      isMoving: false,
      peakVelocity: 0,
    });
  };

  return { ...data, resetSet };
}

// ── SIMULATION HOOK FOR WEB/DEV ──
export function useVBTSimulated(isEnabled: boolean, weightKg: number) {
  const [data, setData] = useState<VBTData>({
    velocity: 0,
    power: 0,
    isMoving: false,
    peakVelocity: 0,
  });

  const peakInSet = useRef(0);

  useEffect(() => {
    let interval: any;

    if (isEnabled) {
      let t = 0;
      interval = setInterval(() => {
        t += 0.1;
        // Simulate a rep cycle (sine wave)
        const rawVel = Math.sin(t * 2);
        const currentVel = rawVel > 0 ? rawVel * 0.8 : 0; // Only concentric phase

        if (currentVel > peakInSet.current) {
          peakInSet.current = currentVel;
        }

        setData({
          velocity: currentVel,
          power: weightKg * 9.81 * currentVel,
          isMoving: currentVel > 0.1,
          peakVelocity: peakInSet.current,
        });
      }, 100);
    } else {
      setData(prev => ({ ...prev, velocity: 0, isMoving: false }));
    }

    return () => clearInterval(interval);
  }, [isEnabled, weightKg]);

  return { ...data, resetSet: () => { peakInSet.current = 0; } };
}

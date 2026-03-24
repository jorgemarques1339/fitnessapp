import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

// Futuristic/Sleek Sound Assets for 2026+
const SOUND_FILES = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',      
  pop: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',        
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',    
  complete: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',   
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',    
  warning: 'https://assets.mixkit.co/active_storage/sfx/2560/2560-preview.mp3',    
  error: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',      
};

class SensoryManager {
  private sounds: { [key: string]: Audio.Sound } = {};

  /**
   * Main entry point for sensory feedback
   */
  trigger = async (options: { 
    sound?: keyof typeof SOUND_FILES, 
    haptic?: HapticType,
    volume?: number 
  }) => {
    const { sound, haptic, volume = 0.4 } = options;

    if (haptic && Platform.OS !== 'web') {
      this.triggerHaptic(haptic);
    }

    if (sound) {
      await this.playSound(sound, volume);
    }
  };

  /**
   * Standalone haptic trigger
   */
  triggerHaptic = async (type: HapticType) => {
    if (Platform.OS === 'web') return;
    
    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'selection':
          await Haptics.selectionAsync();
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      console.warn('Haptics failed', error);
    }
  };

  /**
   * Internal sound playback
   */
  private playSound = async (name: keyof typeof SOUND_FILES, volume: number) => {
    try {
      const soundRef = this.sounds[name];
      if (soundRef) {
        await soundRef.setPositionAsync(0);
        await soundRef.setVolumeAsync(volume);
        await soundRef.playAsync();
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: SOUND_FILES[name] },
        { shouldPlay: true, volume }
      );
      this.sounds[name] = sound;
    } catch (error) {
      console.warn('Sound play failed', name, error);
    }
  };

  /**
   * Compatibility alias for legacy soundManager.play()
   */
  play = async (name: keyof typeof SOUND_FILES) => {
    return this.trigger({ sound: name, haptic: 'light' });
  };

  /**
   * Cleanup
   */
  unloadAll = async () => {
    const keys = Object.keys(this.sounds) as (keyof typeof SOUND_FILES)[];
    for (const name of keys) {
      try {
        await this.sounds[name].unloadAsync();
      } catch (e) {}
    }
    this.sounds = {};
  };
}

export const sensoryManager = new SensoryManager();
// Export as soundManager too for seamless transition
export const soundManager = sensoryManager;

import * as Speech from 'expo-speech';
import { useConfigStore } from '../store/useConfigStore';

class VoiceCoach {
  /**
   * Main method to speak a message
   */
  speak = async (text: string, options?: Speech.SpeechOptions) => {
    const isEnabled = useConfigStore.getState().voiceCoachEnabled;
    if (!isEnabled) return;

    try {
      // Small delay to not overlap with UI sounds
      setTimeout(async () => {
        await Speech.speak(text, {
          language: 'pt-PT', // Default to Portuguese
          pitch: 1.1,      // Slightly robotic/futuristic
          rate: 1.0,
          ...options
        });
      }, 500);
    } catch (error) {
      console.warn('Voice Coach failed to speak', error);
    }
  };

  /**
   * Shortcut for PR motivation
   */
  motivatePR = (exerciseName: string, currentWeight: number, ghostWeight: number) => {
    const diff = ghostWeight - currentWeight;
    if (diff > 0 && diff <= 5) {
      this.speak(`Estás a apenas ${diff} quilos de bater o teu fantasma no ${exerciseName}. Força máxima!`);
    } else if (currentWeight > ghostWeight) {
      this.speak(`Novo recorde! Ultrapassaste o teu recorde anterior em ${currentWeight - ghostWeight} quilos.`);
    }
  };

  /**
   * Shortcut for rest completion
   */
  announceRestEnd = () => {
    this.speak('Descanso terminado. De volta à carga!');
  };

  /**
   * Shortcut for VBT feedback
   */
  announceVBT = (velocity: number) => {
    if (velocity < 0.3) {
      this.speak('Velocidade crítica. Foca na técnica e explosão.');
    } else if (velocity > 0.8) {
      this.speak('Movimento explosivo. Excelente potência!');
    }
  };
}

export const voiceCoach = new VoiceCoach();

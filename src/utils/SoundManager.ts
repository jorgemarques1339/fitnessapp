import { Audio } from 'expo-av';

class SoundManager {
  private sounds: { [key: string]: Audio.Sound } = {};
  private soundFiles = {
    click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Bubble click
    pop: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',   // Soft pop
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Happy bell
    complete: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Simple ding
  };

  async play(soundName: keyof typeof this.soundFiles) {
    try {
      // If sound already loaded, stop and play from start
      if (this.sounds[soundName]) {
        await this.sounds[soundName].setPositionAsync(0);
        await this.sounds[soundName].playAsync();
        return;
      }

      // Otherwise load and play
      const { sound } = await Audio.Sound.createAsync(
        { uri: this.soundFiles[soundName] },
        { shouldPlay: true, volume: 0.4 }
      );
      this.sounds[soundName] = sound;
    } catch (error) {
      console.warn('Failed to play sound:', soundName, error);
    }
  }

  async unloadAll() {
    for (const soundName in this.sounds) {
      try {
        await this.sounds[soundName].unloadAsync();
      } catch (e) {}
    }
    this.sounds = {};
  }
}

export const soundManager = new SoundManager();

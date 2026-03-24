import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Play, Pause, Heart } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '../hooks/useAppTheme';

const { width } = Dimensions.get('window');

export default function MusicOverlay() {
  const theme = useAppTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Mock "Now Playing" data
  const currentTrack = {
    title: "DOOM Soundtrack",
    artist: "Mick Gordon",
    albumArt: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200",
  };

  return (
    <Animated.View 
      entering={FadeInDown.springify()}
      style={styles.container}
    >
      <BlurView intensity={60} tint="dark" style={styles.blur}>
        <View style={styles.content}>
          <Image source={{ uri: currentTrack.albumArt }} style={styles.albumArt} />
          
          <View style={styles.trackInfo}>
            <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={styles.playBtn}>
              {isPlaying ? (
                <Pause color="#FFF" size={24} fill="#FFF" />
              ) : (
                <Play color="#FFF" size={24} fill="#FFF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
              <Heart 
                color={isLiked ? theme.colors.primary : "#FFF"} 
                size={20} 
                fill={isLiked ? theme.colors.primary : "transparent"} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.progressBarBg}>
           <View style={[styles.progressBarFill, { width: '45%', backgroundColor: theme.colors.primary }]} />
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  blur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  trackInfo: {
    flex: 1,
  },
  title: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Inter-Bold',
  },
  artist: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Inter-Medium',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingRight: 8,
  },
  playBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 10,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 1,
  }
});

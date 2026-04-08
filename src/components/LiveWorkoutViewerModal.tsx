import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Flame, Dumbbell, Clock, CheckCircle2, Circle } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, runOnJS } from 'react-native-reanimated';

interface Props {
  visible: boolean;
  onClose: () => void;
  user: { id: string; name: string; avatar: string } | null;
}

const MOCK_ROUTINE = [
  { id: '1', name: 'Agachamento Livre', sets: 4, completed: 4, weight: '120kg' },
  { id: '2', name: 'Leg Press 45', sets: 4, completed: 2, weight: '240kg' },
  { id: '3', name: 'Cadeira Extensora', sets: 3, completed: 0, weight: '80kg' },
  { id: '4', name: 'Cadeira Flexora', sets: 3, completed: 0, weight: '65kg' }
];

export default function LiveWorkoutViewerModal({ visible, onClose, user }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [elapsedMs, setElapsedMs] = useState(0);
  const [emojis, setEmojis] = useState<{id: number, type: string}[]>([]);
  
  const width = Dimensions.get('window').width;
  const isLargeScreen = width >= 768;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (visible) {
      // Simulate that the user has been working out for 45 mins + random seconds
      setElapsedMs(45 * 60000 + Math.random() * 60000);
      interval = setInterval(() => {
        setElapsedMs(prev => prev + 1000);
      }, 1000);
    } else {
      setEmojis([]);
    }
    return () => clearInterval(interval);
  }, [visible]);

  const formatClock = (ms: number) => {
    const totalS = Math.floor(ms / 1000);
    const m = Math.floor(totalS / 60);
    const s = totalS % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendEmoji = (type: string) => {
    setEmojis(prev => [...prev, { id: Date.now(), type }]);
  };

  if (!user) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <BlurView 
          intensity={90} 
          tint="dark" 
          style={[StyleSheet.absoluteFill, isLargeScreen && styles.centeredContainerBox]} 
        />
        
        <View style={[styles.content, isLargeScreen && styles.centeredContent]}>
          {/* Header */}
          <View style={[styles.header, { marginTop: insets.top || 20 }]}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                <View style={styles.liveBadge}>
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>
              <View>
                <Text style={styles.userName}>{user.name}</Text>
                <View style={styles.timerRow}>
                  <Clock size={12} color="#00E676" />
                  <Text style={styles.timerText}>{formatClock(elapsedMs)}</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Body: Workout Progress */}
          <ScrollView style={styles.workoutArea} contentContainerStyle={styles.workoutContent}>
            <View style={styles.routineTitleBox}>
              <Dumbbell size={16} color="#FFF" />
              <Text style={styles.routineTitleText}>Leg Day Killer</Text>
            </View>
            
            {MOCK_ROUTINE.map((ex, idx) => {
              const isCurrent = ex.completed > 0 && ex.completed < ex.sets;
              const isDone = ex.completed === ex.sets;
              
              return (
                <View key={ex.id} style={[styles.exerciseCard, isCurrent && styles.exerciseCardCurrent, isDone && { opacity: 0.6 }]}>
                  <View style={styles.exHeader}>
                    <Text style={[styles.exName, isCurrent && { color: theme.colors.primary }]}>{ex.name}</Text>
                    <Text style={styles.exWeight}>{ex.weight}</Text>
                  </View>
                  
                  <View style={styles.setsRow}>
                    {Array.from({ length: ex.sets }).map((_, sIdx) => {
                      const done = sIdx < ex.completed;
                      return (
                        <View key={sIdx} style={[styles.setCircle, done && { backgroundColor: theme.colors.primary }]}>
                          {done ? (
                            <CheckCircle2 size={12} color="#000" />
                          ) : (
                            <Circle size={10} color="rgba(255,255,255,0.3)" />
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Emojis Animation Area */}
          <View style={styles.emojiFlyZone} pointerEvents="none">
             {emojis.map(e => (
               <FloatingEmoji key={e.id} type={e.type} />
             ))}
          </View>

          {/* Footer controls */}
          <View style={[styles.footer, { marginBottom: insets.bottom || 20 }]}>
            <Text style={styles.footerLabel}>Encorajar o {user.name.split(' ')[0]}</Text>
            <View style={styles.emojiRow}>
              <TouchableOpacity style={styles.emojiBtn} onPress={() => handleSendEmoji('🔥')}>
                 <Text style={styles.emojiChar}>🔥</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emojiBtn} onPress={() => handleSendEmoji('💪')}>
                 <Text style={styles.emojiChar}>💪</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emojiBtn} onPress={() => handleSendEmoji('🦍')}>
                 <Text style={styles.emojiChar}>🦍</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

// Sub-component for flying emojis
function FloatingEmoji({ type }: { type: string }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.5);

  const startX = (Math.random() - 0.5) * 100; 

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: startX },
      { scale: scale.value }
    ],
    opacity: opacity.value,
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -20,
  }));

  useEffect(() => {
    scale.value = withSpring(1.5);
    translateY.value = withTiming(-300, { duration: 1500 });
    opacity.value = withTiming(0, { duration: 1500 });
  }, []);

  return (
    <Animated.View style={animatedStyle}>
      <Text style={{ fontSize: 40 }}>{type}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
  },
  centeredContainerBox: {
    alignSelf: 'center',
  },
  centeredContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 500,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00E676',
  },
  liveBadge: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
  },
  liveText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: 'Inter-Bold',
  },
  userName: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timerText: {
    color: '#00E676',
    fontSize: 14,
    fontFamily: 'Outfit-Bold',
  },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutArea: {
    flex: 1,
    marginTop: 20,
  },
  workoutContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  routineTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  routineTitleText: {
    color: '#FFF',
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  exerciseCardCurrent: {
    borderColor: 'rgba(204, 255, 0, 0.3)', // Assuming CCFF00 is primary based on theme expectations
    backgroundColor: 'rgba(204, 255, 0, 0.05)',
  },
  exHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exName: {
    color: '#FFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  exWeight: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Outfit-Bold',
    fontSize: 14,
  },
  setsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  setCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiFlyZone: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 400,
    zIndex: 0,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    zIndex: 10,
  },
  footerLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  emojiBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiChar: {
    fontSize: 28,
  }
});

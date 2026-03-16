import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  ZoomIn, 
  withSpring, 
  useAnimatedStyle,
  useSharedValue 
} from 'react-native-reanimated';
import { Trophy, Clock, Weight, CheckCircle2, Share2 } from 'lucide-react-native';
import { useWorkoutStore } from '../store/useWorkoutStore';

export default function TrophyScreen() {
  const lastWorkout = useWorkoutStore(state => state.lastCompletedWorkout);
  const clearTrophy = useWorkoutStore(state => state.clearLastCompletedWorkout);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withSpring(1);
  }, []);

  if (!lastWorkout) return null;

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1A1A1A', '#000000']}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={ZoomIn.duration(800)} style={[styles.trophyContainer, animatedIconStyle]}>
          <View style={styles.glow} />
          <Trophy color="#FFD700" size={120} strokeWidth={1.5} />
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(300)} style={styles.title}>
          Treino Concluído!
        </Animated.Text>
        
        <Animated.Text entering={FadeInUp.delay(500)} style={styles.subtitle}>
          {lastWorkout.routineTitle}
        </Animated.Text>

        <View style={styles.statsGrid}>
          <Animated.View entering={FadeInDown.delay(700)} style={styles.statCard}>
            <BlurView intensity={30} tint="light" style={styles.statBlur}>
              <Weight color="#00E676" size={24} />
              <Text style={styles.statValue}>{lastWorkout.totalTonnageKg.toLocaleString()} kg</Text>
              <Text style={styles.statLabel}>Tonelagem Total</Text>
            </BlurView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(900)} style={styles.statCard}>
            <BlurView intensity={30} tint="light" style={styles.statBlur}>
              <CheckCircle2 color="#2196F3" size={24} />
              <Text style={styles.statValue}>{lastWorkout.totalSets}</Text>
              <Text style={styles.statLabel}>Séries Totais</Text>
            </BlurView>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(1100)} style={styles.fullWidthCard}>
          <BlurView intensity={20} tint="dark" style={styles.summaryBlur}>
            <Text style={styles.summaryTitle}>Destaque da Sessão</Text>
            <Text style={styles.summaryText}>
              Você moveu o equivalente a { (lastWorkout.totalTonnageKg / 1000).toFixed(1) } toneladas de puro esforço! 
              Hipertrofia garantida.
            </Text>
          </BlurView>
        </Animated.View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={() => { /* Share logic here later */ }}
          >
            <BlurView intensity={40} tint="light" style={styles.buttonBlur}>
              <Share2 color="#FFFFFF" size={20} style={{ marginRight: 10 }} />
              <Text style={styles.buttonText}>Partilhar</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.finishButton} 
            onPress={clearTrophy}
          >
            <LinearGradient
              colors={['#00E676', '#00C853']}
              style={styles.finishGradient}
            >
              <Text style={styles.finishButtonText}>Continuar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 1000,
  },
  scrollContent: {
    padding: 30,
    alignItems: 'center',
    paddingTop: 80,
  },
  trophyContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 5,
    marginBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statBlur: {
    ...StyleSheet.absoluteFillObject,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  fullWidthCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 40,
  },
  summaryBlur: {
    padding: 20,
  },
  summaryTitle: {
    color: '#00E676',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 10,
  },
  summaryText: {
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    fontSize: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  shareButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonBlur: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  finishButton: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  finishGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  }
});

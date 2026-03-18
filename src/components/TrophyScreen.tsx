import React, { useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
import { Trophy, Clock, Weight, CheckCircle2, Share2, Target, TrendingUp } from 'lucide-react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { useWorkoutStore } from '../store/useWorkoutStore';
import { detectPRs, PR } from '../utils/weeklyStats';

export default function TrophyScreen() {
  const lastWorkout = useWorkoutStore(state => state.lastCompletedWorkout);
  const clearTrophy = useWorkoutStore(state => state.clearLastCompletedWorkout);
  const completedWorkouts = useWorkoutStore(state => state.completedWorkouts);
  const scale = useSharedValue(0.8);

  const badgeRef = useRef<View>(null);

  const prs = useMemo(() => {
    if (!lastWorkout) return [];
    return detectPRs(completedWorkouts, lastWorkout);
  }, [lastWorkout, completedWorkouts]);

  useEffect(() => {
    scale.value = withSpring(1);
  }, []);

  if (!lastWorkout) return null;

  const handleShare = async () => {
    try {
      if (badgeRef.current) {
        const localUri = await captureRef(badgeRef, {
          format: 'png',
          quality: 1,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(localUri, {
            mimeType: 'image/png',
            dialogTitle: 'Partilhar Treino'
          });
        } else {
          Alert.alert("Erro", "A partilha nativa não está disponível neste dispositivo.");
        }
      }
    } catch (e: any) {
      Alert.alert("Erro ao Partilhar", e.message);
    }
  };

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

        {/* PR Section */}
        {prs.length > 0 && (
          <Animated.View entering={FadeInDown.delay(1300)} style={styles.prSection}>
            <LinearGradient
              colors={['rgba(255,215,0,0.15)', 'rgba(255,150,0,0.08)']}
              style={styles.prCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.prHeader}>
                <Text style={styles.prHeaderEmoji}>🏆</Text>
                <Text style={styles.prTitle}>NOVOS RECORDES PESSOAIS!</Text>
              </View>
              {prs.map((pr, i) => (
                <View key={i} style={styles.prRow}>
                  <TrendingUp color="#FFD700" size={16} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.prExercise}>{pr.exerciseName}</Text>
                    <Text style={styles.prValue}>
                      {pr.type === 'weight' ? `${pr.newValue}kg` : `${pr.newValue}kg 1RM`}
                      <Text style={styles.prPrev}>  (antes: {pr.previousBest}{pr.type === 'weight' ? 'kg' : 'kg'})</Text>
                    </Text>
                  </View>
                </View>
              ))}
            </LinearGradient>
          </Animated.View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={handleShare}
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

        {/* Hidden Badge for Sharing */}
        <View style={styles.hiddenBadgeContainer} pointerEvents="none">
          <View ref={badgeRef} style={styles.shareBadge}>
            <LinearGradient
              colors={['#0F172A', '#000000']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.badgePattern}>
              <Trophy color="rgba(255, 215, 0, 0.1)" size={140} />
            </View>
            
            <View style={styles.badgeHeader}>
              <Text style={styles.badgeAppTitle}>FITNESSAPP PRO</Text>
            </View>
            
            <Text style={styles.badgeTitle}>{lastWorkout.routineTitle}</Text>
            
            <View style={styles.badgeStats}>
              <View style={styles.badgeStat}>
                <Weight color="#00E676" size={20} />
                <Text style={styles.badgeStatValue}>{(lastWorkout.totalTonnageKg / 1000).toFixed(1)}t</Text>
                <Text style={styles.badgeStatLabel}>TONELADAS</Text>
              </View>
              
              
              <View style={styles.badgeStat}>
                <CheckCircle2 color="#38BDF8" size={20} />
                <Text style={styles.badgeStatValue}>{lastWorkout.totalSets}</Text>
                <Text style={styles.badgeStatLabel}>SÉRIES</Text>
              </View>
            </View>
          </View>
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
  },
  hiddenBadgeContainer: {
    position: 'absolute',
    top: -2000, 
    left: -2000,
  },
  shareBadge: {
    width: 1080 / 3, // ~360px width
    height: 1920 / 3, // ~640px height (Classic 9:16 ratio scaled down)
    backgroundColor: '#000',
    overflow: 'hidden',
    justifyContent: 'center',
    padding: 30,
  },
  badgePattern: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeHeader: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  badgeAppTitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 4,
  },
  badgeTitle: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
    marginBottom: 40,
  },
  badgeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeStat: {
    alignItems: 'center',
  },
  badgeStatValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  badgeStatLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },
  // PR Section
  prSection: {
    width: '100%',
    marginBottom: 16,
  },
  prCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  prHeaderEmoji: {
    fontSize: 24,
  },
  prTitle: {
    color: '#FFD700',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  prExercise: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  prValue: {
    color: '#FFD700',
    fontWeight: '800',
    fontSize: 16,
  },
  prPrev: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    fontSize: 12,
  },
});

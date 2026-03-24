import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated as RNAnimated } from 'react-native';
import { BlurView } from 'expo-blur';
import { 
  Trophy, 
  Target, 
  Clock, 
  ChevronRight, 
  CircleCheck 
} from 'lucide-react-native';
import { useChallengeStore } from '../store/useChallengeStore';
import { Challenge } from '../data/challenges';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function ChallengesSection() {
  const { activeChallenges, userProgress } = useChallengeStore();

  const renderChallenge = (challenge: Challenge, index: number) => {
    const progress = userProgress[challenge.id] || { currentValue: 0, isCompleted: false };
    const percent = Math.min(1, progress.currentValue / challenge.targetGoal);

    return (
      <Animated.View 
        key={challenge.id} 
        entering={FadeInRight.delay(index * 100)}
        style={styles.challengeCard}
      >
        <BlurView intensity={20} tint="dark" style={styles.cardBlur}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: progress.isCompleted ? '#00E67620' : '#FFFFFF10' }]}>
              {progress.isCompleted ? (
                <CircleCheck color="#00E676" size={20} />
              ) : (
                <Target color="#FFF" size={20} />
              )}
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeDesc} numberOfLines={1}>{challenge.description}</Text>
            </View>
            {progress.isCompleted && <Trophy color="#FFD700" size={16} />}
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>
                {progress.currentValue.toLocaleString()} / {challenge.targetGoal.toLocaleString()} {challenge.unit}
              </Text>
              <Text style={styles.percentText}>{Math.round(percent * 100)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${percent * 100}%`, backgroundColor: progress.isCompleted ? '#00E676' : '#38BDF8' }]} />
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.timeTag}>
              <Clock size={12} color="rgba(255,255,255,0.4)" />
              <Text style={styles.timeText}>Termina em 12 dias</Text>
            </View>
            <TouchableOpacity style={styles.detailsBtn}>
              <Text style={styles.detailsText}>Ver Detalhes</Text>
              <ChevronRight size={14} color="#38BDF8" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>Desafios Ativos</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Ver todos</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeChallenges.map(renderChallenge)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  seeAll: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 15,
    gap: 12,
  },
  challengeCard: {
    width: 280,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardBlur: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  challengeTitle: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  challengeDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  percentText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '500',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  }
});

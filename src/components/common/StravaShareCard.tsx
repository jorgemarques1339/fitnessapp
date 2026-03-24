import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Clock, Weight, Zap } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * (1920 / 1080); // 9:16 aspect ratio

interface Props {
  workoutTitle: string;
  totalTonnage: string;
  duration: string;
  date: string;
  topExerciseName: string;
  topExerciseWeight: string;
  imageUrl?: string;
}

export default function StravaShareCard({
  workoutTitle,
  totalTonnage,
  duration,
  date,
  topExerciseName,
  topExerciseWeight,
  imageUrl = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000'
}: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)', '#000000']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <Text style={styles.appTitle}>ANTIGRAVITY FITNESS</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.mainContent}>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.workoutTitle}>{workoutTitle}</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>PESO TOTAL</Text>
                <Text style={styles.statValue}>{totalTonnage} <Text style={styles.statUnit}>kg</Text></Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>DURAÇÃO</Text>
                <Text style={styles.statValue}>{duration}</Text>
              </View>
            </View>

            <View style={styles.highlightCard}>
              <LinearGradient
                colors={['rgba(0,230,118,0.2)', 'rgba(0,230,118,0.05)']}
                style={styles.highlightGradient}
              >
                <View style={styles.highlightRow}>
                  <Trophy color="#00E676" size={24} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.highlightLabel}>SET MAIS PESADO</Text>
                    <Text style={styles.highlightValue}>{topExerciseName}</Text>
                  </View>
                  <Text style={styles.highlightWeight}>{topExerciseWeight}kg</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.footer}>
            <Zap color="#FFD700" size={20} fill="#FFD700" />
            <Text style={styles.footerText}>BECOME UNSTOPPABLE</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  background: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 30,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
  },
  appTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 4,
    opacity: 0.6,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: '#00E676',
    marginTop: 10,
    borderRadius: 2,
  },
  mainContent: {
    marginBottom: 40,
  },
  date: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  workoutTitle: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 42,
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 40,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  statValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
  },
  statUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.4)',
  },
  highlightCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.2)',
  },
  highlightGradient: {
    padding: 20,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  highlightValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  highlightWeight: {
    color: '#00E676',
    fontSize: 24,
    fontWeight: '900',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  footerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    opacity: 0.8,
  }
});

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Swords, TrendingUp, Zap, Target } from 'lucide-react-native';
import { useSocialStore, LeaderboardEntry } from '../store/useSocialStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

export default function DuelModal() {
  const { 
    selectedDuelUser, 
    setSelectedDuelUser, 
    currentUserProfile,
    activeDuels,
    startDuel
  } = useSocialStore();

  if (!selectedDuelUser) return null;

  const currentDuel = activeDuels.find(d => d.opponentId === selectedDuelUser.userId);
  const isDuelActive = !!currentDuel;

  // Use real tonnage from duel or mock if not started
  const myTonnage = currentDuel ? currentDuel.myTonnage : 0;
  const opponentTonnage = currentDuel ? currentDuel.opponentTonnage : selectedDuelUser.value;

  const renderStatRow = (label: string, userVal: number, myVal: number, icon: React.ReactNode) => {
    const total = Math.max(userVal + myVal, 1);
    const userPct = (userVal / total) * 100;
    const myPct = (myVal / total) * 100;
    const userIsWinning = userVal > myVal;

    return (
      <View style={styles.statRow}>
        <View style={styles.statInfo}>
          {icon}
          <Text style={styles.statLabel}>{label}</Text>
        </View>
        <View style={styles.comparisonBars}>
          <View style={styles.userSide}>
            <Text style={[styles.statValue, userIsWinning && styles.winningText]}>{userVal.toLocaleString()}</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${Math.max(userPct, 5)}%`, backgroundColor: userIsWinning ? '#FF5252' : '#FFF' }]} />
            </View>
          </View>
          <View style={styles.mySide}>
            <Text style={[styles.statValue, !userIsWinning && styles.winningText]}>{myVal.toLocaleString()}</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${Math.max(myPct, 5)}%`, backgroundColor: !userIsWinning ? '#00E676' : '#FFF', alignSelf: 'flex-end' }]} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={!!selectedDuelUser}
      transparent
      animationType="fade"
      onRequestClose={() => setSelectedDuelUser(null)}
    >
      <View style={styles.overlay}>
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        
        <Animated.View entering={FadeInUp} style={styles.modalContainer}>
          <View style={styles.header}>
            <Swords color="#FFD700" size={28} />
            <Text style={styles.title}>{isDuelActive ? 'DUELO EM CURSO' : 'NOVO DESAFIO'}</Text>
            <TouchableOpacity onPress={() => setSelectedDuelUser(null)} style={styles.closeBtn}>
              <X color="#FFF" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.vsContainer}>
             <View style={styles.avatarWrapper}>
                <Image source={{ uri: selectedDuelUser.userAvatar }} style={styles.avatar} />
                <Text style={styles.name}>{selectedDuelUser.userName}</Text>
             </View>
             
             <Animated.View entering={ZoomIn.delay(300)} style={styles.vsBadge}>
                <Text style={styles.vsText}>VS</Text>
             </Animated.View>

             <View style={styles.avatarWrapper}>
                <Image source={{ uri: currentUserProfile.avatar }} style={styles.avatar} />
                <Text style={styles.name}>Você</Text>
             </View>
          </View>

          <ScrollView style={styles.statsScroll}>
             {renderStatRow("Tonelagem (kg)", opponentTonnage, myTonnage, <Scaling color="#38BDF8" size={16} />)}
             
             {isDuelActive ? (
               <View style={styles.tipContainer}>
                  <Text style={styles.tipTitle}>
                    {myTonnage >= opponentTonnage ? '🏆 Estás na liderança!' : '🔥 Estás a perder!'}
                  </Text>
                  <Text style={styles.tipText}>
                    {myTonnage >= opponentTonnage 
                      ? 'Continua assim para ganhar esta Tonnage War.' 
                      : `Faltam ${((opponentTonnage - myTonnage)).toLocaleString()} kg para recuperares o topo.`}
                  </Text>
               </View>
             ) : (
               <View style={styles.tipContainer}>
                  <Text style={styles.tipTitle}>TONNAGE WAR</Text>
                  <Text style={styles.tipText}>Desafia o {selectedDuelUser.userName} para uma batalha de volume semanal. Quem mover mais peso total em 7 dias ganha!</Text>
               </View>
             )}
          </ScrollView>

          {!isDuelActive && (
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => {
                startDuel(selectedDuelUser);
                setSelectedDuelUser(null);
              }}
            >
               <LinearGradient colors={['#FFD700', '#FFA000']} style={styles.btnGradient}>
                  <Text style={styles.btnText}>LANÇAR DESAFIO</Text>
               </LinearGradient>
            </TouchableOpacity>
          )}

          {isDuelActive && (
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => setSelectedDuelUser(null)}
            >
               <LinearGradient colors={['#333', '#111']} style={styles.btnGradient}>
                  <Text style={[styles.btnText, { color: '#FFF' }]}>FECHAR</Text>
               </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

// Simple Scaling Icon as lucide-react-native might not have 'Scaling' or I'll use TrendingUp
const Scaling = TrendingUp;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContainer: {
    width: Dimensions.get('window').width * 0.9,
    maxHeight: '80%',
    backgroundColor: '#111',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  vsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarWrapper: {
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  name: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  vsBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
  },
  statsScroll: {
    marginBottom: 24,
  },
  statRow: {
    marginBottom: 20,
  },
  statInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  comparisonBars: {
    flexDirection: 'row',
    gap: 20,
  },
  userSide: {
    flex: 1,
  },
  mySide: {
    flex: 1,
  },
  statValue: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  winningText: {
    color: '#FFF',
  },
  barBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  tipContainer: {
    backgroundColor: 'rgba(255,215,0,0.05)',
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.1)',
  },
  tipTitle: {
    color: '#FFD700',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 4,
  },
  tipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    lineHeight: 18,
  },
  actionBtn: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  btnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  }
});

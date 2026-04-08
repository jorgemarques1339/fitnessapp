import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, GestureResponderEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { ChevronRight, Play, Activity, Plus, Trash2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import AnimatedPressable from '../common/AnimatedPressable';
import PremiumCard from '../common/PremiumCard';
import MagneticView from '../common/MagneticView';
import AICoachCard from '../AICoachCard';
import WeeklyDashboard from '../WeeklyDashboard';
import FatigueCard from './FatigueCard';
import EmptyWorkoutIllustration from '../common/EmptyWorkoutIllustration';
import { sensoryManager } from '../../utils/SensoryManager';
import { ROUTINES } from '../../data/routines';

interface TodayTabProps {
  safeWorkouts: any[];
  allRoutines: any[];
  onSelectRoutine: (routine: any) => void;
  activeRoutine: any;
  onResumeWorkout: () => void;
  fatigueData: any[];
  theme: any;
  appTheme: any;
  styles: any;
  toggleBuilder: (visible: boolean) => void;
  customRoutines: any[];
  handleDeletePress: (id: string, title: string) => void;
}

export default function TodayTab({
  safeWorkouts,
  allRoutines,
  onSelectRoutine,
  activeRoutine,
  onResumeWorkout,
  fatigueData,
  theme,
  appTheme,
  styles,
  toggleBuilder,
  customRoutines,
  handleDeletePress
}: TodayTabProps) {
  return (
    <>
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <AICoachCard
          completedWorkouts={safeWorkouts}
          routines={allRoutines}
          onSelectRoutine={onSelectRoutine}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <WeeklyDashboard completedWorkouts={safeWorkouts} />
      </Animated.View>

      {activeRoutine && (
        <AnimatedPressable 
          onPress={() => {
            sensoryManager.trigger({ sound: 'click', haptic: 'light' });
            onResumeWorkout();
          }} 
          style={styles.recoveryMargin}
          hapticFeedback="light"
          scaleTo={0.97}
        >
          <PremiumCard 
            style={styles.recoveryMargin}
            variant="alert"
          >
            <View style={styles.recoveryContent}>
              <View style={styles.recoveryIconBox}>
                <Activity color={appTheme.colors.danger} size={24} />
              </View>
              <View style={styles.recoveryTexts}>
                <Text style={styles.recoveryTitle}>⏱️ Treino em Andamento</Text>
                <Text style={styles.recoverySubtitle}>{activeRoutine.title}</Text>
              </View>
              <ChevronRight color={appTheme.colors.textMuted} size={20} />
            </View>
          </PremiumCard>
        </AnimatedPressable>
      )}
      
      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <View style={styles.fatigueHeader}>
          <Text style={styles.sectionTitle}>Recuperação Muscular</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.fatigueScroll}
        >
          {fatigueData.map((item) => (
            <FatigueCard key={item.muscle} item={item} theme={theme} />
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Meus Treinos</Text>
            <AnimatedPressable 
            onPress={() => {
              sensoryManager.trigger({ sound: 'pop', haptic: 'medium' });
              toggleBuilder(true);
            }} 
            hapticFeedback="light"
          >
            <BlurView intensity={appTheme.isDark ? 20 : 40} tint={appTheme.isDark ? "dark" : "light"} style={[styles.createBtn, { borderColor: appTheme.colors.border }]}>
              <Plus color={appTheme.colors.secondary} size={16} style={{ marginRight: 6 }} />
              <Text style={styles.createBtnText}>Novo</Text>
            </BlurView>
          </AnimatedPressable>
        </View>

        {customRoutines.length === 0 ? (
          <View style={styles.emptyCustomState}>
            <EmptyWorkoutIllustration />
            <Text style={[styles.emptyCustomText, { color: appTheme.colors.textPrimary }]}>Nada por aqui ainda...</Text>
            <Text style={[styles.emptyCustomSubtext, { color: appTheme.colors.textMuted }]}>
              Cria o teu primeiro treino personalizado para começares a evoluir!
            </Text>
            <TouchableOpacity 
              onPress={() => toggleBuilder(true)}
              style={[styles.emptyCreateBtn, { backgroundColor: appTheme.colors.primary }]}
            >
              <Plus color="#000" size={18} />
              <Text style={styles.emptyCreateBtnText}>Criar Treino</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.routinesGrid}>
            {customRoutines.map((routine) => (
              <MagneticView key={routine.id}>
                <AnimatedPressable 
                  onPress={() => {
                    sensoryManager.trigger({ sound: 'click', haptic: 'light' });
                    onSelectRoutine(routine);
                  }}
                  style={styles.cardContainer}
                  hapticFeedback="medium"
                >
                  <PremiumCard variant="ghost" intensity={appTheme.isDark ? 30 : 50}>
                    <View style={[styles.cardIndicator, { backgroundColor: appTheme.colors.accent }]} />
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{routine.title}</Text>
                        <View style={styles.cardActions}>
                          <Pressable 
                            onPress={(e: GestureResponderEvent) => {
                              e.stopPropagation();
                              handleDeletePress(routine.id, routine.title);
                            }}
                            style={({ pressed }: { pressed: boolean }) => [
                              styles.deleteBtn,
                              pressed && { opacity: 0.7 }
                            ]}
                          >
                            <Trash2 color={appTheme.colors.textMuted} size={16} />
                          </Pressable>
                        </View>
                      </View>
                      <View style={styles.cardMeta}>
                        <Text style={styles.cardInfo}>{routine.exercises.length} Exercícios</Text>
                        <ChevronRight color={appTheme.colors.primary} size={16} />
                      </View>
                    </View>
                  </PremiumCard>
                </AnimatedPressable>
              </MagneticView>
            ))}
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(700).springify()}>
        <Text style={[styles.sectionTitle, { marginTop: 40, marginBottom: 16 }]}>Planos Predefinidos</Text>
        
        <View style={styles.routinesGrid}>
          {ROUTINES.map((routine) => (
            <MagneticView key={routine.id}>
              <AnimatedPressable 
                onPress={() => {
                    sensoryManager.trigger({ sound: 'click', haptic: 'light' });
                    onSelectRoutine(routine);
                }}
                style={styles.cardContainer}
                hapticFeedback="medium"
              >
                <PremiumCard variant="ghost" intensity={appTheme.isDark ? 30 : 50}>
                  <View style={[styles.cardIndicator, { backgroundColor: appTheme.colors.secondary }]} />
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{routine.title}</Text>
                      <Play color={appTheme.colors.textSecondary} size={20} />
                    </View>
                    
                    <Text style={styles.cardSubtitle}>{routine.subtitle}</Text>
                    
                    <View style={styles.tagContainer}>
                      <View style={[styles.glassTag, { backgroundColor: appTheme.colors.surfaceHighlight, borderColor: appTheme.colors.border }]}>
                        <Text style={styles.tagText}>{routine.exercises.length} Exercícios</Text>
                      </View>
                    </View>
                  </View>
                </PremiumCard>
              </AnimatedPressable>
            </MagneticView>
          ))}
        </View>
      </Animated.View>
    </>
  );
}

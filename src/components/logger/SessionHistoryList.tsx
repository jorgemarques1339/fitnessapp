import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Clock, Focus, Camera, Video, Image as ImageIcon } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';

interface SessionHistoryListProps {
  previousSets: any[];
  bestPrevSet: any;
  suggestedWeight?: number;
  currentExercise: any;
  currentExerciseSets: any[];
  pickMediaForPastSet: (setNumber: number) => void;
  styles: any;
  isLargeScreen?: boolean;
}

export default function SessionHistoryList({
  previousSets,
  bestPrevSet,
  suggestedWeight,
  currentExercise,
  currentExerciseSets,
  pickMediaForPastSet,
  styles,
  isLargeScreen
}: SessionHistoryListProps) {
  const theme = useAppTheme();

  const HistoryContent = () => (
    <>
      {previousSets.length > 0 && (
        <Animated.View entering={FadeInDown.duration(400)}>
          <BlurView intensity={theme.isDark ? 10 : 20} tint={theme.isDark ? "dark" : "light"} style={[styles.prevSessionCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.glassSurface }]}>
            <View style={styles.prevSessionHeader}>
              <Clock color={theme.colors.secondary} size={12} />
              <Text style={[styles.prevSessionTitle, { color: theme.colors.secondary }]}>SESSÃO ANTERIOR</Text>
            </View>
            <View style={styles.prevSessionSets}>
              {previousSets.map((s, i) => (
                <View key={i} style={[styles.prevSetItem, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                  <Text style={[styles.prevSetNum, { color: theme.colors.textMuted }]}>S{s.setNumber}</Text>
                  <Text style={[styles.prevSetStat, { color: theme.colors.textPrimary }]}>{s.weightKg}kg</Text>
                  <Text style={[styles.prevSetX, { color: theme.colors.textMuted }]}>×</Text>
                  <Text style={[styles.prevSetStat, { color: theme.colors.textPrimary }]}>{s.reps}</Text>
                </View>
              ))}
            </View>
            {bestPrevSet && suggestedWeight !== undefined && (
              <View style={[styles.aiSuggestionRow, { backgroundColor: 'rgba(0,230,118,0.05)', borderColor: 'rgba(0,230,118,0.15)' }]}>
                <Text style={[styles.aiSuggestionText, { color: theme.colors.primary }]}>
                  ✦ Sugestão IA: {suggestedWeight}kg para progredir
                </Text>
              </View>
            )}
          </BlurView>
        </Animated.View>
      )}

      {isLargeScreen && (
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <BlurView intensity={theme.isDark ? 10 : 20} tint={theme.isDark ? "dark" : "light"} style={[styles.notesContainer, { backgroundColor: theme.colors.glassSurface, borderColor: theme.colors.border }]}>
            <View style={styles.notesHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Focus color={theme.colors.secondary} size={13} />
                <Text style={[styles.notesTitle, { color: theme.colors.secondary }]}>Foco Técnico</Text>
              </View>
            </View>
            <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>{currentExercise.notes}</Text>
          </BlurView>
        </Animated.View>
      )}

      {(!isLargeScreen && currentExerciseSets.length > 0) && (
        <Text style={{ color: theme.colors.textMuted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Histórico da Sessão</Text>
      )}

      {currentExerciseSets.map((set, i) => (
        <Animated.View key={i} entering={FadeInDown.delay(i * 80)}>
          <BlurView intensity={theme.isDark ? 25 : 45} tint={theme.isDark ? "dark" : "light"} style={[styles.setRow, { backgroundColor: theme.colors.surfaceHighlight, marginBottom: 12 }]}>
            <View style={[styles.setLeft, { flex: 1, paddingRight: 10 }]}>
              <View style={[styles.circleBadge, { backgroundColor: 'rgba(0,230,118,0.15)' }]}>
                <Text style={[styles.setText, { color: '#00E676' }]}>{set.setNumber}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.setStatText, { color: theme.colors.textPrimary }]}>{set.weightKg} kg</Text>
                {set.note ? (
                  <Text style={[styles.setNoteText, { color: theme.colors.textMuted }]} numberOfLines={1}>📝 {set.note}</Text>
                ) : null}
              </View>
            </View>
            <View style={styles.setRight}>
              <Text style={[styles.setStatText, { color: theme.colors.textPrimary }]}>{set.reps} reps</Text>
              {set.mediaUri ? (
                <TouchableOpacity style={styles.mediaAttachedBtn}>
                  {set.mediaType === 'video' ? <Video color={theme.colors.secondary} size={16} /> : <ImageIcon color={theme.colors.secondary} size={16} />}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => pickMediaForPastSet(set.setNumber)} style={styles.attachBtn}>
                  <Camera color={theme.colors.textMuted} size={16} />
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        </Animated.View>
      ))}
    </>
  );

  if (isLargeScreen) {
    return (
      <ScrollView style={styles.historyContainer} showsVerticalScrollIndicator={false}>
        <HistoryContent />
      </ScrollView>
    );
  }

  // Mobile layout doesn't use the wrapper ScrollView here since it's already in the main ScrollView
  return (
    <View style={{ marginTop: 24, paddingBottom: 20 }}>
      <HistoryContent />
    </View>
  );
}

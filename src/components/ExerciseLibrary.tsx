import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Search, Info, ChevronRight, Dumbbell } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import { EXERCISE_DATABASE, ExerciseDef } from '../data/exercises';
import { useAppTheme } from '../hooks/useAppTheme';
import TechnicalModal from './TechnicalModal';
import AnimatedPressable from './common/AnimatedPressable';

export default function ExerciseLibrary() {
  const theme = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDef | null>(null);

  const filteredExercises = useMemo(() => {
    return EXERCISE_DATABASE.filter(ex => 
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const renderExerciseItem = ({ item }: { item: ExerciseDef }) => (
    <AnimatedPressable
      onPress={() => setSelectedExercise(item)}
      style={styles.exerciseCard}
      scaleTo={0.98}
    >
      <BlurView
        intensity={theme.isDark ? 20 : 40}
        tint={theme.isDark ? 'dark' : 'light'}
        style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHighlight }]}>
            <Dumbbell color={theme.colors.primary} size={20} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.exerciseName, { color: theme.colors.textPrimary }]}>{item.name}</Text>
            <Text style={[styles.exerciseCategory, { color: theme.colors.secondary }]}>
              {(item.category || 'Geral').toUpperCase()}
            </Text>
          </View>
          <Info color={theme.colors.textMuted} size={20} />
        </View>
      </BlurView>
    </AnimatedPressable>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.pageTitle, { color: theme.colors.textPrimary }]}>Biblioteca Técnica</Text>
      
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
        <Search color={theme.colors.textMuted} size={20} />
        <TextInput
          placeholder="Pesquisar exercício ou músculo..."
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              Nenhum exercício encontrado para "{searchQuery}"
            </Text>
          </View>
        }
      />

      {selectedExercise && (
        <TechnicalModal
          visible={!!selectedExercise}
          onClose={() => setSelectedExercise(null)}
          exerciseName={selectedExercise.name}
          videoUrl={selectedExercise.videoUrl}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
    gap: 12,
  },
  exerciseCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  glassCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  exerciseCategory: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

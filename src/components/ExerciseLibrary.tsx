import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  useWindowDimensions 
} from 'react-native';
import { 
  Search, 
  Info, 
  ChevronRight, 
  Dumbbell, 
  Plus, 
  Video,
  Activity,
  Zap,
  Target
} from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  Layout,
  SlideInRight
} from 'react-native-reanimated';

import { ExerciseDef, MuscleGroup } from '../data/exercises';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAllExercises } from '../utils/exerciseSelectors';
import TechnicalModal from './TechnicalModal';
import AddExerciseModal from './AddExerciseModal';
import AnimatedPressable from './common/AnimatedPressable';
import PremiumCard from './common/PremiumCard';
import { sensoryManager } from '../utils/SensoryManager';

const MUSCLE_GROUPS: (MuscleGroup | 'Todos')[] = [
  'Todos', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'
];

export default function ExerciseLibrary() {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > theme.breakpoints.tablet;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MuscleGroup | 'Todos'>('Todos');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDef | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const ALL_EXERCISES = useAllExercises();

  const filteredExercises = useMemo(() => {
    return ALL_EXERCISES.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ex.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, ALL_EXERCISES]);

  const renderExerciseItem = ({ item, index }: { item: ExerciseDef, index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 50).springify()}
      style={isLargeScreen ? styles.gridItem : styles.listItem}
    >
      <AnimatedPressable
        onPress={() => {
          sensoryManager.trigger({ sound: 'click', haptic: 'light' });
          setSelectedExercise(item);
        }}
        scaleTo={0.97}
      >
        <PremiumCard 
          variant="ghost" 
          intensity={theme.isDark ? 25 : 45}
          style={styles.cardWrapper}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Dumbbell color={theme.colors.primary} size={18} />
              </View>
              <View style={styles.headerInfo}>
                <Text numberOfLines={1} style={[styles.exerciseName, { color: theme.colors.textPrimary }]}>{item.name}</Text>
                <View style={styles.tagRow}>
                  <Text style={[styles.categoryTag, { color: theme.colors.secondary }]}>
                    {item.category.toUpperCase()}
                  </Text>
                  {item.equipment && (
                    <Text style={[styles.equipmentTag, { color: theme.colors.textMuted }]}>
                      • {item.equipment}
                    </Text>
                  )}
                </View>
              </View>
              {item.videoUrl ? (
                <View style={styles.videoBadge}>
                  <Video color={theme.colors.primary} size={14} />
                </View>
              ) : (
                <ChevronRight color={theme.colors.textMuted} size={16} />
              )}
            </View>

            {item.secondaryMuscles && item.secondaryMuscles.length > 0 && (
              <View style={styles.secondaryContainer}>
                {item.secondaryMuscles.slice(0, 2).map((muscle) => (
                  <View key={muscle} style={[styles.miniTag, { backgroundColor: theme.colors.surfaceHighlight }]}>
                    <Text style={[styles.miniTagText, { color: theme.colors.textMuted }]}>{muscle}</Text>
                  </View>
                ))}
                {item.secondaryMuscles.length > 2 && (
                  <Text style={styles.moreText}>+{item.secondaryMuscles.length - 2}</Text>
                )}
              </View>
            )}
          </View>
        </PremiumCard>
      </AnimatedPressable>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: theme.colors.textPrimary }]}>Biblioteca Técnica</Text>
          <TouchableOpacity
            onPress={() => {
              sensoryManager.trigger({ sound: 'pop', haptic: 'medium' });
              setIsAddModalOpen(true);
            }}
            style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Plus color="#000" size={24} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Search Bar */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
          <Search color={theme.colors.textMuted} size={20} />
          <TextInput
            placeholder="Pesquisar exercícios..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </Animated.View>

      {/* Category Chips */}
      <Animated.View entering={FadeInRight.delay(300).springify()}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {MUSCLE_GROUPS.map((cat, idx) => (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                sensoryManager.trigger({ haptic: 'selection' });
                setSelectedCategory(cat);
              }}
              style={[
                styles.categoryChip,
                { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border },
                selectedCategory === cat && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
              ]}
            >
              <Text style={[
                styles.categoryText, 
                { color: theme.colors.textSecondary },
                selectedCategory === cat && { color: '#000', fontFamily: theme.typography.fonts.bold }
              ]}>
                {cat === 'Todos' ? '✨ Todos' : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.FlatList
        data={filteredExercises}
        renderItem={renderExerciseItem}
        keyExtractor={item => item.id}
        numColumns={isLargeScreen ? 2 : 1}
        key={isLargeScreen ? 'grid' : 'list'}
        columnWrapperStyle={isLargeScreen ? styles.columnWrapper : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        itemLayoutAnimation={Layout.springify()}
        ListEmptyComponent={
          <Animated.View entering={FadeInDown} style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Target color={theme.colors.textMuted} size={48} />
            </View>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              Nenhum exercício encontrado.
            </Text>
          </Animated.View>
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

      <AddExerciseModal 
        visible={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontFamily: 'Outfit-Black',
    letterSpacing: -1.5,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 12,
  },
  listItem: {
    width: '100%',
    marginBottom: 8,
  },
  gridItem: {
    flex: 1,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    borderRadius: 22,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryTag: {
    fontSize: 9,
    fontFamily: 'Inter-Black',
    letterSpacing: 1,
  },
  equipmentTag: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
  },
  videoBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  miniTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  miniTagText: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
  },
  moreText: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.3)',
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyIconBox: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    opacity: 0.7,
  },
});

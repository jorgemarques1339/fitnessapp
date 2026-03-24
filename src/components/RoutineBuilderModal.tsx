import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Platform, Share as RNShare } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Plus, Save, Minus, Search, Share as ShareIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ExerciseDef } from '../data/exercises';
import { useAllExercises } from '../utils/exerciseSelectors';
import { RoutineDef } from '../data/routines';
import { useAppTheme } from '../hooks/useAppTheme';
import { sensoryManager } from '../utils/SensoryManager';

interface RoutineBuilderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (routine: RoutineDef) => void;
  initialRoutine?: RoutineDef;
}

export default function RoutineBuilderModal({ visible, onClose, onSave, initialRoutine }: RoutineBuilderModalProps) {
  const theme = useAppTheme();
  const [title, setTitle] = useState(initialRoutine?.title || '');
  const [subtitle, setSubtitle] = useState(initialRoutine?.subtitle || '');
  const [selectedExercises, setSelectedExercises] = useState<ExerciseDef[]>(initialRoutine?.exercises || []);
  const [searchQuery, setSearchQuery] = useState('');
  const ALLEX = useAllExercises();

  if (!visible) return null;

  const handleToggleExercise = (exercise: ExerciseDef) => {
    const isSelected = selectedExercises.some(e => e.id === exercise.id);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    if (isSelected) {
      setSelectedExercises(selectedExercises.filter(e => e.id !== exercise.id));
    } else {
      setSelectedExercises([...selectedExercises, { ...exercise, targetSets: 3 }]); // Default 3 sets
    }
  };

  const updateTargetSets = (id: string, delta: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    
    setSelectedExercises(selectedExercises.map(ex => {
      if (ex.id === id) {
        return { ...ex, targetSets: Math.max(1, Math.min(10, ex.targetSets + delta)) };
      }
      return ex;
    }));
  };

  const handleSave = () => {
    if (!title.trim() || selectedExercises.length === 0) return;

    const newRoutine: RoutineDef = {
      id: initialRoutine?.id || `custom_${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim(),
      exercises: selectedExercises
    };

    try {
      sensoryManager.trigger({ sound: 'success', haptic: 'success' });
    } catch (e) {}

    onSave(newRoutine);
    
    if (!initialRoutine) {
      setTitle('');
      setSubtitle('');
      setSelectedExercises([]);
      setSearchQuery('');
    }
    onClose();
  };

  const handleShare = async () => {
    if (!initialRoutine) return;
    try {
      await RNShare.share({
        message: `Olha este treino que fiz no Fitness Ultra: ${initialRoutine.title}!\n\n${initialRoutine.exercises.map(e => `- ${e.name} (${e.targetSets} séries)`).join('\n')}`,
        title: initialRoutine.title,
      });
    } catch (e) {}
  };

  const filteredDatabase = ALLEX.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (ex.category && ex.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <LinearGradient colors={[theme.colors.surface, theme.colors.background]} style={styles.container}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>{initialRoutine ? 'Editar Treino' : 'Criar Novo Treino'}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {initialRoutine && (
              <TouchableOpacity onPress={handleShare} style={[styles.closeButton, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <ShareIcon color={theme.colors.textPrimary} size={20} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.colors.surfaceHighlight }]}>
              <X color={theme.colors.textPrimary} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          
          {/* Metadata Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhes do Treino</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NOME DO TREINO</Text>
              <BlurView intensity={30} tint="dark" style={styles.inputGlass}>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ex: Peito Pesado"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </BlurView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DESCRIÇÃO / FOCO</Text>
              <BlurView intensity={30} tint="dark" style={styles.inputGlass}>
                <TextInput
                  style={styles.input}
                  value={subtitle}
                  onChangeText={setSubtitle}
                  placeholder="Ex: Foco na porção clavicular"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </BlurView>
            </View>
          </View>

          {/* Selected Exercises Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exercícios Selecionados ({selectedExercises.length})</Text>
            
            {selectedExercises.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Nenhum exercício adicionado ainda.</Text>
                <Text style={styles.emptyStateSub}>Procure na lista abaixo e adicione exercícios ao seu plano.</Text>
              </View>
            ) : (
              selectedExercises.map((ex, index) => (
                <BlurView key={`${ex.id}_${index}`} intensity={20} tint="dark" style={styles.selectedCard}>
                  <View style={styles.selectedCardHeader}>
                    <Text style={styles.selectedCardTitle} numberOfLines={2}>{ex.name}</Text>
                    <TouchableOpacity onPress={() => handleToggleExercise(ex)}>
                      <X color="#FF3366" size={20} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.setsControls}>
                    <Text style={styles.setsLabel}>Séries Alvo:</Text>
                    <View style={styles.setsStepper}>
                      <TouchableOpacity onPress={() => updateTargetSets(ex.id, -1)} style={styles.stepperBtn}>
                        <Minus color="#FFF" size={16} />
                      </TouchableOpacity>
                      <Text style={styles.setsValue}>{ex.targetSets}</Text>
                      <TouchableOpacity onPress={() => updateTargetSets(ex.id, 1)} style={styles.stepperBtn}>
                        <Plus color="#FFF" size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </BlurView>
              ))
            )}
          </View>

          {/* Database Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Base de Dados de Exercícios</Text>
            
            <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
              <Search color={theme.colors.textMuted} size={20} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Procurar por nome ou grupo muscular..."
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.databaseList}>
              {filteredDatabase.map(ex => {
                const isSelected = selectedExercises.some(s => s.id === ex.id);
                return (
                  <TouchableOpacity 
                    key={ex.id} 
                    onPress={() => handleToggleExercise(ex)}
                    activeOpacity={0.7}
                    style={styles.dbItemContainer}
                  >
                    <BlurView intensity={isSelected ? 40 : 15} tint={isSelected ? "light" : "dark"} style={[styles.dbItemGlass, isSelected && styles.dbItemSelected, { borderColor: theme.colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.dbItemTitle, isSelected ? { color: '#000' } : { color: theme.colors.textPrimary }]}>{ex.name}</Text>
                        <Text style={[styles.dbItemCategory, isSelected ? { color: 'rgba(0,0,0,0.6)' } : { color: theme.colors.secondary }]}>{ex.category}</Text>
                      </View>
                      <View style={[styles.addBtn, isSelected ? { backgroundColor: theme.colors.danger } : { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                        {isSelected ? <X color="#FFF" size={18} /> : <Plus color={theme.colors.secondary} size={18} />}
                      </View>
                    </BlurView>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

        </ScrollView>

        {/* Footer Actions */}
        <BlurView intensity={theme.isDark ? 50 : 80} tint={theme.isDark ? "dark" : "light"} style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <TouchableOpacity 
            style={[styles.saveBtnWrapper, (!title.trim() || selectedExercises.length === 0) && { opacity: 0.5 }]} 
            onPress={handleSave}
            disabled={!title.trim() || selectedExercises.length === 0}
          >
            <LinearGradient colors={[theme.colors.accent, '#FFA000']} style={styles.saveBtnGradient}>
              <Save color={theme.colors.textInverse} size={20} style={{ marginRight: 8 }} />
              <Text style={[styles.saveBtnText, { color: theme.colors.textInverse }]}>Guardar Treino</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  inputGlass: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    color: '#FFF',
    fontSize: 16,
    padding: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
    overflow: 'hidden',
  },
  selectedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  selectedCardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  setsControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 10,
  },
  setsLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  setsStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setsValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    width: 24,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#FFF',
    fontSize: 15,
  },
  databaseList: {
    gap: 10,
  },
  dbItemContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dbItemGlass: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  dbItemSelected: {
    borderColor: 'rgba(255,255,255,0.8)',
  },
  dbItemTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  dbItemCategory: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  saveBtnWrapper: {
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});

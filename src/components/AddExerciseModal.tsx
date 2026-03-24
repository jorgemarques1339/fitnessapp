import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Plus, Minus, Save, Video } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { MuscleGroup, ExerciseDef } from '../data/exercises';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { sensoryManager } from '../utils/SensoryManager';

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'
];

export default function AddExerciseModal({ visible, onClose }: AddExerciseModalProps) {
  const theme = useAppTheme();
  const addCustomExercise = useHistoryStore(state => state.addCustomExercise);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<MuscleGroup>('Chest');
  const [targetSets, setTargetSets] = useState(3);
  const [videoUrl, setVideoUrl] = useState('');

  const resetForm = () => {
    setName('');
    setCategory('Chest');
    setTargetSets(3);
    setVideoUrl('');
  };

  const handleClose = () => {
    sensoryManager.trigger({ sound: 'click', haptic: 'light' });
    onClose();
  };

  const handleSave = () => {
    if (!name.trim()) return;

    sensoryManager.trigger({ sound: 'pop', haptic: 'medium' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newExercise: ExerciseDef = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      targetSets: 3,
      notes: 'Exercício Customizado.',
      videoUrl: videoUrl.trim() || undefined,
      category: category as MuscleGroup,
      equipment: 'Machine'
    };

    addCustomExercise(newExercise);
    resetForm();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <LinearGradient colors={[theme.colors.surface, theme.colors.background]} style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Novo Exercício</Text>
          <TouchableOpacity onPress={handleClose} style={[styles.closeButton, { backgroundColor: theme.colors.surfaceHighlight }]}>
            <X color={theme.colors.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
          {/* NOME DO EXERCICIO */}
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Nome do Exercício</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surfaceHighlight, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
            placeholder="Ex: Supino Inclinado Máquina..."
            placeholderTextColor={theme.colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          {/* GRUPO MUSCULAR */}
          <Text style={[styles.label, { color: theme.colors.textMuted, marginTop: 24 }]}>Grupo Muscular</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.musclesScroll}>
            {MUSCLE_GROUPS.map(muscle => {
              const isSelected = category === muscle;
              return (
                <TouchableOpacity
                  key={muscle}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategory(muscle);
                  }}
                  style={[
                    styles.muscleBadge,
                    { backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceHighlight },
                    !isSelected && { borderWidth: 1, borderColor: theme.colors.border } 
                  ]}
                >
                  <Text style={[
                    styles.muscleBadgeText,
                    { color: isSelected ? '#000' : theme.colors.textSecondary }
                  ]}>
                    {muscle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* TARGET SETS */}
          <Text style={[styles.label, { color: theme.colors.textMuted, marginTop: 24 }]}>Séries Recomendadas (Sets)</Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity 
              onPress={() => {
                if (targetSets > 1) {
                  Haptics.selectionAsync();
                  setTargetSets(prev => prev - 1);
                }
              }} 
              style={[styles.stepperBtn, { backgroundColor: theme.colors.surfaceHighlight }]}
            >
              <Minus color={theme.colors.textPrimary} size={20} />
            </TouchableOpacity>
            
            <Text style={[styles.stepperValue, { color: theme.colors.textPrimary }]}>{targetSets}</Text>
            
            <TouchableOpacity 
              onPress={() => {
                Haptics.selectionAsync();
                setTargetSets(prev => prev + 1);
              }} 
              style={[styles.stepperBtn, { backgroundColor: theme.colors.surfaceHighlight }]}
            >
              <Plus color={theme.colors.textPrimary} size={20} />
            </TouchableOpacity>
          </View>

          {/* VIDEO URL */}
          <View style={[styles.labelRow, { marginTop: 24 }]}>
            <Text style={[styles.label, { color: theme.colors.textMuted, marginTop: 0 }]}>Vídeo (Opcional)</Text>
            <Video color={theme.colors.textMuted} size={16} />
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surfaceHighlight, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
            placeholder="URL de imagem ou GIF (ex: https://...)"
            placeholderTextColor={theme.colors.textMuted}
            value={videoUrl}
            onChangeText={setVideoUrl}
            autoCapitalize="none"
            keyboardType="url"
          />

          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: name.trim() ? theme.colors.primary : theme.colors.surfaceHighlight }]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={!name.trim()}
          >
            <Save color={name.trim() ? '#000' : theme.colors.textMuted} size={20} />
            <Text style={[styles.saveBtnText, { color: name.trim() ? '#000' : theme.colors.textMuted }]}>
              Guardar Exercício
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    height: 54,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  musclesScroll: {
    gap: 8,
    paddingRight: 24,
  },
  muscleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
  },
  muscleBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 24,
    fontWeight: '800',
    minWidth: 40,
    textAlign: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 60,
    borderRadius: 16,
    marginTop: 40,
  },
  saveBtnText: {
    fontSize: 18,
    fontWeight: '800',
  }
});

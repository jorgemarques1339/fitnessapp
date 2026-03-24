import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Search, ArrowRightLeft } from 'lucide-react-native';
import { ExerciseDef } from '../data/exercises';
import { useAllExercises } from '../utils/exerciseSelectors';
import { useAppTheme } from '../hooks/useAppTheme';
import { sensoryManager } from '../utils/SensoryManager';
import { theme } from '../theme/theme';

interface ExerciseSwapModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSwap: (newExercise: ExerciseDef) => void;
  exerciseToReplace: ExerciseDef | null;
}

export default function ExerciseSwapModal({ visible, onClose, onSelectSwap, exerciseToReplace }: ExerciseSwapModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useAppTheme();

  if (!visible || !exerciseToReplace) return null;

  // Filter out the current one so user doesn't pick the same
  const ALLEX = useAllExercises();
  
  let dbFiltered = ALLEX.filter(ex => ex.id !== exerciseToReplace.id);

  if (searchQuery.trim()) {
    dbFiltered = dbFiltered.filter(ex => 
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (ex.category && ex.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  } else {
    // If no search, sort to bring the same category to the top
    const sameCategory = dbFiltered.filter(ex => ex.category === exerciseToReplace.category);
    const otherCategory = dbFiltered.filter(ex => ex.category !== exerciseToReplace.category);
    dbFiltered = [...sameCategory, ...otherCategory];
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <LinearGradient colors={[theme.colors.surface, theme.colors.background]} style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Substituir Máquina</Text>
          <TouchableOpacity 
            onPress={() => {
              sensoryManager.trigger({ sound: 'click', haptic: 'light' });
              onClose();
            }} 
            style={[styles.closeButton, { backgroundColor: theme.colors.surfaceHighlight }]}
          >
            <X color={theme.colors.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        <View style={[styles.contextBox, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.secondary }]}>
          <Text style={[styles.contextLabel, { color: theme.colors.secondary }]}>A TROCAR</Text>
          <Text style={[styles.contextExercise, { color: theme.colors.textPrimary }]}>{exerciseToReplace.name}</Text>
        </View>

        <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
          <Search color={theme.colors.textMuted} size={20} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Procurar alternativa..."
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {dbFiltered.map((ex, idx) => {
            const isMatch = ex.category === exerciseToReplace.category;
            
            return (
              <TouchableOpacity 
                key={ex.id} 
                onPress={() => {
                  onSelectSwap(ex);
                  setSearchQuery('');
                  onClose();
                }}
                activeOpacity={0.7}
                style={styles.dbItemContainer}
              >
                <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "dark" : "light"} style={[styles.dbItemGlass, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }, isMatch && { borderLeftColor: theme.colors.primary, borderLeftWidth: 3 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dbItemTitle, { color: theme.colors.textPrimary }]}>{ex.name}</Text>
                    {ex.category && <Text style={[styles.dbItemCategory, { color: theme.colors.textSecondary }]}>{ex.category} {isMatch ? '(Recomendado)' : ''}</Text>}
                  </View>
                  <View style={[styles.swapBtn, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.primary }]}>
                    <ArrowRightLeft color={theme.colors.primary} size={16} />
                  </View>
                </BlurView>
              </TouchableOpacity>
            );
          })}
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextBox: {
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  contextLabel: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  contextExercise: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 10,
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 10,
  },
  dbItemContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  dbItemGlass: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  dbItemTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  dbItemCategory: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
  },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)'
  }
});

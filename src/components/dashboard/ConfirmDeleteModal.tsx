import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { Trash2 } from 'lucide-react-native';
import AnimatedPressable from '../common/AnimatedPressable';
import { useAppTheme } from '../../hooks/useAppTheme';

interface ConfirmDeleteModalProps {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({ visible, title, onCancel, onConfirm }: ConfirmDeleteModalProps) {
  const appTheme = useAppTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <AnimatedPressable style={styles.confirmCard} onPress={() => {}} scaleTo={1} hapticFeedback="none">
          <View style={[styles.confirmCardInner, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
            <View style={[styles.confirmIconContainer, { backgroundColor: appTheme.colors.surfaceHighlight }]}>
              <Trash2 color={appTheme.colors.danger} size={32} />
            </View>
            <Text style={[styles.confirmTitle, { color: appTheme.colors.textPrimary }]}>Eliminar Treino?</Text>
            <Text style={[styles.confirmSubtitle, { color: appTheme.colors.textSecondary }]}>
              Tens a certeza que queres apagar "{title}"? Esta ação não pode ser desfeita.
            </Text>
            
            <View style={styles.confirmActions}>
              <TouchableOpacity onPress={onCancel} style={[styles.confirmBtn, { backgroundColor: appTheme.colors.surfaceHighlight }]}>
                <Text style={[styles.confirmBtnText, { color: appTheme.colors.textPrimary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onConfirm} style={[styles.confirmBtn, { backgroundColor: appTheme.colors.danger }]}>
                <Text style={[styles.confirmBtnText, { color: '#fff' }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedPressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 340,
  },
  confirmCardInner: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
  },
});

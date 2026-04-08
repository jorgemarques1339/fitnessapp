import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Camera, Image as ImageIcon, X, Send } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../hooks/useAppTheme';
import { RoutineDef } from '../data/routines';

interface Props {
  visible: boolean;
  activeRoutine: RoutineDef | null;
  onConfirm: (mediaUri?: string, caption?: string) => void;
  onSkip: () => void;
}

export default function WorkoutShareModal({ visible, activeRoutine, onConfirm, onSkip }: Props) {
  const theme = useAppTheme();
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const handleShare = () => {
    onConfirm(mediaUri || undefined, caption.trim() || undefined);
    // Reset state after UI dismiss is handled by parent unmounting this
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <BlurView intensity={theme.isDark ? 50 : 80} tint={theme.isDark ? "dark" : "light"} style={StyleSheet.absoluteFill}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
          
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onSkip} style={styles.closeBtn}>
                <X size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Partilhar Conquista</Text>
              <TouchableOpacity onPress={handleShare} style={[styles.postBtn, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.postBtnText}>Postar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.imageSection}>
              {mediaUri ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: mediaUri }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => setMediaUri(null)}>
                    <X size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.placeholderContainer, { backgroundColor: theme.colors.surfaceHighlight }]}>
                  <Text style={[styles.placeholderText, { color: theme.colors.textMuted }]}>Adiciona uma foto do teu pump!</Text>
                  <View style={styles.photoActions}>
                    <TouchableOpacity style={[styles.mediaBtn, { backgroundColor: theme.colors.background }]} onPress={takePhoto}>
                      <Camera size={24} color={theme.colors.primary} />
                      <Text style={[styles.mediaBtnText, { color: theme.colors.textPrimary }]}>Câmera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.mediaBtn, { backgroundColor: theme.colors.background }]} onPress={pickImage}>
                      <ImageIcon size={24} color={theme.colors.secondary} />
                      <Text style={[styles.mediaBtnText, { color: theme.colors.textPrimary }]}>Galeria</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.captionSection}>
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                placeholder="Escreve uma legenda... (Hoje foi épico!)"
                placeholderTextColor={theme.colors.textMuted}
                multiline
                maxLength={200}
                value={caption}
                onChangeText={setCaption}
              />
            </View>

          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 40,
    minHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
  },
  postBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  postBtnText: {
    color: '#000',
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  imageSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  previewContainer: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 0.8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  placeholderText: {
    fontFamily: 'Inter-Medium',
    marginBottom: 20,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 16,
  },
  mediaBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  mediaBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  captionSection: {
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  }
});

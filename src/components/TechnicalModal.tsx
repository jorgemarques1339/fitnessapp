import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface TechnicalModalProps {
  visible: boolean;
  onClose: () => void;
  exerciseName: string;
  videoUrl?: string; // Using a GIF acts like a looping silent video
}

export default function TechnicalModal({ visible, onClose, exerciseName, videoUrl }: TechnicalModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.fullscreenOverlay}>
      <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
      
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{exerciseName}</Text>
          <Text style={styles.subtitle}>Foco Técnico & Execução</Text>
          
          <View style={styles.mediaContainer}>
            {videoUrl ? (
              Platform.OS === 'web' ? (
                /* @ts-ignore - standard img tag for web stability */
                <img 
                  src={videoUrl} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  alt={exerciseName}
                />
              ) : (
                <Image 
                  source={{ uri: videoUrl }} 
                  style={styles.gifImage} 
                  resizeMode="contain"
                />
              )
            ) : (
              <View style={styles.placeholderBox}>
                <Text style={styles.placeholderText}>Demonstração não disponível</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.textStyle}>Fechar Visualização</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    width: '100%',
    padding: 24,
    maxWidth: 600,
  },
  modalView: {
    backgroundColor: '#1E1F26',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 350,
    backgroundColor: '#000',
    borderRadius: 16,
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    padding: 20,
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.3)',
    fontStyle: 'italic',
    fontSize: 14,
  },
  closeButton: {
    borderRadius: 100,
    paddingVertical: 18,
    backgroundColor: '#38BDF8',
    width: '100%',
    alignItems: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  textStyle: {
    color: '#000',
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontSize: 14,
    letterSpacing: 1,
  },
  modalTitle: {
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});

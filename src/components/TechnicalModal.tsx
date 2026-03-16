import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';

interface TechnicalModalProps {
  visible: boolean;
  onClose: () => void;
  exerciseName: string;
  videoUrl?: string; // Using a GIF acts like a looping silent video
}

export default function TechnicalModal({ visible, onClose, exerciseName, videoUrl }: TechnicalModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{exerciseName}</Text>
          <Text style={styles.subtitle}>Foco Técnico & Execução</Text>
          
          <View style={styles.mediaContainer}>
            {videoUrl ? (
              <Image 
                source={{ uri: videoUrl }} 
                style={styles.gifImage} 
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.placeholderText}>No Visual Guide Available</Text>
            )}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.textStyle}>Fechar Visualização</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.95)', // Almost completely opaqued out
  },
  modalView: {
    margin: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
    width: '90%',
    borderWidth: 1,
    borderColor: '#333'
  },
  mediaContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444'
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    color: '#666',
    fontStyle: 'italic'
  },
  closeButton: {
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    backgroundColor: '#E53935',
    width: '100%',
    alignItems: 'center'
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  modalTitle: {
    marginBottom: 5,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF'
  },
  subtitle: {
    color: '#E53935',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});

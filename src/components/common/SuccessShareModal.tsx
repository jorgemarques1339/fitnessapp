import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Instagram, X } from 'lucide-react-native';

import ShareTicket from './ShareTicket';
import { CompletedWorkout } from '../../store/types';
import { useAppTheme } from '../../hooks/useAppTheme';

interface SuccessShareModalProps {
  workout: CompletedWorkout | null;
  onClose: () => void;
}

export default function SuccessShareModal({ workout, onClose }: SuccessShareModalProps) {
  const theme = useAppTheme();
  const ticketRef = useRef<View>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  if (!workout) return null;

  const handleShare = async () => {
    if (!ticketRef.current) return;
    try {
      setIsCapturing(true);
      
      // Give it a tiny delay to ensure rendering is complete
      await new Promise(r => setTimeout(r, 100));

      const uri = await captureRef(ticketRef, {
        format: 'png',
        quality: 1,
      });

      if (Platform.OS === 'web') {
        alert("A partilha automática apenas está disponível nas plataformas móveis. Foi gerada uma imagem no background.");
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Partilhar o teu Treino Épico!',
            UTI: 'public.png',
          });
        }
      }
    } catch (error) {
      console.error("Error sharing ticket:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Modal visible={!!workout} transparent animationType="slide">
      <View style={styles.overlay}>
        <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
        
        {/* Hidden Ticket to Capture */}
        <ShareTicket ref={ticketRef} workout={workout} />

        <View style={styles.container}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>TREINO CONCLUÍDO! 🚀</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Excelente trabalho! Destruíste {workout.totalTonnageKg.toLocaleString()}kg em volume hoje.
          </Text>

          <TouchableOpacity 
            style={[styles.shareBtn, { backgroundColor: '#E1306C' }]} 
            onPress={handleShare}
            activeOpacity={0.8}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Instagram color="#FFF" size={24} />
                <Text style={styles.shareBtnText}>Partilhar no Instagram</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.closeBtn, { borderColor: theme.colors.border }]} 
            onPress={onClose}
          >
            <Text style={[styles.closeBtnText, { color: theme.colors.textMuted }]}>Voltar ao Início</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#1E1F26',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    height: 60,
    borderRadius: 16,
    marginBottom: 16,
  },
  shareBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  }
});

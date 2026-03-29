import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Calendar, Camera } from 'lucide-react-native';
import { useBodyStore, BodyMeasurement } from '../../store/useBodyStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import AnimatedPressable from '../common/AnimatedPressable';
import { sensoryManager } from '../../utils/SensoryManager';

export default function BodyAlbum() {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const { measurements } = useBodyStore();

  // Filter out measurements that don't have AT LEAST one photo
  const photoLogs = measurements.filter(m => m.frontPhotoUri || m.sidePhotoUri || m.backPhotoUri);

  const [viewAngle, setViewAngle] = useState<'front' | 'side' | 'back'>('front');
  const [beforeId, setBeforeId] = useState<string | null>(photoLogs.length > 1 ? photoLogs[photoLogs.length - 1].id : null);
  const [afterId, setAfterId] = useState<string | null>(photoLogs.length > 0 ? photoLogs[0].id : null);

  if (photoLogs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Camera color="rgba(255,255,255,0.2)" size={48} style={{ marginBottom: 16 }} />
        <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>Álbum Vazio</Text>
        <Text style={[styles.emptyDesc, { color: theme.colors.textMuted }]}>
          Registe o seu peso no separador "Corpo" e adicione fotografias (Frente, Lado ou Costas) para construir o seu álbum de transformação.
        </Text>
      </View>
    );
  }

  const beforeLog = photoLogs.find(m => m.id === beforeId);
  const afterLog = photoLogs.find(m => m.id === afterId);

  const getUriForAngle = (log: BodyMeasurement | undefined) => {
    if (!log) return null;
    if (viewAngle === 'front') return log.frontPhotoUri;
    if (viewAngle === 'side') return log.sidePhotoUri;
    if (viewAngle === 'back') return log.backPhotoUri;
    return null;
  };

  const beforeUri = getUriForAngle(beforeLog);
  const afterUri = getUriForAngle(afterLog);

  const renderThumbnailSelector = (label: string, selectedId: string | null, onSelect: (id: string) => void) => (
    <View style={styles.pickerBlock}>
      <Text style={[styles.pickerTitle, { color: theme.colors.textMuted }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
        {photoLogs.map(log => {
          const uri = getUriForAngle(log);
          const isSelected = selectedId === log.id;
          return (
            <AnimatedPressable 
              key={log.id}
              style={[
                styles.thumbnailWrap,
                isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
              ]}
              onPress={() => {
                sensoryManager.trigger({ sound: 'click', haptic: 'light' });
                onSelect(log.id);
              }}
            >
              {uri ? (
                <Image source={{ uri }} style={styles.thumbnailImg} resizeMode="cover" />
              ) : (
                <View style={styles.thumbnailEmpty}><Camera color="rgba(255,255,255,0.3)" size={16} /></View>
              )}
              <View style={styles.thumbnailDateWrap}>
                <Text style={styles.thumbnailDateText}>
                  {new Date(log.date).getDate()}/{new Date(log.date).getMonth()+1}
                </Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* View Angle Pill Selector */}
      <View style={[styles.angleSelector, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
        {(['front', 'side', 'back'] as const).map(angle => (
          <TouchableOpacity 
            key={angle}
            style={[styles.angleBtn, viewAngle === angle && { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              sensoryManager.trigger({ sound: 'click', haptic: 'light' });
              setViewAngle(angle);
            }}
          >
            <Text style={[styles.angleText, viewAngle === angle && { color: '#000', fontWeight: '800' }]}>
              {angle === 'front' ? 'Frente' : angle === 'side' ? 'Lado' : 'Costas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Before / After Comparison Area */}
      <View style={styles.comparisonArea}>
        {/* Before */}
        <View style={styles.compareCol}>
          <Text style={[styles.compareLabel, { color: theme.colors.textMuted }]}>ANTES</Text>
          <View style={[styles.imageFrame, { borderColor: 'rgba(255,255,255,0.1)' }]}>
            {beforeUri ? (
              <Image source={{ uri: beforeUri }} style={styles.fullImage} resizeMode="cover" />
            ) : (
              <View style={styles.missingImage}><Text style={styles.missingLabel}>Sem Foto</Text></View>
            )}
            {beforeLog && (
              <BlurView intensity={20} tint="dark" style={styles.imageOverlay}>
                <Text style={styles.tagWeight}>{beforeLog.weight}kg</Text>
                <View style={styles.tagDateRow}>
                  <Calendar color="rgba(255,255,255,0.8)" size={10} />
                  <Text style={styles.tagDate}>{new Date(beforeLog.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                </View>
              </BlurView>
            )}
          </View>
        </View>

        {/* After */}
        <View style={styles.compareCol}>
          <Text style={[styles.compareLabel, { color: theme.colors.primary }]}>DEPOIS</Text>
          <View style={[styles.imageFrame, { borderColor: theme.colors.primary, borderWidth: 2 }]}>
            {afterUri ? (
              <Image source={{ uri: afterUri }} style={styles.fullImage} resizeMode="cover" />
            ) : (
              <View style={styles.missingImage}><Text style={styles.missingLabel}>Sem Foto</Text></View>
            )}
             {afterLog && (
              <BlurView intensity={20} tint="dark" style={styles.imageOverlay}>
                <Text style={styles.tagWeight}>{afterLog.weight}kg</Text>
                <View style={styles.tagDateRow}>
                  <Calendar color="rgba(255,255,255,0.8)" size={10} />
                  <Text style={styles.tagDate}>{new Date(afterLog.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                </View>
              </BlurView>
            )}
          </View>
        </View>
      </View>

      {/* Selectors */}
      <View style={styles.selectorsArea}>
        {renderThumbnailSelector('Selecionar (Antes)', beforeId, setBeforeId)}
        <View style={{ height: 16 }} />
        {renderThumbnailSelector('Selecionar (Depois)', afterId, setAfterId)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 10,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  angleSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  angleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  angleText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  comparisonArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    height: 320,
  },
  compareCol: {
    flex: 1,
  },
  compareLabel: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  imageFrame: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  missingImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missingLabel: {
    color: 'rgba(255,255,255,0.2)',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingTop: 24, // fading gradient effect usually requires custom SVG, blur is okay here
  },
  tagWeight: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tagDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  tagDate: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  selectorsArea: {
    marginTop: 24,
  },
  pickerBlock: {
  },
  pickerTitle: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 1,
  },
  thumbnailWrap: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  thumbnailEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailDateWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  thumbnailDateText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '700',
  }
});

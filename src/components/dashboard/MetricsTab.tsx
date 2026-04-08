import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Trophy, ChevronRight } from 'lucide-react-native';

import VolumeTrendChart from './VolumeTrendChart';
import StrengthProgressionChart from './StrengthProgressionChart';
import MuscleHeatmap from '../common/MuscleHeatmap';
import ScienceDashboard from '../ScienceDashboard';
import PremiumCard from '../common/PremiumCard';
import AnimatedPressable from '../common/AnimatedPressable';
import { sensoryManager } from '../../utils/SensoryManager';

interface MetricsTabProps {
  safeWorkouts: any[];
  volumeData: any;
  appTheme: any;
  styles: any;
  onOpenPRConsole: () => void;
}

export default function MetricsTab({ 
  safeWorkouts, 
  volumeData, 
  appTheme, 
  styles, 
  onOpenPRConsole 
}: MetricsTabProps) {
  return (
    <Animated.View entering={FadeInDown.delay(200).springify()}>
      <PremiumCard style={{ marginBottom: 20, padding: 0 }}>
        <VolumeTrendChart completedWorkouts={safeWorkouts} />
      </PremiumCard>
      
      <PremiumCard style={{ marginBottom: 20, padding: 0 }}>
        <StrengthProgressionChart completedWorkouts={safeWorkouts} />
      </PremiumCard>

      <View style={styles.metricsHeader}>
        <Text style={styles.sectionTitle}>Evolução Muscular</Text>
      </View>
      <PremiumCard style={styles.heatmapCard}>
        <MuscleHeatmap volumeData={volumeData} />
      </PremiumCard>

      <AnimatedPressable 
        onPress={() => {
          sensoryManager.trigger({ sound: 'click', haptic: 'light' });
          onOpenPRConsole();
        }}
        style={styles.prCardLink}
      >
        <PremiumCard variant="primary">
          <View style={styles.prLinkContent}>
            <Trophy color={appTheme.colors.primary} size={24} />
            <View style={styles.prLinkTexts}>
              <Text style={styles.prLinkTitle}>Consola de Recordes (PR)</Text>
              <Text style={styles.prLinkSubtitle}>Vê as tuas melhores marcas históricas.</Text>
            </View>
            <ChevronRight color={appTheme.colors.primary} size={20} />
          </View>
        </PremiumCard>
      </AnimatedPressable>

      <View style={styles.metricsHeader}>
        <Text style={styles.sectionTitle}>Treino Científico (VBT)</Text>
      </View>
      <ScienceDashboard completedWorkouts={safeWorkouts} />
    </Animated.View>
  );
}

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, Instagram, Shield, Smartphone, HeartPulse } from 'lucide-react-native';

import { useWorkoutStore } from '../store/useWorkoutStore';
import { theme } from '../theme/theme';
import AnimatedPressable from './common/AnimatedPressable';

export default function SettingsScreen() {
  const healthSyncEnabled = useWorkoutStore(state => state.healthSyncEnabled);
  const setHealthSyncEnabled = useWorkoutStore(state => state.setHealthSyncEnabled);
  const clearHistory = useWorkoutStore(state => state.clearHistory);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Definições</Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Integrações e Saúde</Text>
        <BlurView intensity={20} tint="dark" style={styles.glassCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconCircle}>
                <HeartPulse color="#FF3366" size={20} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Apple Health / Google Fit</Text>
                <Text style={styles.settingDesc}>Sincronizar Calorias e Duração ativamente no final do treino.</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.textPrimary}
              ios_backgroundColor={theme.colors.border}
              onValueChange={setHealthSyncEnabled}
              value={healthSyncEnabled}
            />
          </View>
        </BlurView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Social</Text>
        <BlurView intensity={20} tint="dark" style={styles.glassCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconCircle}>
                <Instagram color="#E1306C" size={20} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Badge Social (Stories)</Text>
                <Text style={styles.settingDesc}>Use o botão partilhar no final do treino para gerar um badge auto-ajustado.</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Geral</Text>
        <BlurView intensity={20} tint="dark" style={styles.glassCard}>
          <View style={[styles.settingRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={styles.settingInfo}>
              <View style={styles.iconCircle}>
                <Shield color="#38BDF8" size={20} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Dados e Privacidade</Text>
                <Text style={styles.settingDesc}>Os seus dados mantêm-se 100% locais.</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </View>

      <AnimatedPressable 
        style={styles.dangerZoneBtn} 
        onPress={() => {
          clearHistory();
        }}
        hapticFeedback="heavy"
        scaleTo={0.96}
      >
        <Text style={styles.dangerText}>Apagar Todo o Histórico (Danger)</Text>
      </AnimatedPressable>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: theme.typography.sizes.display,
    fontFamily: theme.typography.fonts.displayBlack,
    color: theme.colors.textPrimary,
    letterSpacing: -1,
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    marginLeft: 4,
  },
  glassCard: {
    borderRadius: theme.radii.lg,
    padding: theme.spacing.cardPadding,
    overflow: 'hidden',
    ...theme.shadows.soft,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: 20,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.bold,
    marginBottom: 4,
  },
  settingDesc: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.regular,
    lineHeight: 18,
  },
  dangerZoneBtn: {
    marginTop: theme.spacing.xxl,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: theme.radii.lg,
    backgroundColor: 'rgba(255, 51, 102, 0.05)'
  },
  dangerText: {
    color: theme.colors.danger,
    fontFamily: theme.typography.fonts.black,
    textTransform: 'uppercase',
    fontSize: theme.typography.sizes.md,
    letterSpacing: 0.5,
  }
});

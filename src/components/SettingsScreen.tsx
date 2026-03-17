import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, Instagram, Shield, Smartphone, HeartPulse } from 'lucide-react-native';

import { useWorkoutStore } from '../store/useWorkoutStore';

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
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#00E676' }}
              thumbColor="#FFF"
              ios_backgroundColor="rgba(255,255,255,0.1)"
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

      <TouchableOpacity 
        style={styles.dangerZoneBtn} 
        onPress={() => {
          // Warning: No confirmation dialog mapped in mockup
          clearHistory();
        }}
      >
        <Text style={styles.dangerText}>Apagar Todo o Histórico (Danger)</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    fontSize: 12,
    marginLeft: 4,
  },
  glassCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
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
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    lineHeight: 18,
  },
  dangerZoneBtn: {
    marginTop: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 102, 0.3)',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 51, 102, 0.1)'
  },
  dangerText: {
    color: '#FF3366',
    fontWeight: '800',
  }
});

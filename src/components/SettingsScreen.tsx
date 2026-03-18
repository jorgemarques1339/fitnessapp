import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, Instagram, Shield, Smartphone, HeartPulse, Download, Upload, FileText, Database, ChevronRight } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';

import { useWorkoutStore } from '../store/useWorkoutStore';
import { theme } from '../theme/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import AnimatedPressable from './common/AnimatedPressable';
import { soundManager } from '../utils/SoundManager';
import { Moon, Sun } from 'lucide-react-native';

export default function SettingsScreen() {
  const healthSyncEnabled = useWorkoutStore(state => state.healthSyncEnabled);
  const setHealthSyncEnabled = useWorkoutStore(state => state.setHealthSyncEnabled);
  const themeMode = useWorkoutStore(state => state.themeMode);
  const setThemeMode = useWorkoutStore(state => state.setThemeMode);
  const clearHistory = useWorkoutStore(state => state.clearHistory);
  const completedWorkouts = useWorkoutStore(state => state.completedWorkouts);
  const customRoutines = useWorkoutStore(state => state.customRoutines);
  const bodyWeightLogs = useWorkoutStore(state => state.bodyWeightLogs);
  const importData = useWorkoutStore(state => state.importData);
  const theme = useAppTheme();

  const handleExportJSON = async () => {
    soundManager.play('click');
    const data = {
      completedWorkouts,
      customRoutines,
      bodyWeightLogs,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `fitness_backup_${new Date().toISOString().split('T')[0]}.json`;

    if (Platform.OS === 'web') {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const fileUri = (FileSystem as any).cacheDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      await Sharing.shareAsync(fileUri);
    }
  };

  const handleExportCSV = async () => {
    soundManager.play('click');
    // Simple CSV for workouts
    let csv = 'Data,Rotina,Sets,Volume(kg),Duracao(ms)\n';
    completedWorkouts.forEach(w => {
      csv += `${w.date},"${w.routineTitle}",${w.totalSets},${w.totalTonnageKg},${w.durationMs || 0}\n`;
    });

    const fileName = `fitness_workouts_${new Date().toISOString().split('T')[0]}.csv`;

    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const fileUri = (FileSystem as any).cacheDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, csv);
      await Sharing.shareAsync(fileUri);
    }
  };

  const handleImportJSON = async () => {
    soundManager.play('pop');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });

      if (result.canceled) return;

      const file = result.assets[0];
      let content = '';

      if (Platform.OS === 'web') {
        content = await file.file?.text() || '';
      } else {
        content = await FileSystem.readAsStringAsync(file.uri);
      }

      const data = JSON.parse(content);
      
      // Basic validation
      if (!data.completedWorkouts && !data.customRoutines) {
        throw new Error('Ficheiro inválido');
      }

      const confirmImport = () => {
        importData(data);
        soundManager.play('success');
        if (Platform.OS !== 'web') {
          Alert.alert('Sucesso', 'Dados importados com sucesso!');
        } else {
          alert('Dados importados com sucesso!');
        }
      };

      if (Platform.OS === 'web') {
        if (window.confirm('Isto irá substituir o teu histórico atual. Continuar?')) {
          confirmImport();
        }
      } else {
        Alert.alert(
          'Confirmar Importação',
          'Isto irá substituir o teu histórico atual. Continuar?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Substituir', onPress: confirmImport, style: 'destructive' }
          ]
        );
      }
    } catch (err) {
      console.error(err);
      if (Platform.OS !== 'web') {
        Alert.alert('Erro', 'Não foi possível importar o ficheiro.');
      } else {
        alert('Erro: Não foi possível importar o ficheiro.');
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <Text style={[styles.pageTitle, { color: theme.colors.textPrimary }]}>Definições</Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Experiência Sensorial</Text>
        <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
          <View style={styles.themeToggleRow}>
            <TouchableOpacity 
              style={[styles.themeOption, themeMode === 'oled' && styles.activeThemeOption, { borderColor: themeMode === 'oled' ? theme.colors.primary : 'transparent' }]}
              onPress={() => {
                soundManager.play('pop');
                setThemeMode('oled');
              }}
            >
              <Moon color={themeMode === 'oled' ? theme.colors.primary : theme.colors.textMuted} size={20} />
              <Text style={[styles.themeOptionText, { color: themeMode === 'oled' ? theme.colors.textPrimary : theme.colors.textMuted }]}>OLED Black</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.themeOption, themeMode === 'frosted' && styles.activeThemeOption, { borderColor: themeMode === 'frosted' ? theme.colors.primary : 'transparent' }]}
              onPress={() => {
                soundManager.play('pop');
                setThemeMode('frosted');
              }}
            >
              <Sun color={themeMode === 'frosted' ? theme.colors.primary : theme.colors.textMuted} size={20} />
              <Text style={[styles.themeOptionText, { color: themeMode === 'frosted' ? theme.colors.textPrimary : theme.colors.textMuted }]}>Frosted White</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Integrações e Saúde</Text>
        <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <HeartPulse color={theme.colors.danger} size={20} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>Apple Health / Google Fit</Text>
                <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>Sincronizar Calorias e Duração ativamente no final do treino.</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.textPrimary}
              ios_backgroundColor={theme.colors.border}
              onValueChange={(val) => {
                soundManager.play('click');
                setHealthSyncEnabled(val);
              }}
              value={healthSyncEnabled}
            />
          </View>
        </BlurView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Social</Text>
        <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Instagram color="#E1306C" size={20} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>Badge Social (Stories)</Text>
                <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>Use o botão partilhar no final do treino para gerar um badge auto-ajustado.</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Gestão de Dados (Pro)</Text>
        <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
          
          <TouchableOpacity style={styles.dataButton} onPress={handleExportJSON}>
            <View style={styles.dataButtonLeft}>
              <Database color={theme.colors.primary} size={20} />
              <Text style={[styles.dataButtonText, { color: theme.colors.textPrimary }]}>Exportar Backup (JSON)</Text>
            </View>
            <Download color={theme.colors.textMuted} size={18} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity style={styles.dataButton} onPress={handleExportCSV}>
            <View style={styles.dataButtonLeft}>
              <FileText color={theme.colors.secondary} size={20} />
              <Text style={[styles.dataButtonText, { color: theme.colors.textPrimary }]}>Exportar Treinos (CSV)</Text>
            </View>
            <Download color={theme.colors.textMuted} size={18} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity style={styles.dataButton} onPress={handleImportJSON}>
            <View style={styles.dataButtonLeft}>
              <Upload color={theme.colors.accent} size={20} />
              <Text style={[styles.dataButtonText, { color: theme.colors.textPrimary }]}>Importar Backup</Text>
            </View>
            <ChevronRight color={theme.colors.textMuted} size={18} />
          </TouchableOpacity>

        </BlurView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Geral</Text>
        <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
          <View style={[styles.settingRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Shield color={theme.colors.secondary} size={20} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>Dados e Privacidade</Text>
                <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>Os seus dados mantêm-se 100% locais.</Text>
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
  },
  themeToggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    padding: 12,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  activeThemeOption: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  themeOptionText: {
    fontSize: 10,
    marginTop: 6,
    fontFamily: theme.typography.fonts.bold,
    textTransform: 'uppercase',
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  dataButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dataButtonText: {
    fontSize: 15,
    fontFamily: theme.typography.fonts.bold,
  },
  divider: {
    height: 1,
    marginVertical: 4,
    opacity: 0.5,
  }
});

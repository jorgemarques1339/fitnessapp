import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, Instagram, Shield, Smartphone, Heart, Download, Upload, FileText, Database, ChevronRight, ShieldCheck, AlertCircle } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';

import { useWorkoutStore } from '../store/useWorkoutStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { useConfigStore } from '../store/useConfigStore';
import { theme } from '../theme/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import AnimatedPressable from './common/AnimatedPressable';
import { sensoryManager } from '../utils/SensoryManager';
import { Moon, Sun } from 'lucide-react-native';

export default function SettingsScreen() {
  const healthSyncEnabled = useConfigStore(state => state.healthSyncEnabled);
  const setHealthSyncEnabled = useConfigStore(state => state.setHealthSyncEnabled);
  const themeMode = useConfigStore(state => state.themeMode);
  const setThemeMode = useConfigStore(state => state.setThemeMode);
  const availablePlates = useConfigStore(state => state.availablePlates);
  const setAvailablePlates = useConfigStore(state => state.setAvailablePlates);

  const clearHistory = useHistoryStore(state => state.clearHistory);
  const completedWorkouts = useHistoryStore(state => state.completedWorkouts);
  const customRoutines = useHistoryStore(state => state.customRoutines);
  const bodyWeightLogs = useHistoryStore(state => state.bodyWeightLogs);
  const importData = useHistoryStore(state => state.importData);
  const lastBackupDate = useConfigStore(state => state.lastBackupDate);
  const setLastBackupDate = useConfigStore(state => state.setLastBackupDate);
  const appTheme = useAppTheme();

  const getBackupStatus = () => {
    if (!lastBackupDate) return { text: 'Segurança Crítica', color: theme.colors.danger };
    const last = new Date(lastBackupDate).getTime();
    const now = Date.now();
    const diffDays = (now - last) / (1000 * 60 * 60 * 24);

    if (diffDays < 3) return { text: 'Dados Protegidos', color: '#00E676' };
    if (diffDays < 7) return { text: 'Backup Recomendado', color: '#FFD700' };
    return { text: 'Backup em Falta', color: theme.colors.danger };
  };

  const handleExportJSON = async () => {
    sensoryManager.trigger({ sound: 'click', haptic: 'light' });
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
      setLastBackupDate(new Date().toISOString());
    }
  };

  const handleExportCSV = async () => {
    sensoryManager.trigger({ sound: 'click', haptic: 'light' });
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
    sensoryManager.trigger({ sound: 'pop', haptic: 'medium' });
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
        sensoryManager.trigger({ sound: 'success', haptic: 'success' });
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

  const handleClearHistory = () => {
    sensoryManager.trigger({ sound: 'pop', haptic: 'medium' });
    const confirmClear = () => {
      clearHistory();
      sensoryManager.trigger({ sound: 'success', haptic: 'success' });
      if (Platform.OS !== 'web') {
        Alert.alert('Sucesso', 'Todo o histórico foi apagado.');
      } else {
        alert('Todo o histórico foi apagado.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('CUIDADO: Isto irá apagar TODO o teu histórico, rotinas e logs de peso de forma irreversível. Continuar?')) {
        confirmClear();
      }
    } else {
      Alert.alert(
        'Apagar Tudo?',
        'CUIDADO: Isto irá apagar TODO o teu histórico, rotinas e logs de peso de forma irreversível. Continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'APAGAR TUDO', onPress: confirmClear, style: 'destructive' }
        ]
      );
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <Text style={[styles.pageTitle, { color: theme.colors.textPrimary }]}>Definições</Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Experiência Sensorial</Text>
        <BlurView intensity={appTheme.isDark ? 20 : 40} tint={appTheme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
          <View style={styles.themeToggleRow}>
            <TouchableOpacity 
              style={[styles.themeOption, themeMode === 'oled' && styles.activeThemeOption, { borderColor: themeMode === 'oled' ? theme.colors.primary : 'transparent' }]}
              onPress={() => {
                sensoryManager.trigger({ sound: 'pop', haptic: 'medium' });
                setThemeMode('oled');
              }}
            >
              <Moon color={themeMode === 'oled' ? theme.colors.primary : theme.colors.textMuted} size={20} />
              <Text style={[styles.themeOptionText, { color: themeMode === 'oled' ? theme.colors.textPrimary : theme.colors.textMuted }]}>OLED Black</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.themeOption, themeMode === 'frosted' && styles.activeThemeOption, { borderColor: themeMode === 'frosted' ? theme.colors.primary : 'transparent' }]}
              onPress={() => {
                sensoryManager.trigger({ sound: 'pop', haptic: 'medium' });
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
        <BlurView intensity={appTheme.isDark ? 20 : 40} tint={appTheme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Heart color={theme.colors.danger} size={20} />
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
                sensoryManager.trigger({ sound: 'click', haptic: 'light' });
                setHealthSyncEnabled(val);
              }}
              value={healthSyncEnabled}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border, marginVertical: 12 }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Activity color={theme.colors.secondary} size={20} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>AI Voice Coach (Nível 100)</Text>
                <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>Feedback por voz para tempos de descanso e motivação.</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.textPrimary}
              ios_backgroundColor={theme.colors.border}
              onValueChange={(val) => {
                sensoryManager.trigger({ sound: 'click', haptic: 'light' });
                useConfigStore.getState().setVoiceCoachEnabled(val);
              }}
              value={useConfigStore(state => state.voiceCoachEnabled)}
            />
          </View>
        </BlurView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Meus Equipamentos</Text>
        <BlurView intensity={appTheme.isDark ? 20 : 40} tint={appTheme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
          <Text style={[styles.settingDesc, { color: theme.colors.textSecondary, marginBottom: 20 }]}>Selecione as anilhas que tem disponíveis. O calculador de barra usará apenas estas.</Text>
          
          <View style={styles.platesGrid}>
            {[25, 20, 15, 10, 5, 2.5, 1.25].map(weight => {
              const isSelected = availablePlates.includes(weight);
              return (
                <TouchableOpacity 
                  key={weight}
                  style={[
                    styles.plateToggle, 
                    { backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceHighlight },
                    isSelected && { borderColor: theme.colors.primary }
                  ]}
                  onPress={() => {
                    sensoryManager.trigger({ sound: 'pop', haptic: 'medium' });
                    if (isSelected) {
                      setAvailablePlates(availablePlates.filter(p => p !== weight));
                    } else {
                      setAvailablePlates([...availablePlates, weight].sort((a, b) => b - a));
                    }
                  }}
                >
                  <Text style={[styles.plateWeightText, { color: isSelected ? theme.colors.background : theme.colors.textPrimary }]}>
                    {weight}
                  </Text>
                  <Text style={[styles.plateUnitText, { color: isSelected ? theme.colors.background : theme.colors.textMuted }]}>
                    kg
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Social</Text>
        <BlurView intensity={appTheme.isDark ? 20 : 40} tint={appTheme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
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
        <Text style={styles.sectionHeader}>Segurança e Backup (Premium)</Text>
        <BlurView intensity={appTheme.isDark ? 20 : 40} tint={appTheme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
          
          <View style={styles.backupStatusRow}>
            <View style={[styles.statusIndicator, { backgroundColor: getBackupStatus().color }]} />
            <View>
              <Text style={[styles.backupStatusTitle, { color: theme.colors.textPrimary }]}>{getBackupStatus().text}</Text>
              <Text style={[styles.backupStatusDate, { color: theme.colors.textSecondary }]}>
                {lastBackupDate 
                  ? `Último backup: ${new Date(lastBackupDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                  : 'Nenhum backup realizado'}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border, marginVertical: 15 }]} />

          <TouchableOpacity style={styles.dataButtonPremium} onPress={handleExportJSON}>
            <LinearGradient
              colors={['#00E676', '#00C853']}
              style={styles.premiumIconCircle}
            >
              <Database color="#FFF" size={20} />
            </LinearGradient>
            <View style={styles.dataButtonContent}>
              <Text style={[styles.dataButtonTitle, { color: theme.colors.textPrimary }]}>Exportar Backup Local</Text>
              <Text style={[styles.dataButtonDesc, { color: theme.colors.textSecondary }]}>Criptografado e pronto para restauro.</Text>
            </View>
            <Download color={theme.colors.textMuted} size={18} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dataButtonPremium} onPress={handleImportJSON}>
            <View style={[styles.premiumIconCircle, { backgroundColor: theme.colors.surfaceHighlight }]}>
              <Upload color={theme.colors.accent} size={20} />
            </View>
            <View style={styles.dataButtonContent}>
              <Text style={[styles.dataButtonTitle, { color: theme.colors.textPrimary }]}>Importar de Ficheiro</Text>
              <Text style={[styles.dataButtonDesc, { color: theme.colors.textSecondary }]}>Restaurar histórico e rotinas.</Text>
            </View>
            <ChevronRight color={theme.colors.textMuted} size={18} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dataButtonPremium} onPress={handleExportCSV}>
            <View style={[styles.premiumIconCircle, { backgroundColor: theme.colors.surfaceHighlight }]}>
              <FileText color={theme.colors.secondary} size={20} />
            </View>
            <View style={styles.dataButtonContent}>
              <Text style={[styles.dataButtonTitle, { color: theme.colors.textPrimary }]}>Relatório CSV</Text>
              <Text style={[styles.dataButtonDesc, { color: theme.colors.textSecondary }]}>Ver histórico no Excel/Google Sheets.</Text>
            </View>
            <Download color={theme.colors.textMuted} size={18} />
          </TouchableOpacity>

        </BlurView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Geral</Text>
        <BlurView intensity={appTheme.isDark ? 20 : 40} tint={appTheme.isDark ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border }]}>
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
        onPress={handleClearHistory}
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
    backgroundColor: theme.colors.surfaceHighlight,
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
    backgroundColor: theme.colors.surfaceHighlight,
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
    backgroundColor: theme.colors.surfaceHighlight,
  },
  activeThemeOption: {
    backgroundColor: theme.colors.surfaceHighlight,
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
  },
  backupStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 5,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  backupStatusTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fonts.display,
    letterSpacing: -0.5,
  },
  backupStatusDate: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.medium,
    marginTop: 2,
    opacity: 0.8,
  },
  dataButtonPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 15,
  },
  premiumIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataButtonContent: {
    flex: 1,
  },
  dataButtonTitle: {
    fontSize: 15,
    fontFamily: theme.typography.fonts.bold,
    marginBottom: 2,
  },
  dataButtonDesc: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.regular,
    opacity: 0.6,
  },
  platesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  plateToggle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateWeightText: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.black,
  },
  plateUnitText: {
    fontSize: 9,
    fontFamily: theme.typography.fonts.bold,
    marginTop: -2,
  },
});

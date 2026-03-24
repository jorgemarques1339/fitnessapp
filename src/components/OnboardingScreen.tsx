import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { 
  Trophy, 
  Settings, 
  Heart, 
  ChevronRight, 
  Sparkles,
  Zap,
  Target
} from 'lucide-react-native';
import { useConfigStore } from '../store/useConfigStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { theme as staticTheme } from '../theme/theme';
import AnimatedPressable from './common/AnimatedPressable';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const { setExperienceLevel, setOnboardingCompleted } = useConfigStore();
  const [step, setStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const handleFinish = () => {
    setExperienceLevel(selectedLevel);
    setOnboardingCompleted(true);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
            <Sparkles color={theme.colors.primary} size={72} style={styles.icon} />
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>A Evolução do seu Treino</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Bem-vindo ao Antigravity. A elite física exige precisão absoluta e tecnologia de ponta.
            </Text>
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
            <Target color={theme.colors.secondary} size={72} style={styles.icon} />
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Seu Nível Atual</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary, marginBottom: 40 }]}>
              A calibragem da nossa IA depende do seu histórico para evitar plateau.
            </Text>

            <View style={styles.levelContainer}>
              {[
                { id: 'beginner', label: 'INICIANTE', desc: 'Progressão linear e saltos de carga consistentes.', icon: <Zap size={22} color={theme.colors.primary} /> },
                { id: 'intermediate', label: 'INTERMÉDIO', desc: 'Equilíbrio estratégico entre volume e intensidade.', icon: <Target size={22} color={theme.colors.secondary} /> },
                { id: 'advanced', label: 'AVANÇADO', desc: 'Micro-progressão com foco técnico em densidade.', icon: <Trophy size={22} color={theme.colors.accent} /> },
              ].map((lvl) => (
                <TouchableOpacity
                  key={lvl.id}
                  style={[
                    styles.levelCard,
                    { backgroundColor: theme.colors.glassSurface },
                    selectedLevel === lvl.id && { borderColor: theme.colors.primary, borderWidth: 1.5, backgroundColor: 'rgba(0, 230, 118, 0.05)' }
                  ]}
                  onPress={() => setSelectedLevel(lvl.id as any)}
                >
                  <View style={styles.levelHeader}>
                    {lvl.icon}
                    <Text style={[styles.levelLabel, { color: theme.colors.textPrimary }]}>{lvl.label}</Text>
                  </View>
                  <Text style={[styles.levelDesc, { color: theme.colors.textMuted }]}>{lvl.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
            <Heart color={theme.colors.danger} size={72} style={styles.icon} />
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Sincronia Total</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Integração completa com Apple Health e Google Fit para métricas biomecânicas.
            </Text>
            
            <BlurView intensity={20} tint="dark" style={[styles.healthStatus, { backgroundColor: theme.colors.glassSurface, borderColor: theme.colors.glassBorder }]}>
              <Text style={{ color: theme.colors.primary, fontSize: 10, fontFamily: theme.typography.fonts.black, letterSpacing: 2 }}>ALTA PERFORMANCE</Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18, fontFamily: theme.typography.fonts.medium }}>
                Otimiza a precisão metabólica e sincroniza os teus anéis de atividade em tempo real.
              </Text>
            </BlurView>
          </Animated.View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.colors.gradients.liquid as any}
        style={[styles.gradient, { opacity: 0.1 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {renderStep()}

      <View style={styles.footer}>
        <View style={styles.dots}>
          {[1, 2, 3].map(i => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                step === i && { backgroundColor: theme.colors.primary, width: 32 }
              ]} 
            />
          ))}
        </View>

        <TouchableOpacity 
          style={styles.nextBtn}
          onPress={() => step < 3 ? setStep(step + 1) : handleFinish()}
        >
          <LinearGradient
            colors={theme.colors.gradients.liquid as any}
            style={styles.nextGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.nextText}>{step === 3 ? 'ELITE START' : 'NEXT PHASE'}</Text>
            <ChevronRight color="#000" size={20} strokeWidth={3} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  gradient: {
    position: 'absolute',
    top: -height * 0.1,
    left: -width * 0.2,
    right: -width * 0.2,
    height: height * 0.5,
    borderRadius: width,
    transform: [{ scale: 1.5 }],
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontFamily: staticTheme.typography.fonts.displayBlack,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -1.5,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: staticTheme.typography.fonts.medium,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  nextBtn: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: staticTheme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  nextText: {
    color: '#000',
    fontFamily: staticTheme.typography.fonts.black,
    fontSize: 12,
    letterSpacing: 1,
  },
  levelContainer: {
    width: '100%',
    gap: 16,
  },
  levelCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  levelLabel: {
    fontSize: 14,
    fontFamily: staticTheme.typography.fonts.black,
    letterSpacing: 1,
  },
  levelDesc: {
    fontSize: 12,
    fontFamily: staticTheme.typography.fonts.medium,
    lineHeight: 18,
    opacity: 0.8,
  },
  healthStatus: {
    marginTop: 40,
    padding: 24,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
    borderWidth: 1,
  }
});

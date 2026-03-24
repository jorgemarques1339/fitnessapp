import React from 'react';
import { View, StyleSheet, Dimensions, Image as RNImage } from 'react-native';
import { 
  Canvas, 
  Rect, 
  Group, 
  Text as SkiaText, 
  useFont, 
  vec,
  LinearGradient,
  BlurMask,
  RoundedRect,
  Shadow,
  Image,
  useImage
} from '@shopify/react-native-skia';
import { useAppTheme } from '../../hooks/useAppTheme';

interface WorkoutShareCardProps {
  workoutTitle: string;
  date: string;
  totalVolume: string;
  duration: string;
  topExercises: string[];
  bestSet?: { exerciseName: string; weight: string; reps: string; rm1: number } | null;
  backgroundUri?: string | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = CARD_WIDTH * (16 / 9);

export default function WorkoutShareCard({ 
  workoutTitle, 
  date, 
  totalVolume, 
  duration, 
  topExercises,
  bestSet,
  backgroundUri
}: WorkoutShareCardProps) {
  const theme = useAppTheme();
  const bgImage = backgroundUri ? useImage(backgroundUri) : null;
  
  const displayFont = useFont(require('../../../assets/fonts/Outfit-Black.ttf'), 32);
  const regularFont = useFont(require('../../../assets/fonts/Inter-Regular.ttf'), 14);
  const boldFont = useFont(require('../../../assets/fonts/Inter-Bold.ttf'), 22);
  const smallFont = useFont(require('../../../assets/fonts/Inter-Medium.ttf'), 11);

  if (!displayFont || !regularFont || !boldFont || !smallFont) return <View style={styles.placeholder} />;

  return (
    <View style={styles.container}>
      <Canvas style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
        {/* Background Layer */}
        <Group>
          {bgImage ? (
            <Image 
              image={bgImage} 
              x={0} 
              y={0} 
              width={CARD_WIDTH} 
              height={CARD_HEIGHT} 
              fit="cover" 
            />
          ) : (
            <RoundedRect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} r={24}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(CARD_WIDTH, CARD_HEIGHT)}
                colors={['#000', '#1A1A1A', '#000']}
              />
            </RoundedRect>
          )}
          {/* Dark Overlay for legibility */}
          <Rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} color="rgba(0,0,0,0.4)" />
        </Group>

        {/* Header Branding */}
        <Group transform={[{ translateY: 40 }]}>
            <SkiaText x={CARD_WIDTH / 2 - 50} y={0} text="ANTIGRAVITY" font={smallFont} color="rgba(255,255,255,0.4)" />
            <Rect x={CARD_WIDTH / 2 - 20} y={10} width={40} height={2} color={theme.colors.primary} />
        </Group>

        {/* Main Stats Block */}
        <Group transform={[{ translateY: 100 }]}>
          <SkiaText x={30} y={0} text={date.toUpperCase()} font={smallFont} color={theme.colors.primary} />
          <SkiaText x={30} y={45} text={workoutTitle.toUpperCase()} font={displayFont} color="#FFFFFF" />
        </Group>

        {/* Highlight: Best Set (Premium Glass Block) */}
        {bestSet && (
          <Group transform={[{ translateY: 200 }]}>
            <RoundedRect x={20} y={0} width={CARD_WIDTH - 40} height={120} r={24} color="rgba(255,255,255,0.08)">
               <BlurMask blur={10} style="inner" />
            </RoundedRect>
            <SkiaText x={40} y={35} text="MELHOR SÉRIE DO DIA" font={smallFont} color="rgba(255,255,255,0.5)" />
            <SkiaText x={40} y={70} text={bestSet.exerciseName} font={boldFont} color="#FFFFFF" />
            <SkiaText x={40} y={100} text={`${bestSet.weight}kg x ${bestSet.reps} reps • ${bestSet.rm1}kg 1RM`} font={regularFont} color={theme.colors.secondary} />
          </Group>
        )}

        {/* Secondary Stats Row */}
        <Group transform={[{ translateY: 360 }]}>
           <RoundedRect x={20} y={0} width={(CARD_WIDTH - 50) / 2} height={80} r={20} color="rgba(255,255,255,0.05)" />
           <SkiaText x={40} y={30} text="VOLUME" font={smallFont} color="rgba(255,255,255,0.4)" />
           <SkiaText x={40} y={60} text={`${totalVolume}T`} font={boldFont} color="#FFFFFF" />

           <Group transform={[{ translateX: (CARD_WIDTH - 50) / 2 + 10 }]}>
             <RoundedRect x={0} y={0} width={(CARD_WIDTH - 50) / 2} height={80} r={20} color="rgba(255,255,255,0.05)" />
             <SkiaText x={20} y={30} text="DURAÇÃO" font={smallFont} color="rgba(255,255,255,0.4)" />
             <SkiaText x={20} y={60} text={duration} font={boldFont} color="#FFFFFF" />
           </Group>
        </Group>

        {/* Exercise List */}
        <Group transform={[{ translateY: 480 }]}>
          <SkiaText x={30} y={0} text="RESUMO DO TREINO" font={smallFont} color="rgba(255,255,255,0.3)" />
          {topExercises.map((ex, i) => (
            <Group key={i} transform={[{ translateY: 30 + i * 35 }]}>
              <RoundedRect x={30} y={-10} width={4} height={18} r={2} color={theme.colors.primary} opacity={0.5} />
              <SkiaText x={45} y={5} text={ex} font={regularFont} color="#FFFFFF" />
            </Group>
          ))}
        </Group>

        {/* Premium Badge Footer */}
        <Group transform={[{ translateY: CARD_HEIGHT - 80 }]}>
           <LinearGradient
             start={vec(0, 0)}
             end={vec(CARD_WIDTH, 0)}
             colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
           />
           <Rect x={30} y={0} width={CARD_WIDTH - 60} height={1} />
           <SkiaText x={CARD_WIDTH / 2 - 40} y={40} text="SUPERHUMAN" font={smallFont} color={theme.colors.secondary} />
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#111',
    borderRadius: 24,
  }
});

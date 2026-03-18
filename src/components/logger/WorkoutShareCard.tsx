import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
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
  Shadow
} from '@shopify/react-native-skia';
import { useAppTheme } from '../../hooks/useAppTheme';

interface WorkoutShareCardProps {
  workoutTitle: string;
  date: string;
  totalVolume: string;
  duration: string;
  topExercises: string[];
}

const CARD_WIDTH = 340;
const CARD_HEIGHT = 500;

export default function WorkoutShareCard({ 
  workoutTitle, 
  date, 
  totalVolume, 
  duration, 
  topExercises 
}: WorkoutShareCardProps) {
  const theme = useAppTheme();
  
  // Weights for fonts - using fallbacks if custom fonts aren't loaded in Skia environment
  const displayFont = useFont(require('../../../assets/fonts/Outfit-Black.ttf'), 32);
  const regularFont = useFont(require('../../../assets/fonts/Inter-Regular.ttf'), 14);
  const boldFont = useFont(require('../../../assets/fonts/Inter-Bold.ttf'), 18);
  const smallFont = useFont(require('../../../assets/fonts/Inter-Medium.ttf'), 12);

  if (!displayFont || !regularFont || !boldFont || !smallFont) return <View style={styles.placeholder} />;

  return (
    <View style={styles.container}>
      <Canvas style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
        {/* Main Card Background */}
        <RoundedRect
          x={10}
          y={10}
          width={CARD_WIDTH - 20}
          height={CARD_HEIGHT - 20}
          r={24}
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(CARD_WIDTH, CARD_HEIGHT)}
            colors={['#1A1A1A', '#050505', '#121212']}
          />
          <Shadow dx={0} dy={10} blur={20} color="rgba(0,0,0,0.5)" />
        </RoundedRect>

        {/* Glossy Overlay */}
        <Group opacity={0.1}>
           <Rect x={10} y={10} width={CARD_WIDTH - 20} height={100}>
              <LinearGradient 
                start={vec(0, 0)} 
                end={vec(0, 100)} 
                colors={['#FFFFFF', 'transparent']} 
              />
           </Rect>
        </Group>

        {/* Title */}
        <SkiaText
          x={30}
          y={60}
          text="WORKOUT SUMMARY"
          font={smallFont}
          color={theme.colors.primary}
        />
        
        <SkiaText
          x={30}
          y={105}
          text={workoutTitle.toUpperCase()}
          font={displayFont}
          color="#FFFFFF"
        />

        <SkiaText
          x={30}
          y={130}
          text={date}
          font={regularFont}
          color="rgba(255,255,255,0.5)"
        />

        {/* Stats Row */}
        <Group transform={[{ translateY: 180 }]}>
           {/* Volume */}
           <Group transform={[{ translateX: 30 }]}>
              <SkiaText x={0} y={0} text="TOTAL VOLUME" font={smallFont} color="rgba(255,255,255,0.4)" />
              <SkiaText x={0} y={35} text={`${totalVolume} kg`} font={boldFont} color={theme.colors.secondary} />
           </Group>

           {/* Duration */}
           <Group transform={[{ translateX: 180 }]}>
              <SkiaText x={0} y={0} text="DURATION" font={smallFont} color="rgba(255,255,255,0.4)" />
              <SkiaText x={0} y={35} text={duration} font={boldFont} color="#FFFFFF" />
           </Group>
        </Group>

        {/* Top Exercises Section */}
        <Group transform={[{ translateY: 280 }]}>
           <SkiaText x={30} y={0} text="TOP EXERCISES" font={smallFont} color="rgba(255,255,255,0.4)" />
           
           {topExercises.map((ex, i) => (
             <Group key={i} transform={[{ translateY: 30 + i * 40 }]}>
                {/* Accent line */}
                <Rect x={30} y={8} width={2} height={20} color={theme.colors.primary} />
                <SkiaText x={42} y={25} text={ex} font={regularFont} color="#FFFFFF" />
             </Group>
           ))}
        </Group>

        {/* Branding */}
        <Group transform={[{ translateY: CARD_HEIGHT - 60 }]}>
           <Rect x={30} y={0} width={CARD_WIDTH - 60} height={1} color="rgba(255,255,255,0.1)" />
           <SkiaText
             x={30}
             y={35}
             text="ANTIGRAVITY FITNESS"
             font={smallFont}
             color="rgba(255,255,255,0.3)"
           />
           <SkiaText
             x={CARD_WIDTH - 100}
             y={35}
             text="PREMIUM OVR"
             font={smallFont}
             color={theme.colors.accent}
           />
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  placeholder: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#111',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#333',
  }
});

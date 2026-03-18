import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop, G, Text as SvgText, Path } from 'react-native-svg';
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

  return (
    <View style={styles.container}>
      <Svg width={CARD_WIDTH} height={CARD_HEIGHT} viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}>
        <Defs>
          <LinearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#1A1A1A" />
            <Stop offset="0.5" stopColor="#050505" />
            <Stop offset="1" stopColor="#121212" />
          </LinearGradient>
          <LinearGradient id="glossGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.1" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Card Body */}
        <Rect
          x="10"
          y="10"
          width={CARD_WIDTH - 20}
          height={CARD_HEIGHT - 20}
          rx="24"
          fill="url(#cardGrad)"
        />

        {/* Gloss */}
        <Rect
            x="10"
            y="10"
            width={CARD_WIDTH - 20}
            height="100"
            rx="24"
            fill="url(#glossGrad)"
        />

        {/* Header Text */}
        <SvgText
          x="30"
          y="60"
          fill={theme.colors.primary}
          fontSize="12"
          fontWeight="bold"
          fontFamily="System"
        >
          WORKOUT SUMMARY
        </SvgText>

        <SvgText
          x="30"
          y="100"
          fill="#FFFFFF"
          fontSize="30"
          fontWeight="900"
          fontFamily="System"
        >
          {workoutTitle.toUpperCase().substring(0, 18)}
        </SvgText>

        <SvgText
          x="30"
          y="125"
          fill="rgba(255,255,255,0.5)"
          fontSize="14"
          fontFamily="System"
        >
          {date}
        </SvgText>

        {/* Stats Section */}
        <G translate="30, 200">
           <SvgText x="0" y="0" fill="rgba(255,255,255,0.4)" fontSize="12" fontWeight="bold">TOTAL VOLUME</SvgText>
           <SvgText x="0" y="30" fill={theme.colors.secondary} fontSize="20" fontWeight="900">{totalVolume} kg</SvgText>
        </G>

        <G translate="180, 200">
           <SvgText x="0" y="0" fill="rgba(255,255,255,0.4)" fontSize="12" fontWeight="bold">DURATION</SvgText>
           <SvgText x="0" y="30" fill="#FFFFFF" fontSize="20" fontWeight="900">{duration}</SvgText>
        </G>

        {/* Top Exercises */}
        <G translate="30, 300">
           <SvgText x="0" y="0" fill="rgba(255,255,255,0.4)" fontSize="12" fontWeight="bold">TOP EXERCISES</SvgText>
           
           {topExercises.map((ex, i) => (
             <G key={i} translate={`0, ${30 + i * 40}`}>
                <Rect x="0" y="8" width="2" height="20" fill={theme.colors.primary} />
                <SvgText x="12" y="24" fill="#FFFFFF" fontSize="14" fontWeight="500">{ex}</SvgText>
             </G>
           ))}
        </G>

        {/* Footer */}
        <G translate="30, 440">
           <Rect x="0" y="0" width={CARD_WIDTH - 60} height="1" fill="rgba(255,255,255,0.1)" />
           <SvgText x="0" y="35" fill="rgba(255,255,255,0.3)" fontSize="12" fontWeight="bold">ANTIGRAVITY FITNESS</SvgText>
           <SvgText x={CARD_WIDTH - 120} y="35" fill={theme.colors.accent} fontSize="12" fontWeight="bold">PREMIUM OVR</SvgText>
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    boxShadow: '0px 10px 30px rgba(0,0,0,0.5)'
  }
});

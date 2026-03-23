declare module 'react-native-confetti-cannon' {
  import { Component } from 'react';

  export interface ConfettiCannonProps {
    count?: number;
    origin?: { x: number; y: number };
    explosionSpeed?: number;
    fallSpeed?: number;
    colors?: string[];
    fadeOut?: boolean;
    autoStart?: boolean;
    autoStartDelay?: number;
  }

  export default class ConfettiCannon extends Component<ConfettiCannonProps> {}
}

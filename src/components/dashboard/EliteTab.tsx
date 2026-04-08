import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import EliteDuelWidget from '../EliteDuelWidget';
import GlobalTonnageWidget from '../GlobalTonnageWidget';
import HallOfFame from '../HallOfFame';

interface EliteTabProps {
  runningDuels: any[];
}

export default function EliteTab({ runningDuels }: EliteTabProps) {
  return (
    <Animated.View entering={FadeInDown.delay(200).springify()}>
      {runningDuels.map(duel => (
        <EliteDuelWidget key={duel.id} duel={duel} />
      ))}
      <GlobalTonnageWidget />
      <HallOfFame />
    </Animated.View>
  );
}

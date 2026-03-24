export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetGoal: number; // e.g. 1000 reps or 50000kg
  unit: 'reps' | 'kg' | 'sessions';
  exerciseId?: string; // specific exercise if needed
  muscleGroup?: string;
  startDate: string;
  endDate: string;
  badgeType: string;
}

export const COMMUNITY_CHALLENGES: Challenge[] = [
  {
    id: 'challenge-squat-30',
    title: 'Squat King: 30 Dias',
    description: 'Completa 1000 agachamentos cumulativos em 30 dias para ganhar a coroa.',
    targetGoal: 1000,
    unit: 'reps',
    exerciseId: 'ex-squat',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    badgeType: 'squat_king'
  },
  {
    id: 'challenge-volume-50k',
    title: 'Guerreiro do Volume',
    description: 'Move um total de 50.000kg num período de 7 dias.',
    targetGoal: 50000,
    unit: 'kg',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    badgeType: 'volume_warrior'
  },
  {
    id: 'challenge-consistency',
    title: 'Mestre da Consistência',
    description: 'Treina 5 vezes numa única semana.',
    targetGoal: 5,
    unit: 'sessions',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    badgeType: 'streak_hero'
  }
];

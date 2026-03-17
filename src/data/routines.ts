import { ExerciseDef, EXERCISE_DATABASE } from './exercises';

export type { ExerciseDef };

export interface RoutineDef {
  id: string;
  title: string;
  subtitle: string;
  exercises: ExerciseDef[];
}

const getEx = (id: string): ExerciseDef => {
  const ex = EXERCISE_DATABASE.find(e => e.id === id);
  if (!ex) throw new Error(`Exercise ${id} not found in database!`);
  return ex;
};

export const ROUTINES: RoutineDef[] = [
  {
    id: 'day1',
    title: 'Dia 1: Peito Superior, Ombros e Tríceps',
    subtitle: 'Foco clavicular e lateral',
    exercises: [
      getEx('peito1'), getEx('peito2'), getEx('peito3'), getEx('peito4'),
      getEx('ombro1'), getEx('triceps1'), getEx('triceps2')
    ]
  },
  {
    id: 'day2',
    title: 'Dia 2: Costas e Bíceps',
    subtitle: 'Construindo o formato em "V" clássico',
    exercises: [
      getEx('costas1'), getEx('costas2'), getEx('costas3'), getEx('costas4'),
      getEx('biceps1'), getEx('biceps2')
    ]
  },
  {
    id: 'day3',
    title: 'Dia 3: Pernas Completo',
    subtitle: 'Treino massivo para libertar testosterona',
    exercises: [
      getEx('perna1'), getEx('perna2'), getEx('perna3'), 
      getEx('perna4'), getEx('perna5'), getEx('perna6')
    ]
  },
  {
    id: 'day4',
    title: 'Dia 4: Ombros, Bíceps e Tríceps',
    subtitle: 'Foco no desenvolvimento do ombro 3D',
    exercises: [
      getEx('ombro_dia4_1'), getEx('ombro_dia4_2'), getEx('ombro_dia4_3'), getEx('ombro_dia4_4'),
      getEx('biceps_dia4_1'), getEx('biceps_dia4_2'), getEx('triceps_dia4_1')
    ]
  }
];

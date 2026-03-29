export type MuscleGroup = 
  | 'Chest' 
  | 'Back' 
  | 'Shoulders' 
  | 'Biceps' 
  | 'Triceps' 
  | 'Quads' 
  | 'Hamstrings' 
  | 'Glutes' 
  | 'Calves' 
  | 'Core'
  | 'Forearms'
  | 'Rear Delts'
  | 'Upper Back'
  | 'Lower Back'
  | 'Abductors'
  | 'Adductors';

export type EquipmentType = 
  | 'Barbell'
  | 'Dumbbell'
  | 'Machine'
  | 'Cable'
  | 'Bodyweight'
  | 'Smith';

export interface ExerciseDef {
  id: string;
  name: string;
  targetSets: number;
  notes: string;
  videoUrl?: string;
  category: MuscleGroup;
  equipment: EquipmentType;
  secondaryMuscles?: MuscleGroup[];
  unilateral?: boolean;
}

export const EXERCISE_DATABASE: ExerciseDef[] = [
  {
    id: 'peito1',
    name: 'Supino Inclinado com Halteres',
    targetSets: 4,
    notes: 'Dá maior amplitude de movimento que a barra e recruta o feixe clavicular a 100%. Mantenha a inclinação em 30 a 45 graus. Não bata os halteres no topo.',
    videoUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
    category: 'Chest',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Shoulders', 'Triceps'],
    unilateral: true
  },
  {
    id: 'peito2',
    name: 'Supino Inclinado na Máquina Smith',
    targetSets: 3,
    notes: 'Permite focar apenas na contração sem ter de estabilizar o peso. Desça até a barra tocar o peito superior suavemente.',
    videoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    category: 'Chest',
    equipment: 'Smith',
    secondaryMuscles: ['Shoulders', 'Triceps']
  },
  {
    id: 'peito3',
    name: 'Supino Plano com Barra ou Máquina',
    targetSets: 3,
    notes: 'Para o volume geral do peitoral. Foque em manter as escápulas retraídas o tempo todo.',
    category: 'Chest',
    equipment: 'Barbell',
    secondaryMuscles: ['Shoulders', 'Triceps']
  },
  {
    id: 'peito4',
    name: 'Crossover em Polia Baixa',
    targetSets: 3,
    notes: 'O movimento de baixo para cima na polia isola a parte superior do peito. No topo, aperte o peitoral por 1 segundo.',
    videoUrl: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?q=80&w=800&auto=format&fit=crop',
    category: 'Chest',
    equipment: 'Cable',
    secondaryMuscles: ['Shoulders'],
    unilateral: true
  },
  {
    id: 'ombro1',
    name: 'Elevações Laterais com Halteres',
    targetSets: 3,
    notes: 'Dá ilusão de ombros mais largos (formato V). O deltoide frontal já foi trabalhado.',
    videoUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
    category: 'Shoulders',
    equipment: 'Dumbbell',
    unilateral: true
  },
  {
    id: 'triceps1',
    name: 'Tríceps na Polia com Corda',
    targetSets: 3,
    notes: 'Contração pesada no fim do movimento.',
    videoUrl: 'https://images.unsplash.com/photo-1530822847156-5b8af078e38d?q=80&w=800&auto=format&fit=crop',
    category: 'Triceps',
    equipment: 'Cable'
  },
  {
    id: 'triceps2',
    name: 'Extensão de Tríceps acima da cabeça',
    targetSets: 3,
    notes: 'Foca no alongamento da cabeça longa do tríceps.',
    videoUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
    category: 'Triceps',
    equipment: 'Cable'
  },
  {
    id: 'costas1',
    name: 'Puxada na Polia Alta ou Elevações',
    targetSets: 4,
    notes: 'Foco total na largura das dorsais.',
    videoUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=800&auto=format&fit=crop',
    category: 'Back',
    equipment: 'Cable',
    secondaryMuscles: ['Biceps', 'Upper Back']
  },
  {
    id: 'costas2',
    name: 'Remada Curvada com Barra',
    targetSets: 4,
    notes: 'Foco na espessura das costas. Contraia as escápulas.',
    videoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    category: 'Back',
    equipment: 'Barbell',
    secondaryMuscles: ['Biceps', 'Lower Back', 'Upper Back']
  },
  {
    id: 'costas3',
    name: 'Remada Unilateral com Halter',
    targetSets: 3,
    notes: 'Aproveite para alongar bem o dorsal no final da descida.',
    videoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
    category: 'Back',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Biceps', 'Upper Back'],
    unilateral: true
  },
  {
    id: 'costas4',
    name: 'Face Pull na Polia',
    targetSets: 3,
    notes: 'Excelente para deltoide posterior e saúde postural.',
    videoUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop',
    category: 'Rear Delts',
    equipment: 'Cable',
    secondaryMuscles: ['Shoulders', 'Upper Back']
  },
  {
    id: 'biceps1',
    name: 'Curl de Bíceps com Barra W',
    targetSets: 3,
    notes: 'Carga pesada para volume do bíceps.',
    videoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
    category: 'Biceps',
    equipment: 'Barbell',
    secondaryMuscles: ['Forearms']
  },
  {
    id: 'biceps2',
    name: 'Curl Bíceps no Banco Inclinado',
    targetSets: 3,
    notes: 'Máximo alongamento. Trabalhe com halteres controlando a excêntrica.',
    videoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
    category: 'Biceps',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Forearms'],
    unilateral: true
  },
  {
    id: 'perna1',
    name: 'Agachamento Livre ou Hack Squat',
    targetSets: 4,
    notes: 'Exercício base pesado. Desça até quebrar os 90 graus se a mobilidade permitir.',
    category: 'Quads',
    equipment: 'Barbell',
    secondaryMuscles: ['Glutes', 'Lower Back', 'Adductors']
  },
  {
    id: 'perna2',
    name: 'Leg Press',
    targetSets: 4,
    notes: 'Pés mais abaixo na plataforma para focar nos quadríceps.',
    category: 'Quads',
    equipment: 'Machine',
    secondaryMuscles: ['Glutes', 'Adductors']
  },
  {
    id: 'perna3',
    name: 'Peso Morto Romeno (RDL)',
    targetSets: 4,
    notes: 'Crucial para isquiotibiais. Mantenha as pernas semi-estendidas e sinta o alongamento.',
    category: 'Hamstrings',
    equipment: 'Barbell',
    secondaryMuscles: ['Glutes', 'Lower Back']
  },
  {
    id: 'perna4',
    name: 'Cadeira Extensora',
    targetSets: 3,
    notes: 'Faça as últimas repetições até à falha para definir.',
    category: 'Quads',
    equipment: 'Machine'
  },
  {
    id: 'perna5',
    name: 'Mesa Flexora',
    targetSets: 3,
    notes: 'Isolamento forte para a parte de trás da coxa.',
    category: 'Hamstrings',
    equipment: 'Machine'
  },
  {
    id: 'perna6',
    name: 'Elevação de Gémeos',
    targetSets: 4,
    notes: 'Pode ser em pé ou no Leg Press.',
    category: 'Calves',
    equipment: 'Machine'
  },
  {
    id: 'ombro_dia4_1',
    name: 'Press de Ombros com Halteres',
    targetSets: 4,
    notes: 'Sentado. O foco agora é construir massa no ombro com estabilidade.',
    category: 'Shoulders',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Triceps'],
    unilateral: true
  },
  {
    id: 'ombro_dia4_2',
    name: 'Elevações Laterais na Polia',
    targetSets: 3,
    notes: 'Mantém a tensão constante no músculo diferentemente do halter.',
    category: 'Shoulders',
    equipment: 'Cable',
    unilateral: true
  },
  {
    id: 'ombro_dia4_3',
    name: 'Crucifixo Invertido na Máquina',
    targetSets: 3,
    notes: 'Foco estrito na parte de trás do ombro (deltoide posterior).',
    category: 'Rear Delts',
    equipment: 'Machine',
    secondaryMuscles: ['Upper Back']
  },
  {
    id: 'ombro_dia4_4',
    name: 'Encolhimentos com Halteres',
    targetSets: 3,
    notes: 'Trapézios densos. Segure o pico de contração por 1 segundo.',
    category: 'Upper Back',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Forearms'],
    unilateral: true
  },
  {
    id: 'biceps_dia4_1',
    name: 'Curl Martelo com Halteres',
    targetSets: 3,
    notes: 'Trabalha o braquial. Empurra o bíceps para fora, braço parece maior.',
    category: 'Biceps',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Forearms'],
    unilateral: true
  },
  {
    id: 'biceps_dia4_2',
    name: 'Curl Concentrado ou Banco Scott',
    targetSets: 3,
    notes: 'Pico de contração do bíceps superior.',
    category: 'Biceps',
    equipment: 'Dumbbell',
    unilateral: true
  },
  {
    id: 'triceps_dia4_1',
    name: 'Skullcrushers (Barra W) ou Kickback',
    targetSets: 3,
    notes: 'Troca para kickback se o cotovelo estiver fatigado para o treino de peito do dia a seguir.',
    category: 'Triceps',
    equipment: 'Barbell'
  }
];

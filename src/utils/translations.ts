import { MuscleGroup, EquipmentType } from '../data/exercises';

export const translateMuscleGroup = (muscle: MuscleGroup | 'Todos' | string): string => {
  const map: Record<string, string> = {
    'Todos': '✨ Todos',
    'Chest': 'Peito',
    'Back': 'Dorsais',
    'Shoulders': 'Ombros',
    'Biceps': 'Bíceps',
    'Triceps': 'Tríceps',
    'Quads': 'Quadríceps',
    'Hamstrings': 'Isquiotibiais',
    'Glutes': 'Glúteos',
    'Calves': 'Gémeos',
    'Core': 'Abdominal',
    'Forearms': 'Antebraços',
    'Rear Delts': 'Deltóide Posterior',
    'Upper Back': 'Costas Superiores',
    'Lower Back': 'Lombar',
    'Abductors': 'Abdutores',
    'Adductors': 'Adutores'
  };
  return map[muscle as string] || muscle;
};

export const translateEquipment = (equipment?: EquipmentType | string): string => {
  if (!equipment) return '';
  const map: Record<string, string> = {
    'Barbell': 'Barra',
    'Dumbbell': 'Halteres',
    'Machine': 'Máquina',
    'Cable': 'Polia',
    'Bodyweight': 'Peso Corporal',
    'Smith': 'Máquina Smith'
  };
  return map[equipment as string] || equipment;
};

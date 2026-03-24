export interface SetData {
  weightKg: number;
  reps: number;
  targetReps: number;
  restSeconds: number;
  rpe: number;
}

export interface ProgressionRecommendation {
  action: 'INCREASE_LOAD' | 'MAINTAIN_LOAD' | 'DELOAD';
  messageToUser: string;
  suggestedWeight?: number;
  suggestedVolumeMultiplier?: number;
}

export function calculateProgression(
  recentSets: SetData[], 
  consecutiveWeeks: number
): ProgressionRecommendation {
  
  if (recentSets.length === 0) {
    return {
      action: 'MAINTAIN_LOAD',
      messageToUser: 'Bom começo. Foque na técnica e mantenha o ritmo.'
    };
  }

  // 1. Checar se é hora de um Deload profilático (a cada 5 semanas exatas)
  if (consecutiveWeeks >= 5) {
    return {
      action: 'DELOAD',
      suggestedVolumeMultiplier: 0.6, // Corta o volume em 40% (ex: faz 2 séries invés de 4)
      messageToUser: "Você bateu na mesma tecla forte por 5 semanas. Sistema nervoso central fritando. Esta semana cortaremos o volume pela metade. Recupere, durma, porque na semana 6 vamos quebrar o seu teto de carga."
    };
  }

  const allTargetsHit = recentSets.every(set => set.reps >= set.targetReps);
  // Pega o maior RPE do exercício (geralmente a última série é a mais difícil)
  const highestRpe = Math.max(...recentSets.map(set => set.rpe));
  const averageWeight = recentSets.reduce((acc, set) => acc + set.weightKg, 0) / recentSets.length;

  // 2. Não bateu as repetições (Falhou antes do alvo).
  if (!allTargetsHit) {
    return {
      action: 'MAINTAIN_LOAD',
      suggestedWeight: averageWeight,
      messageToUser: "Foco na técnica. Como não atingiste as repetições alvo, vamos manter a carga. Recomendo aumentar o tempo de descanso entre séries para garantir a recuperação."
    };
  }

  // 3. Bateu os alvos, mas RPE muito alto (Quase na falha total ou técnica a degradar)
  if (highestRpe >= 9.5) {
    return {
      action: 'MAINTAIN_LOAD',
      suggestedWeight: averageWeight,
      messageToUser: "Alvos atingidos, mas o esforço foi máximo (RPE 9.5+). Vamos manter o peso para consolidar a técnica antes de progredir."
    };
  }

  // 4. Bateu os alvos, RPE Médio/Baixo (Progresso Ideal)
  if (allTargetsHit) {
    const config = require('../store/useConfigStore').useConfigStore.getState();
    const experience = config.experienceLevel || 'intermediate';

    let bumpFactor = highestRpe < 8 ? 1.05 : 1.025;
    
    // Ajuste de agressividade baseado na experiência
    if (experience === 'beginner') {
      bumpFactor += 0.02; // Iniciantes progridem mais rápido
    } else if (experience === 'advanced') {
      bumpFactor -= 0.01; // Avançados progridem mais devagar (micro-progressão)
    }

    const rawSuggestedLoad = averageWeight * bumpFactor;
    
    // Arredonda para múltiplo de 0.5kg ou 1kg dependendo da carga
    let increment = averageWeight < 50 ? 1 : 2.5;
    
    if (experience === 'advanced') {
      increment = 0.5; // Avançados usam frações menores
    } else if (experience === 'beginner' && averageWeight > 50) {
      increment = 5; // Iniciantes podem saltar mais peso
    }

    const newWeight = Math.ceil(rawSuggestedLoad / increment) * increment;

    return {
      action: 'INCREASE_LOAD',
      suggestedWeight: newWeight,
      messageToUser: `Excelente performance! RPE sob controlo. Próximo treino: sobe para ${newWeight}kg.`
    };
  }

  return {
    action: 'MAINTAIN_LOAD',
    suggestedWeight: averageWeight,
    messageToUser: "Mantém a carga atual para garantir consistência."
  };
}

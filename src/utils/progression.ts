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
    // Se falhou 3 semanas seguidas na mesma carga, sugerimos um RESET (Deload focado no exercício)
    // Para simplificar a lógica inicial, sugerimos manter.
    return {
      action: 'MAINTAIN_LOAD',
      suggestedWeight: averageWeight,
      messageToUser: "Sem ego. Você falhou na repetição alvo. Vamos manter essa carga, focar em controlar a fase excêntrica e aumentar o descanso. Não suba o peso até dominar a carga atual."
    };
  }

  // 3. Bateu os alvos, RPE baixo (Progresso Fácil/Moderado)
  if (allTargetsHit && highestRpe < 8.5) {
    const bumpFactor = 1.025; 
    const rawSuggestedLoad = averageWeight * bumpFactor;
    
    // Arredonda para múltiplo de de anilhas acessíveis (passos de 1kg ou 2.5kg)
    const normalizedLoad = Math.round(rawSuggestedLoad);
    const newWeight = normalizedLoad <= averageWeight ? averageWeight + 1 : normalizedLoad;

    return {
      action: 'INCREASE_LOAD',
      suggestedWeight: newWeight,
      messageToUser: `Alvos destruídos! Próximo treino: coloque ${newWeight}kg. Prepare-se para aplicar mais força.`
    };
  }

  // 4. Bateu os alvos, mas RPE muito alto (Quase na falha total)
  return {
    action: 'MAINTAIN_LOAD',
    suggestedWeight: averageWeight,
    messageToUser: `Alvos atingidos, mas com esforço máximo. Vamos manter a carga atual até que este peso se sinta mais "sob controlo" antes de subir.`
  };
}

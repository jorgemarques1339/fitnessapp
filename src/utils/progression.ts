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
      messageToUser: "Sem ego. Você falhou na repetição alvo na última série. Vamos manter essa carga, focar em controlar a fase excêntrica da descida e aumentar o descanso em +30s. Não suba o peso até dominar a carga atual."
    };
  }

  // 3. Bateu os alvos, RPE baixo (Progresso Fácil/Moderado)
  if (allTargetsHit && highestRpe < 8) {
    // Aumenta de 2% a 5%. Usaremos um bump padrão conservador para barras grandes de 2.5kg (1.25kg cada lado) ou proporção se carga alta.
    const bumpFactor = 1.025; // 2.5% aumento
    const rawSuggestedLoad = averageWeight * bumpFactor;
    
    // Arredonda para múltiplo de de anilhas acessíveis (ex: anilhas de 1.25kg formam saltos de 2.5kg num supino)
    const normalizedLoad = Math.round(rawSuggestedLoad / 2.5) * 2.5;
    
    // Fallback: se o aumento de 2.5% não mudou nada (carga muito baixa), força um +1kg
    const newWeight = normalizedLoad === averageWeight ? averageWeight + 1 : normalizedLoad;

    return {
      action: 'INCREASE_LOAD',
      suggestedWeight: newWeight,
      messageToUser: `Alvos destruídos com RPE submáximo (${highestRpe}). Está muito leve. Na próxima vez, vamos colocar a barra para ${newWeight}kg. Prepare-se para aplicar mais força.`
    };
  }

  // 4. Bateu os alvos, mas RPE muito alto (Quase na falha total)
  return {
    action: 'MAINTAIN_LOAD',
    suggestedWeight: averageWeight,
    messageToUser: `Você atingiu as repetições, mas com força máxima (RPE ${highestRpe}). O músculo trabalhou perto do limite. Vamos manter a carga e tentar reduzir esse esforço percebido antes de socar mais anilha.`
  };
}

export const calculateEpley1RM = (weightKg: number, reps: number): number => {
  if (reps === 1) return weightKg;
  if (reps > 30) return 0; // Formula is highly inaccurate past 30 reps
  
  // Epley Formula: 1RM = w * (1 + r / 30)
  return weightKg * (1 + reps / 30);
};

export const get1RMTrendData = (completedWorkouts: any[], exerciseId: string): { labels: string[], data: number[] } => {
  const trends: { date: string, rm: number }[] = [];

  // Sort workouts chronologically just in case
  const sortedWorkouts = [...completedWorkouts].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedWorkouts.forEach(workout => {
    const exLog = workout.exerciseLogs?.find((l: any) => l.exerciseId === exerciseId);
    if (exLog && exLog.sets.length > 0) {
      // Find the best set of this session using Epley
      let sessionBest1RM = 0;
      
      exLog.sets.forEach((set: any) => {
        const w = parseFloat(set.weightKg);
        const r = parseInt(set.reps, 10);
        if (!isNaN(w) && !isNaN(r) && r > 0) {
          const rm = calculateEpley1RM(w, r);
          if (rm > sessionBest1RM) {
            sessionBest1RM = rm;
          }
        }
      });
      
      if (sessionBest1RM > 0) {
         // Format date simply (e.g. DD/MM)
         const dateObj = new Date(workout.date);
         const label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
         trends.push({ date: label, rm: Math.round(sessionBest1RM) });
      }
    }
  });

  // Limit to last 6 points for visual clarity
  const recentTrends = trends.slice(-6);

  if (recentTrends.length === 0) {
    return { labels: ['N/A'], data: [0] };
  }

  return {
    labels: recentTrends.map(t => t.date),
    data: recentTrends.map(t => t.rm)
  };
};

// 1RM estimation using Epley formula — clamp to sane reps
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  const r = Math.min(reps, 12);
  return +(weight * (1 + r / 30)).toFixed(2);
}

export function estimateXRM(weight: number, reps: number, targetReps: number): number {
  const oneRM = estimate1RM(weight, reps);
  if (targetReps <= 1) return oneRM;
  return +(oneRM / (1 + targetReps / 30)).toFixed(2);
}

export function volume(sets: Array<{ weight: number; reps: number }>): number {
  return sets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);
}

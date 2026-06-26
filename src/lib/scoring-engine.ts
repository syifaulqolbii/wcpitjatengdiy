/**
 * Pure stage-based scoring engine for WC Prediction.
 * No database dependencies here, safe to import in client components.
 */

export interface StageScoring {
  perfectScore: number;
  correctResult: number;
}

export const STAGE_SCORING: Record<string, StageScoring> = {
  group_stage:   { perfectScore: 5,  correctResult: 2 },
  round_32:      { perfectScore: 6,  correctResult: 3 },
  round_16:      { perfectScore: 7,  correctResult: 4 },
  quarter_final: { perfectScore: 8,  correctResult: 5 },
  semi_final:    { perfectScore: 10, correctResult: 6 },
  juara_3:       { perfectScore: 12, correctResult: 7 },
  final:         { perfectScore: 15, correctResult: 10 },
};

/** Get scoring values for a given stage, falling back to group_stage. */
export function getStageScoringRules(stage: string): StageScoring {
  return STAGE_SCORING[stage] ?? STAGE_SCORING.group_stage;
}

/**
 * Calculate the points earned for a prediction based on the actual match result.
 *
 * Points are determined by the match stage:
 * - Perfect score (exact predicted A and B matches actual A and B): stage perfectScore
 * - Correct result (predicted winner/draw matches actual winner/draw): stage correctResult
 * - Wrong prediction: 0 points
 */
export function calculatePoints(
  predictedA: number,
  predictedB: number,
  actualA: number,
  actualB: number,
  stage: string = 'group_stage'
): number {
  const scoring = getStageScoringRules(stage);

  // 1. Perfect score
  if (predictedA === actualA && predictedB === actualB) {
    return scoring.perfectScore;
  }

  // 2. Correct result (Win/Draw/Loss)
  const predictedResult = Math.sign(predictedA - predictedB);
  const actualResult = Math.sign(actualA - actualB);

  if (predictedResult === actualResult) {
    return scoring.correctResult;
  }

  // 3. Wrong prediction
  return 0;
}

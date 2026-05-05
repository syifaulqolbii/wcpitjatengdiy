import { z } from "zod";

// ─── Match Schemas ────────────────────────────────────────────
export const createMatchSchema = z.object({
  teamA: z.string().min(1, "teamA is required"),
  teamB: z.string().min(1, "teamB is required"),
  flagA: z.string().min(1, "flagA is required"),
  flagB: z.string().min(1, "flagB is required"),
  group: z.string().min(1, "group is required"),
  kickoffTime: z.string().datetime({ message: "kickoffTime must be a valid ISO datetime" }),
});

export const updateMatchSchema = z.object({
  teamA: z.string().min(1).optional(),
  teamB: z.string().min(1).optional(),
  flagA: z.string().min(1).optional(),
  flagB: z.string().min(1).optional(),
  group: z.string().min(1).optional(),
  kickoffTime: z.string().datetime().optional(),
  status: z.enum(["upcoming", "live", "finished"]).optional(),
  scoreA: z.number().int().min(0).nullable().optional(),
  scoreB: z.number().int().min(0).nullable().optional(),
});

// ─── Prediction Schemas ───────────────────────────────────────
export const createPredictionSchema = z.object({
  matchId: z.string().uuid("matchId must be a valid UUID"),
  predictedA: z.number().int().min(0, "predictedA must be >= 0"),
  predictedB: z.number().int().min(0, "predictedB must be >= 0"),
});

export const updatePredictionSchema = z.object({
  predictedA: z.number().int().min(0, "predictedA must be >= 0"),
  predictedB: z.number().int().min(0, "predictedB must be >= 0"),
});

// ─── Types ───────────────────────────────────────────────────
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
export type CreatePredictionInput = z.infer<typeof createPredictionSchema>;
export type UpdatePredictionInput = z.infer<typeof updatePredictionSchema>;

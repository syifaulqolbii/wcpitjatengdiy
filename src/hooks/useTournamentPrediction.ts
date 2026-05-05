import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";

interface TournamentPrediction {
  id: string;
  userId: string;
  predictedWinner: string;
  predictedWinnerFlag: string;
  points: number | null;
  submittedAt: string;
  updatedAt: string;
}

interface PredictionResponse {
  prediction: TournamentPrediction | null;
  isLocked: boolean;
  deadline: string;
  bonusPoints: number;
  winner: string | null;
}

interface AllPredictionsResponse {
  predictions: Array<{
    id: string;
    userId: string;
    userName: string;
    predictedWinner: string;
    predictedWinnerFlag: string;
    points: number | null;
    submittedAt: string;
  }>;
  stats: {
    total: number;
    submitted: number;
    notSubmitted: number;
  };
}

interface CalculateResponse {
  correct: number;
  wrong: number;
  total: number;
}

export function useTournamentPrediction() {
  return useQuery({
    queryKey: ["tournamentPrediction"],
    queryFn: async (): Promise<PredictionResponse> => {
      const res = await fetch("/api/tournament-prediction");
      if (!res.ok) {
        throw new Error("Failed to fetch tournament prediction");
      }
      const json = await res.json();
      return json.data;
    },
  });
}

export function useSubmitChampionPick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { predictedWinner: string; predictedWinnerFlag: string }) => {
      const res = await fetch("/api/tournament-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to submit champion pick");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournamentPrediction"] });
    },
  });
}

export function useUpdateChampionPick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { predictedWinner: string; predictedWinnerFlag: string }) => {
      const res = await fetch("/api/tournament-prediction", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update champion pick");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournamentPrediction"] });
    },
  });
}

export function useAllTournamentPredictions(enabled = true) {
  return useQuery({
    queryKey: ["tournamentPredictionAll"],
    queryFn: () => apiGet<AllPredictionsResponse>("/api/tournament-prediction/all"),
    enabled,
  });
}

export function useCalculateChampionPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { winner: string }) =>
      apiPost<CalculateResponse>("/api/tournament-prediction/calculate", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournamentPredictionAll"] });
      queryClient.invalidateQueries({ queryKey: ["tournamentPrediction"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

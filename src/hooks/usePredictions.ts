import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { Prediction } from '@/types';
import { toast } from 'sonner';

export function usePredictions(matchId?: string) {
  return useQuery({
    queryKey: ['predictions', matchId],
    queryFn: () => apiGet<Prediction[]>(`/api/predictions${matchId ? `?matchId=${matchId}` : ''}`),
  });
}

export function useUserPredictions(userId?: string) {
  return useQuery({
    queryKey: ['predictions', 'user', userId],
    queryFn: () => apiGet<Prediction[]>(`/api/predictions${userId ? `?userId=${userId}` : ''}`),
    enabled: !!userId,
  });
}

export function useMatchPredictions(matchId?: string) {
  return useQuery({
    queryKey: ['predictions', 'match', matchId, 'all-users'],
    queryFn: () => apiGet<Prediction[]>(`/api/predictions?matchId=${matchId}&allUsers=true`),
    enabled: !!matchId,
  });
}

export function useSubmitPrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { matchId: string; predictedA: number; predictedB: number }) => 
      apiPost<Prediction>('/api/predictions', data),
    onMutate: async (newPrediction) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['matches', newPrediction.matchId] });
      await queryClient.cancelQueries({ queryKey: ['predictions'] });

      // Save previous state for rollback
      const previousMatch = queryClient.getQueryData(['matches', newPrediction.matchId]);
      
      // Update match cache optimistically if it exists
      queryClient.setQueryData(['matches', newPrediction.matchId], (old: Prediction | undefined) => {
        if (!old) return old;
        return {
          ...old,
          prediction: {
            id: 'temp-id',
            matchId: newPrediction.matchId,
            predictedA: newPrediction.predictedA,
            predictedB: newPrediction.predictedB,
            points: null,
            submittedAt: new Date()
          }
        };
      });

      return { previousMatch };
    },
    onError: (err, newPrediction, context) => {
      if (context?.previousMatch) {
        queryClient.setQueryData(['matches', newPrediction.matchId], context.previousMatch);
      }
      toast.error(err.message || 'Failed to submit prediction');
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches', variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    },
    onSuccess: () => {
      toast.success('Prediction submitted!');
    }
  });
}

export function useUpdatePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; predictedA: number; predictedB: number }) => 
      apiPut<Prediction>(`/api/predictions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Prediction updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update prediction');
    },
  });
}

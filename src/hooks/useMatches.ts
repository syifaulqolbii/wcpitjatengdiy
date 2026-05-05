import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Match } from '@/types';
import { toast } from 'sonner';

export function useMatches(status?: string) {
  return useQuery({
    queryKey: ['matches', status],
    queryFn: () => apiGet<Match[]>(`/api/matches${status ? `?status=${status}` : ''}`),
  });
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['matches', matchId],
    queryFn: () => apiGet<Match>(`/api/matches/${matchId}`),
    enabled: !!matchId,
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newMatch: Partial<Match>) => apiPost<Match>('/api/matches', newMatch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Match created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create match');
    },
  });
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Match> & { id: string }) => apiPut<Match>(`/api/matches/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['matches', variables.id] });
      toast.success('Match updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update match');
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete<{ success: boolean }>(`/api/matches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Match deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete match');
    },
  });
}

export function useCalculateScore(matchId: string) {
  return useMutation({
    mutationFn: () => apiPost<{ success: boolean; updatedPredictions: number }>(`/api/matches/${matchId}/calculate`, {}),
    onSuccess: (data) => {
      toast.success(`Score calculation triggered. Updated ${data.updatedPredictions} predictions.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to trigger score calculation');
    },
  });
}

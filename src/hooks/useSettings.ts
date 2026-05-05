import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '@/lib/api';
import { toast } from 'sonner';

export type SystemSettings = {
  perfectScore: string;
  correctResult: string;
  wrongPrediction: string;
  lockInMinutes: string;
  champion_points: string;
  champion_deadline: string;
  champion_winner: string;
  inviteEnabled: string;
  invitation_code?: string;
};

// Default settings if database is empty
const defaultSettings: SystemSettings = {
  perfectScore: '3',
  correctResult: '1',
  wrongPrediction: '0',
  lockInMinutes: '15',
  champion_points: '30',
  champion_deadline: '2026-06-10T19:00:00Z',
  champion_winner: '',
  inviteEnabled: 'true',
  invitation_code: '',
};

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const data = await apiGet<Record<string, string>>('/api/settings');
      return { ...defaultSettings, ...data };
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSettings: Partial<SystemSettings>) => apiPut<{ success: boolean }>('/api/settings', newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Pengaturan berhasil disimpan');
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menyimpan pengaturan');
    },
  });
}

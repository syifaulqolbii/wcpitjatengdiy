import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { LeaderboardEntry } from '@/types';

export function useLeaderboard(groupId?: string, enabled = true) {
  return useQuery({
    queryKey: ['leaderboard', groupId ?? 'global'],
    queryFn: () => apiGet<LeaderboardEntry[]>(
      `/api/leaderboard${groupId ? `?groupId=${groupId}` : ''}`
    ),
    enabled,
    refetchInterval: 30000,
  });
}

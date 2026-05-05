import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { LeaderboardEntry } from '@/types';

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => apiGet<LeaderboardEntry[]>('/api/leaderboard'),
    refetchInterval: 30000, // 30 seconds
  });
}

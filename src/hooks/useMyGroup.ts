import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export function useMyGroup() {
  return useQuery({
    queryKey: ['me', 'group'],
    queryFn: () => apiGet<{ groupId: string | null; groupName: string | null }>('/api/me/group'),
  });
}

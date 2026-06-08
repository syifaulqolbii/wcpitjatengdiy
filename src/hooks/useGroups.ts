import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from 'sonner';

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  memberCount: number;
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  totalPoints: number;
}

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => apiGet<Group[]>('/api/admin/groups'),
  });
}

export function useGroupMembers(groupId: string | null) {
  return useQuery({
    queryKey: ['groups', groupId, 'members'],
    queryFn: () => apiGet<GroupMember[]>(`/api/admin/groups/${groupId}/members`),
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; inviteCode?: string }) =>
      apiPost<Group>('/api/admin/groups', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Grup berhasil dibuat');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, name, regenerateCode }: { groupId: string; name: string; regenerateCode?: boolean }) =>
      apiPut<Group>(`/api/admin/groups/${groupId}`, { name, regenerateCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Grup berhasil diperbarui');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) =>
      apiDelete<{ success: boolean }>(`/api/admin/groups/${groupId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Grup berhasil dihapus');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useAssignUserToGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      apiPost<{ success: boolean }>(`/api/admin/groups/${groupId}/members`, { userId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'group'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast.success('User berhasil ditambahkan ke grup');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useRemoveUserFromGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      fetch(`/api/admin/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      }).then(async (res) => {
        const json = await res.json();
        if (json.error) throw new Error(json.error.message);
        return json.data;
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'group'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast.success('User berhasil dikeluarkan dari grup');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ─── Whitelist Hooks ──────────────────────────────────────────

export function useGroupWhitelist(groupId?: string | null) {
  return useQuery({
    queryKey: ['groups', groupId, 'whitelist'],
    queryFn: () => apiGet<{ id: string; email: string; createdAt: string }[]>(`/api/admin/groups/${groupId}/whitelist`),
    enabled: !!groupId,
  });
}

export function useAddWhitelistEmails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, emails }: { groupId: string; emails: string[] }) =>
      apiPost<{ addedCount: number }>(`/api/admin/groups/${groupId}/whitelist`, { emails }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId, 'whitelist'] });
      toast.success('Email berhasil ditambahkan ke whitelist');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRemoveWhitelistEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, emailId }: { groupId: string; emailId: string }) =>
      apiDelete<{ success: boolean }>(`/api/admin/groups/${groupId}/whitelist`, { emailId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId, 'whitelist'] });
      toast.success('Email dihapus dari whitelist');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

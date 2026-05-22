import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { apiGet, apiPut } from '@/lib/api';
import { toast } from 'sonner';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  groupId: string | null;
  groupName: string | null;
  createdAt: string;
};

type UsersResult = AdminUser[] & { users: AdminUser[] };

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const data = await apiGet<{ users: AdminUser[] }>('/api/admin/users');
      const result = data.users as UsersResult;
      result.users = data.users;
      return result;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await authClient.admin.setRole({ userId, role: role as 'user' | 'admin' });
      if (res.error) {
        throw new Error(res.error.message || 'Failed to update role');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await authClient.admin.removeUser({ userId });
      if (res.error) {
        throw new Error(res.error.message || 'Failed to remove user');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User removed successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useRecoverUserAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, email, password }: { userId: string; email?: string; password?: string }) =>
      apiPut<{ success: boolean; userId: string; email: string; emailChanged: boolean; passwordChanged: boolean }>(
        `/api/admin/users/${userId}/recovery`,
        { email, password }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Akun berhasil dipulihkan');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

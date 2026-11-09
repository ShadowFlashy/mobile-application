import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryPersister } from '../lib/queryClient';
import { deleteMyAccount } from '../services/authService';
import { ServiceError } from '../services/serviceError';
import { useAuthStore } from '../state/useAuthStore';

/**
 * Logs out and wipes every cached piece of server data from the device, so the next person
 * using this phone starts with a clean app. Navigation follows the auth state automatically.
 */
export function useSignOut() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  return useMutation({
    mutationFn: logout,
    onSettled: async () => {
      queryClient.clear();
      await queryPersister.removeClient();
    },
  });
}

/** GDPR right to erasure: deletes the account with all its data, then clears the device. */
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const markSignedOut = useAuthStore((state) => state.markSignedOut);
  return useMutation({
    mutationFn: async () => {
      if (userId === undefined) throw new ServiceError('not_signed_in');
      await deleteMyAccount(userId);
    },
    onSuccess: async () => {
      markSignedOut();
      queryClient.clear();
      await queryPersister.removeClient();
    },
  });
}

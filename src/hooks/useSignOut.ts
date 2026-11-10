import { useMutation } from '@tanstack/react-query';
import { deleteMyAccount } from '../services/authService';
import { ServiceError } from '../services/serviceError';
import { useAuthStore } from '../state/useAuthStore';

/**
 * Logs out. The auth store then wipes every cached piece of server data and the cached photos from
 * the device (also when the server cannot be reached), so the next person using this phone starts
 * with a clean app. Navigation follows the auth state automatically.
 */
export function useSignOut() {
  const logout = useAuthStore((state) => state.logout);
  return useMutation({ mutationFn: logout });
}

/**
 * GDPR right to erasure: deletes the account with all its data, then clears the device. The shared
 * demo account is protected by the database (`demo_protected`); the caller shows that error.
 */
export function useDeleteAccount() {
  const userId = useAuthStore((state) => state.user?.id);
  const markSignedOut = useAuthStore((state) => state.markSignedOut);
  return useMutation({
    mutationFn: async () => {
      if (userId === undefined) throw new ServiceError('not_signed_in');
      await deleteMyAccount(userId);
    },
    onSuccess: () => markSignedOut(),
  });
}

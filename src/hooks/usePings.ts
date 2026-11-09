import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '../constants/queryKeys';
import { getPingById, getPings, markAllPingsRead, subscribeToPings } from '../services/ownerService';
import { useAuthStore } from '../state/useAuthStore';
import { useToastStore } from '../state/useToastStore';
import type { SpotPing } from '../types/OwnerCar';

/** Pings: notifications that one of the user's registered cars was spotted. */
export function usePings() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: queryKeys.pings(userId),
    queryFn: userId !== undefined ? getPings : skipToken,
  });
}

/** Number of unread pings, shown as a badge on the Owners tab. */
export function useUnreadPingCount(): number {
  const { data } = usePings();
  return data?.filter((ping) => !ping.isRead).length ?? 0;
}

/** Marks every ping as read, optimistically. */
export function useMarkPingsRead() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const key = queryKeys.pings(userId);
  return useMutation({
    mutationFn: markAllPingsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SpotPing[]>(key);
      queryClient.setQueryData<SpotPing[]>(key, (current) => current?.map((ping) => ({ ...ping, isRead: true })));
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(key, context.previous);
    },
  });
}

/**
 * Live pings through Supabase Realtime: every time one of the owner's cars is spotted, the ping
 * is added to the cache (badge updates) and a toast is shown.
 */
export function usePingSubscription(userId?: string): void {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);
  const { t } = useTranslation();

  useEffect(() => {
    if (userId === undefined) return undefined;
    const unsubscribe = subscribeToPings(userId, (pingId) => {
      void getPingById(pingId).then((ping) => {
        if (ping === undefined) return;
        queryClient.setQueryData<SpotPing[]>(queryKeys.pings(userId), (current) =>
          current?.some((item) => item.id === ping.id) ? current : [ping, ...(current ?? [])],
        );
        showToast(t('owners.ping_toast', { car: `${ping.carMake} ${ping.carModel}` }), 'success');
      });
    });
    return unsubscribe;
  }, [userId, queryClient, showToast, t]);
}

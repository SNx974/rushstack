import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useQueueStore } from '@/stores/queue.store';
import { useNotificationsStore } from '@/stores/notifications.store';
import { queryClient, queryKeys } from '@/lib/query/client';
import type { Notification, QueueEntry } from '@/types';

export function useRealtimeSubscriptions() {
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const setEntry = useQueueStore((s) => s.setEntry);
  const removeEntry = useQueueStore((s) => s.removeEntry);

  useEffect(() => {
    if (!user?.id) return;

    // Notifications channel
    const notificationsChannel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          addNotification(payload.new as Notification);
        }
      )
      .subscribe();

    // Queue channel: track own entries
    const queueChannel = supabase
      .channel(`queue:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `player_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            removeEntry((payload.old as QueueEntry).game_id);
          } else {
            const entry = payload.new as QueueEntry;
            setEntry(entry.game_id, entry);
            // When match found, invalidate matches query
            if (entry.status === 'in_match') {
              queryClient.invalidateQueries({ queryKey: queryKeys.matches.active(user.id) });
            }
          }
        }
      )
      .subscribe();

    // Player MMR changes: invalidate leaderboard caches
    const mmrChannel = supabase
      .channel(`mmr:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'player_mmr',
          filter: `player_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.playerMmr.all(user.id) });
          queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.all });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(queueChannel);
      supabase.removeChannel(mmrChannel);
    };
  }, [user?.id, addNotification, setEntry, removeEntry]);
}

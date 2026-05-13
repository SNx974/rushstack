import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Bell, BellOff, CheckCheck } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationsStore } from '@/stores/notifications.store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/services/social.service';
import { queryKeys } from '@/lib/query/client';
import type { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_ICONS: Record<string, string> = {
  match_found: '⚔️',
  match_invite: '🎮',
  friend_request: '👋',
  rank_up: '🏆',
  rank_down: '📉',
  result_submitted: '📋',
  dispute_opened: '⚠️',
  dispute_resolved: '✅',
  system: '📢',
};

export default function NotificationsScreen() {
  const user = useAuthStore((s) => s.user);
  const { setNotifications, markRead, markAllRead } = useNotificationsStore();
  const notifications = useNotificationsStore((s) => s.notifications);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  const { isLoading } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      const data = await fetchNotifications(user!.id);
      setNotifications(data);
      return data;
    },
    enabled: !!user?.id,
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(user!.id),
    onSuccess: markAllRead,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: (id) => markRead(id),
  });

  return (
    <SafeAreaView className="flex-1 bg-surface-400">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 border-b border-surface-100 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Bell color="#ffffff" size={22} />
          <Text className="text-white font-black text-xl">ALERTS</Text>
          {unreadCount > 0 && (
            <View className="bg-brand-700 rounded-full w-6 h-6 items-center justify-center">
              <Text className="text-white text-xs font-bold">{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => markAllMutation.mutate()} className="flex-row items-center gap-1.5">
            <CheckCheck color="#c80d0d" size={16} />
            <Text className="text-brand-600 text-xs font-semibold">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <NotificationRow
            notification={item}
            onPress={() => { if (!item.is_read) markReadMutation.mutate(item.id); }}
          />
        )}
        contentContainerClassName="px-5 py-4 gap-3"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-24 gap-3">
              <BellOff color="#374151" size={48} />
              <Text className="text-gray-500 text-base font-semibold">No notifications yet</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function NotificationRow({ notification, onPress }: { notification: Notification; onPress: () => void }) {
  const icon = NOTIFICATION_ICONS[notification.type] ?? '🔔';
  return (
    <TouchableOpacity onPress={onPress}>
      <Card className={`flex-row gap-3 ${!notification.is_read ? 'border-brand-900/60' : ''}`} padding="sm">
        {!notification.is_read && (
          <View className="absolute top-3 left-3 w-2 h-2 bg-brand-700 rounded-full" />
        )}
        <View className="w-10 h-10 bg-surface-100 rounded-xl items-center justify-center flex-shrink-0">
          <Text className="text-xl">{icon}</Text>
        </View>
        <View className="flex-1 min-w-0">
          <Text className={`font-semibold text-sm ${notification.is_read ? 'text-gray-400' : 'text-white'}`}>
            {notification.title}
          </Text>
          <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={2}>{notification.body}</Text>
          <Text className="text-gray-600 text-xs mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </Text>
        </View>
        {!notification.is_read && <Badge variant="brand" size="sm">NEW</Badge>}
      </Card>
    </TouchableOpacity>
  );
}

import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import {
  Home, Trophy, Swords, Users, Bell, Shield,
  LogOut, Settings, Zap, ChevronRight,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationsStore } from '@/stores/notifications.store';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  href: string;
  badge?: number;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',        icon: Home,    href: '/(app)/(tabs)/home' },
  { label: 'Leaderboard', icon: Trophy,  href: '/(app)/(tabs)/leaderboard' },
  { label: 'Play',        icon: Swords,  href: '/(app)/(tabs)/queue' },
  { label: 'Social',      icon: Users,   href: '/(app)/(tabs)/social' },
  { label: 'Alerts',      icon: Bell,    href: '/(app)/(tabs)/notifications' },
  { label: 'Admin',       icon: Shield,  href: '/(admin)', adminOnly: true },
];

export function WebSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) =>
    item.label === 'Alerts' ? { ...item, badge: unreadCount } : item
  );

  return (
    <View className="flex-1 flex-row bg-surface-400">
      {/* Sidebar */}
      <View className="w-64 bg-surface-300 border-r border-surface-100 flex-col">
        {/* Logo */}
        <View className="px-6 py-5 border-b border-surface-100">
          <View className="flex-row items-center gap-2">
            <Zap color="#c80d0d" size={22} />
            <Text className="text-white font-bold text-xl tracking-wider">RUSH STACK</Text>
          </View>
        </View>

        {/* Nav items */}
        <ScrollView className="flex-1 py-4" showsVerticalScrollIndicator={false}>
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href.replace('/(app)', '').replace('/(admin)', '/admin'));
            return (
              <TouchableOpacity
                key={item.label}
                onPress={() => router.push(item.href as never)}
                className={`flex-row items-center mx-3 px-4 py-3 rounded-xl mb-1 ${
                  isActive ? 'bg-brand-700/20' : 'hover:bg-surface-100'
                }`}
              >
                <item.icon color={isActive ? '#c80d0d' : '#6b7280'} size={20} />
                <Text className={`ml-3 font-semibold text-sm ${isActive ? 'text-brand-700' : 'text-gray-400'}`}>
                  {item.label}
                </Text>
                {(item.badge ?? 0) > 0 && (
                  <View className="ml-auto bg-brand-700 rounded-full min-w-5 h-5 items-center justify-center px-1">
                    <Text className="text-white text-xs font-bold">{item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* User section */}
        {profile && (
          <View className="border-t border-surface-100 p-4">
            <TouchableOpacity
              onPress={() => router.push(`/(app)/profile/${profile.id}` as never)}
              className="flex-row items-center mb-3"
            >
              <Avatar uri={profile.avatar_url} username={profile.username} size={36} />
              <View className="ml-3 flex-1 min-w-0">
                <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                  {profile.display_name ?? profile.username}
                </Text>
                <Text className="text-gray-500 text-xs">@{profile.username}</Text>
              </View>
              <ChevronRight color="#6b7280" size={16} />
            </TouchableOpacity>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => router.push('/(app)/settings' as never)}
                className="flex-1 flex-row items-center justify-center gap-2 bg-surface-100 rounded-lg py-2"
              >
                <Settings color="#6b7280" size={16} />
                <Text className="text-gray-400 text-xs font-medium">Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={signOut}
                className="flex-1 flex-row items-center justify-center gap-2 bg-brand-950/50 rounded-lg py-2"
              >
                <LogOut color="#c80d0d" size={16} />
                <Text className="text-brand-700 text-xs font-medium">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Main content */}
      <View className="flex-1">
        <Slot />
      </View>
    </View>
  );
}

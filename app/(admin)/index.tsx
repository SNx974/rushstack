import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Shield, Users, AlertTriangle, Gamepad2, Swords, Ban, ArrowLeft, TrendingUp } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fetchAdminStats } from '@/services/admin.service';
import { queryKeys } from '@/lib/query/client';

export default function AdminDashboard() {
  const router = useRouter();

  const { data: stats, isLoading } = useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: fetchAdminStats,
    refetchInterval: 30000,
  });

  const STAT_CARDS = stats ? [
    { label: 'Total Players',    value: stats.total_users,      icon: <Users color="#3b82f6" size={20} />,      color: 'text-blue-400' },
    { label: 'Matches Today',    value: stats.matches_today,    icon: <Swords color="#c80d0d" size={20} />,     color: 'text-brand-600' },
    { label: 'In Queue',         value: stats.active_queues,    icon: <TrendingUp color="#22c55e" size={20} />, color: 'text-green-400' },
    { label: 'Open Disputes',    value: stats.open_disputes,    icon: <AlertTriangle color="#f59e0b" size={20} />, color: 'text-amber-400' },
    { label: 'Active Bans',      value: stats.active_bans,      icon: <Ban color="#ef4444" size={20} />,        color: 'text-red-400' },
  ] : [];

  const ADMIN_SECTIONS = [
    { label: 'User Management',    icon: <Users color="#3b82f6" size={22} />,        href: '/(admin)/users',     badge: null },
    { label: 'Dispute Management', icon: <AlertTriangle color="#f59e0b" size={22} />, href: '/(admin)/disputes',  badge: stats?.open_disputes ?? null },
    { label: 'Game Management',    icon: <Gamepad2 color="#c80d0d" size={22} />,     href: '/(admin)/games',     badge: null },
    { label: 'Live Queue',         icon: <Swords color="#22c55e" size={22} />,       href: '/(admin)/queue',     badge: stats?.active_queues ?? null },
    { label: 'Ban Management',     icon: <Ban color="#ef4444" size={22} />,           href: '/(admin)/bans',      badge: null },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface-400">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-4 border-b border-surface-100">
          <View className="flex-row items-center gap-3 mb-1">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <ArrowLeft color="#6b7280" size={20} />
            </TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <Shield color="#c80d0d" size={24} />
              <Text className="text-white font-black text-xl">ADMIN PANEL</Text>
            </View>
          </View>
          <Text className="text-gray-500 text-xs ml-9">RUSH STACK Control Center</Text>
        </View>

        {/* Stats */}
        <View className="px-5 pt-5">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Live Stats</Text>
          {isLoading ? (
            <ActivityIndicator color="#c80d0d" />
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {STAT_CARDS.map((card) => (
                <Card key={card.label} className="flex-1 min-w-[44%] items-center py-4 gap-2" padding="none">
                  {card.icon}
                  <Text className={`font-black text-2xl ${card.color}`}>{card.value}</Text>
                  <Text className="text-gray-500 text-xs text-center">{card.label}</Text>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Navigation */}
        <View className="px-5 mt-6 mb-8">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Management</Text>
          <View className="gap-3">
            {ADMIN_SECTIONS.map((section) => (
              <TouchableOpacity
                key={section.label}
                onPress={() => router.push(section.href as never)}
              >
                <Card className="flex-row items-center gap-4">
                  <View className="w-11 h-11 bg-surface-100 rounded-xl items-center justify-center">
                    {section.icon}
                  </View>
                  <Text className="text-white font-semibold text-sm flex-1">{section.label}</Text>
                  {section.badge !== null && section.badge > 0 && (
                    <View className="bg-brand-700 rounded-full w-6 h-6 items-center justify-center">
                      <Text className="text-white text-xs font-bold">{section.badge}</Text>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

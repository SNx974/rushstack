import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Ban, Shield, RefreshCw } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { fetchAllUsers, banUser, unbanUser, updateUserRole } from '@/services/admin.service';
import { queryKeys } from '@/lib/query/client';
import { useAuthStore } from '@/stores/auth.store';
import type { Profile } from '@/types';
import { format } from 'date-fns';

export default function AdminUsersScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const adminProfile = useAuthStore((s) => s.profile);
  const [search, setSearch] = useState('');
  const [page] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.users(page),
    queryFn: () => fetchAllUsers(page, 30, search || undefined),
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      banUser(userId, adminProfile!.id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.users() });
      Alert.alert('User banned');
    },
  });

  const unbanMutation = useMutation({
    mutationFn: unbanUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.users() }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Profile['role'] }) => updateUserRole(userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.users() }),
  });

  function promptBan(userId: string) {
    Alert.prompt('Ban user', 'Enter reason:', (reason) => {
      if (reason) banMutation.mutate({ userId, reason });
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-400">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center gap-3 border-b border-surface-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft color="#ffffff" size={20} />
        </TouchableOpacity>
        <Text className="text-white font-black text-lg flex-1">User Management</Text>
        {isLoading && <ActivityIndicator size="small" color="#c80d0d" />}
      </View>

      {/* Search */}
      <View className="px-5 py-3 border-b border-surface-100">
        <View className="flex-row items-center bg-surface-100 rounded-xl px-4 h-11 gap-3">
          <Search color="#6b7280" size={16} />
          <TextInput
            className="flex-1 text-white text-sm"
            placeholder="Search by username..."
            placeholderTextColor="#6b7280"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>
      </View>

      <FlatList
        data={data?.data ?? []}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <AdminUserRow
            profile={item}
            onBan={() => promptBan(item.id)}
            onUnban={() => unbanMutation.mutate(item.id)}
            onRoleChange={(role) => roleMutation.mutate({ userId: item.id, role })}
          />
        )}
        contentContainerClassName="px-5 py-4 gap-3"
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          data ? (
            <Text className="text-gray-600 text-xs text-center mt-4">{data.count} total users</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function AdminUserRow({ profile, onBan, onUnban, onRoleChange }: {
  profile: Profile;
  onBan: () => void;
  onUnban: () => void;
  onRoleChange: (role: Profile['role']) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card padding="sm">
      <TouchableOpacity onPress={() => setExpanded((v) => !v)} className="flex-row items-center gap-3">
        <Avatar uri={profile.avatar_url} username={profile.username} size={40} />
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-white font-semibold text-sm">{profile.username}</Text>
            <Badge
              variant={
                profile.is_banned ? 'danger' :
                profile.role === 'admin' || profile.role === 'superadmin' ? 'brand' :
                profile.role === 'moderator' ? 'warning' : 'default'
              }
              size="sm"
            >
              {profile.is_banned ? 'BANNED' : profile.role.toUpperCase()}
            </Badge>
          </View>
          <Text className="text-gray-500 text-xs">{format(new Date(profile.created_at), 'MMM d, yyyy')}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="mt-3 pt-3 border-t border-surface-100 gap-2">
          <View className="flex-row gap-2 flex-wrap">
            {profile.is_banned ? (
              <Button onPress={onUnban} variant="secondary" size="sm" icon={<RefreshCw color="#9ca3af" size={14} />}>
                Unban
              </Button>
            ) : (
              <Button onPress={onBan} variant="danger" size="sm" icon={<Ban color="#fff" size={14} />}>
                Ban
              </Button>
            )}
            {(['player', 'moderator', 'admin'] as Profile['role'][]).map((role) => (
              profile.role !== role && (
                <Button key={role} onPress={() => onRoleChange(role)} variant="ghost" size="sm" icon={<Shield color="#6b7280" size={14} />}>
                  Make {role}
                </Button>
              )
            ))}
          </View>
        </View>
      )}
    </Card>
  );
}

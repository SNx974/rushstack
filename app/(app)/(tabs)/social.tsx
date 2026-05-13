import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Users, UserPlus, Check, X, Search } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth.store';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  fetchFriends, fetchFriendRequests, sendFriendRequest, acceptFriendRequest, declineFriendRequest,
} from '@/services/social.service';
import { searchProfiles } from '@/services/profile.service';
import { queryKeys } from '@/lib/query/client';
import type { Profile, Friendship } from '@/types';
import { useRouter } from 'expo-router';

type Tab = 'friends' | 'requests' | 'search';

export default function SocialScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<Tab>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: user ? queryKeys.friends.all(user.id) : ['noop'],
    queryFn: () => fetchFriends(user!.id),
    enabled: !!user?.id,
  });

  const { data: requests = [] } = useQuery({
    queryKey: user ? queryKeys.friends.requests(user.id) : ['noop'],
    queryFn: () => fetchFriendRequests(user!.id),
    enabled: !!user?.id,
  });

  const { data: searchResults = [], isFetching: searching } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => searchProfiles(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.friends.all(user!.id) });
      qc.invalidateQueries({ queryKey: queryKeys.friends.requests(user!.id) });
    },
  });

  const declineMutation = useMutation({ mutationFn: declineFriendRequest });

  const sendRequestMutation = useMutation({
    mutationFn: (addresseeId: string) => sendFriendRequest(user!.id, addresseeId),
  });

  return (
    <SafeAreaView className="flex-1 bg-surface-400">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 border-b border-surface-100">
        <View className="flex-row items-center gap-2 mb-4">
          <Users color="#3b82f6" size={22} />
          <Text className="text-white font-black text-xl">SOCIAL</Text>
        </View>
        {/* Tabs */}
        <View className="flex-row gap-2">
          {(['friends', 'requests', 'search'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              className={`flex-row items-center gap-1.5 px-4 py-2 rounded-xl ${tab === t ? 'bg-brand-700' : 'bg-surface-100'}`}
            >
              <Text className={`text-xs font-semibold capitalize ${tab === t ? 'text-white' : 'text-gray-400'}`}>{t}</Text>
              {t === 'requests' && requests.length > 0 && (
                <View className="bg-red-600 rounded-full w-4 h-4 items-center justify-center">
                  <Text className="text-white text-xs font-bold">{requests.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Friends tab */}
      {tab === 'friends' && (
        <FlatList
          data={friends}
          keyExtractor={(f) => f.id}
          renderItem={({ item }) => (
            <FriendRow profile={item} onPress={() => router.push(`/(app)/profile/${item.id}` as never)} />
          )}
          contentContainerClassName="px-5 py-4 gap-3"
          ListEmptyComponent={
            !friendsLoading ? (
              <View className="items-center py-20 gap-2">
                <Users color="#374151" size={40} />
                <Text className="text-gray-500 text-sm">No friends yet. Add some!</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Requests tab */}
      {tab === 'requests' && (
        <FlatList
          data={requests}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <FriendRequestRow
              friendship={item}
              onAccept={() => acceptMutation.mutate(item.id)}
              onDecline={() => declineMutation.mutate(item.id)}
            />
          )}
          contentContainerClassName="px-5 py-4 gap-3"
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-gray-500 text-sm">No pending requests</Text>
            </View>
          }
        />
      )}

      {/* Search tab */}
      {tab === 'search' && (
        <View className="flex-1">
          <View className="px-5 pt-4 pb-2">
            <View className="flex-row items-center bg-surface-100 rounded-xl px-4 h-11 gap-3">
              <Search color="#6b7280" size={18} />
              <TextInput
                className="flex-1 text-white text-sm"
                placeholder="Search players..."
                placeholderTextColor="#6b7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searching && <ActivityIndicator size="small" color="#6b7280" />}
            </View>
          </View>
          <FlatList
            data={searchResults.filter((p) => p.id !== user?.id)}
            keyExtractor={(p) => p.id}
            renderItem={({ item }) => (
              <SearchResultRow
                profile={item}
                onAddFriend={() => sendRequestMutation.mutate(item.id)}
                onPress={() => router.push(`/(app)/profile/${item.id}` as never)}
                isLoading={sendRequestMutation.isPending}
              />
            )}
            contentContainerClassName="px-5 pt-2 pb-8 gap-3"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function FriendRow({ profile, onPress }: { profile: Profile; onPress: () => void }) {
  const isOnline = profile.last_seen_at
    ? Date.now() - new Date(profile.last_seen_at).getTime() < 5 * 60 * 1000
    : false;
  return (
    <TouchableOpacity onPress={onPress}>
      <Card className="flex-row items-center gap-3" padding="sm">
        <Avatar uri={profile.avatar_url} username={profile.username} size={44} online={isOnline} />
        <View className="flex-1">
          <Text className="text-white font-semibold text-sm">{profile.display_name ?? profile.username}</Text>
          <Text className="text-gray-500 text-xs">@{profile.username}</Text>
        </View>
        <Badge variant={isOnline ? 'success' : 'default'} size="sm">{isOnline ? 'Online' : 'Offline'}</Badge>
      </Card>
    </TouchableOpacity>
  );
}

function FriendRequestRow({ friendship, onAccept, onDecline }: { friendship: Friendship; onAccept: () => void; onDecline: () => void }) {
  return (
    <Card className="flex-row items-center gap-3" padding="sm">
      <Avatar username={friendship.requester_id.slice(0, 2)} size={44} />
      <View className="flex-1">
        <Text className="text-white font-semibold text-sm">Friend request</Text>
        <Text className="text-gray-500 text-xs">ID: {friendship.requester_id.slice(0, 8)}...</Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity onPress={onAccept} className="bg-green-800/40 rounded-lg p-2">
          <Check color="#22c55e" size={18} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDecline} className="bg-red-900/40 rounded-lg p-2">
          <X color="#ef4444" size={18} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

function SearchResultRow({ profile, onAddFriend, onPress, isLoading }: { profile: Profile; onAddFriend: () => void; onPress: () => void; isLoading: boolean }) {
  return (
    <Card className="flex-row items-center gap-3" padding="sm">
      <TouchableOpacity onPress={onPress} className="flex-row items-center gap-3 flex-1">
        <Avatar uri={profile.avatar_url} username={profile.username} size={40} />
        <View className="flex-1">
          <Text className="text-white font-semibold text-sm">{profile.display_name ?? profile.username}</Text>
          <Text className="text-gray-500 text-xs">@{profile.username}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onAddFriend} disabled={isLoading} className="bg-brand-950/60 border border-brand-800 rounded-lg p-2">
        <UserPlus color="#c80d0d" size={18} />
      </TouchableOpacity>
    </Card>
  );
}

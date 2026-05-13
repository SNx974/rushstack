import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Trophy, Crown, Globe, Users } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth.store';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { fetchActiveGames } from '@/services/games.service';
import { fetchLeaderboard, fetchFriendsLeaderboard } from '@/services/leaderboard.service';
import { queryKeys } from '@/lib/query/client';
import type { LeaderboardEntry, Game } from '@/types';
import { useRouter } from 'expo-router';

type FilterType = 'global' | 'game' | 'friends';

export default function LeaderboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [filterType, setFilterType] = useState<FilterType>('global');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [page] = useState(1);

  const { data: games = [] } = useQuery({
    queryKey: queryKeys.games.active,
    queryFn: fetchActiveGames,
  });

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: filterType === 'friends'
      ? queryKeys.leaderboard.friends(user?.id ?? '')
      : filterType === 'game' && selectedGame
        ? queryKeys.leaderboard.byGame(selectedGame, page)
        : queryKeys.leaderboard.global(page),
    queryFn: async () => {
      if (filterType === 'friends' && user?.id && selectedGame) {
        return { data: await fetchFriendsLeaderboard(user.id, selectedGame), count: 0, page: 1, limit: 50, hasMore: false };
      }
      return fetchLeaderboard({
        type: filterType === 'game' ? 'game' : 'global',
        game_id: selectedGame ?? undefined,
        page,
        limit: 50,
      });
    },
    enabled: filterType !== 'friends' || !!user?.id,
  });

  const entries = leaderboardData?.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-surface-400">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 border-b border-surface-100">
        <View className="flex-row items-center gap-2 mb-4">
          <Trophy color="#ffd700" size={22} />
          <Text className="text-white font-black text-xl tracking-wide">LEADERBOARD</Text>
        </View>

        {/* Filter tabs */}
        <View className="flex-row gap-2 mb-3">
          {([ 'global', 'game', 'friends'] as FilterType[]).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilterType(type)}
              className={`flex-row items-center gap-1.5 px-4 py-2 rounded-xl ${filterType === type ? 'bg-brand-700' : 'bg-surface-100'}`}
            >
              {type === 'global' && <Globe color={filterType === type ? '#fff' : '#6b7280'} size={14} />}
              {type === 'game' && <Trophy color={filterType === type ? '#fff' : '#6b7280'} size={14} />}
              {type === 'friends' && <Users color={filterType === type ? '#fff' : '#6b7280'} size={14} />}
              <Text className={`text-xs font-semibold capitalize ${filterType === type ? 'text-white' : 'text-gray-400'}`}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Game selector */}
        {(filterType === 'game' || filterType === 'friends') && (
          <View>
            <FlatList
              horizontal
              data={games}
              keyExtractor={(g) => g.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedGame(item.id)}
                  className={`mr-2 px-3 py-1.5 rounded-lg ${selectedGame === item.id ? 'bg-brand-700/30 border border-brand-700' : 'bg-surface-100'}`}
                >
                  <Text className={`text-xs font-semibold ${selectedGame === item.id ? 'text-brand-500' : 'text-gray-400'}`}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Podium (top 3) */}
      {entries.length >= 3 && (
        <Podium entries={entries.slice(0, 3)} />
      )}

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#c80d0d" size="large" />
        </View>
      ) : (
        <FlatList
          data={entries.slice(3)}
          keyExtractor={(item) => item.player_id}
          renderItem={({ item, index }) => (
            <LeaderboardRow
              entry={item}
              position={index + 4}
              isMe={item.player_id === user?.id}
              onPress={() => router.push(`/(app)/profile/${item.player_id}` as never)}
            />
          )}
          contentContainerClassName="px-5 pb-8 gap-2 pt-3"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-gray-500 text-sm">No players found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const [second, first, third] = [entries[1], entries[0], entries[2]];
  return (
    <View className="flex-row items-end justify-center px-5 pt-5 pb-3 gap-3">
      {/* 2nd */}
      <PodiumSlot entry={second} position={2} height={80} />
      {/* 1st */}
      <PodiumSlot entry={first} position={1} height={110} />
      {/* 3rd */}
      <PodiumSlot entry={third} position={3} height={64} />
    </View>
  );
}

function PodiumSlot({ entry, position, height }: { entry: LeaderboardEntry; position: number; height: number }) {
  const colors = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' };
  const color = colors[position as 1 | 2 | 3];
  return (
    <View className="flex-1 items-center">
      {position === 1 && <Crown color="#ffd700" size={20} />}
      <Avatar uri={entry.avatar_url} username={entry.username} size={48} />
      <Text className="text-white font-bold text-xs mt-1 text-center" numberOfLines={1}>{entry.username}</Text>
      <Text className="font-bold text-xs" style={{ color }}>{entry.mmr} MMR</Text>
      <View
        className="w-full rounded-t-lg mt-2 items-center justify-center"
        style={{ height, backgroundColor: color + '22', borderTopWidth: 2, borderTopColor: color }}
      >
        <Text className="font-black text-xl" style={{ color }}>#{position}</Text>
      </View>
    </View>
  );
}

function LeaderboardRow({
  entry, position, isMe, onPress,
}: { entry: LeaderboardEntry; position: number; isMe: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card className={`flex-row items-center gap-3 ${isMe ? 'border-brand-700/50' : ''}`} padding="sm">
        <Text className="text-gray-500 font-bold text-sm w-8 text-center">#{position}</Text>
        <Avatar uri={entry.avatar_url} username={entry.username} size={36} />
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center gap-2">
            <Text className="text-white font-semibold text-sm" numberOfLines={1}>
              {entry.display_name ?? entry.username}
            </Text>
            {isMe && <Badge variant="brand" size="sm">YOU</Badge>}
          </View>
          <Text className="text-gray-500 text-xs">@{entry.username}</Text>
        </View>
        <View className="items-end">
          <Text className="text-white font-bold text-sm">{entry.mmr} MMR</Text>
          <Text className="text-gray-500 text-xs">{entry.wins}W – {entry.losses}L</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

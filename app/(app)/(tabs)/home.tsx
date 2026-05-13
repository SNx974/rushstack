import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Swords, Trophy, Users, ChevronRight, Flame, Zap } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';
import { useQueueStore } from '@/stores/queue.store';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RankBadge } from '@/components/ui/RankBadge';
import { fetchActiveGames } from '@/services/games.service';
import { fetchPlayerMatchHistory } from '@/services/matches.service';
import { queryKeys } from '@/lib/query/client';
import type { Game } from '@/types';
import { format } from 'date-fns';

export default function HomeScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const searchingGameId = useQueueStore((s) => s.searchingGameId);

  const { data: games = [] } = useQuery({
    queryKey: queryKeys.games.active,
    queryFn: fetchActiveGames,
  });

  const { data: recentMatches = [] } = useQuery({
    queryKey: user ? queryKeys.matches.history(user.id) : ['noop'],
    queryFn: () => fetchPlayerMatchHistory(user!.id, 5),
    enabled: !!user?.id,
  });

  if (!profile) return null;

  return (
    <SafeAreaView className="flex-1 bg-surface-400">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Zap color="#c80d0d" size={20} />
            <Text className="text-white font-black text-lg tracking-wider">RUSH STACK</Text>
          </View>
          <TouchableOpacity onPress={() => router.push(`/(app)/profile/${profile.id}` as never)}>
            <Avatar uri={profile.avatar_url} username={profile.username} size={36} online />
          </TouchableOpacity>
        </View>

        {/* Welcome banner */}
        <View className="mx-5 mt-4 bg-brand-950/40 border border-brand-900/50 rounded-2xl p-5">
          <Text className="text-gray-400 text-sm mb-1">Welcome back,</Text>
          <Text className="text-white font-black text-2xl">{profile.display_name ?? profile.username}</Text>
          {searchingGameId && (
            <View className="flex-row items-center gap-2 mt-3 bg-brand-700/20 rounded-xl px-3 py-2 self-start">
              <Flame color="#c80d0d" size={14} />
              <Text className="text-brand-500 text-xs font-bold">SEARCHING FOR MATCH...</Text>
            </View>
          )}
        </View>

        {/* Quick actions */}
        <View className="px-5 mt-6">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(app)/(tabs)/queue' as never)}
              className="flex-1 bg-brand-700 rounded-2xl p-4 items-center gap-2"
            >
              <Swords color="#ffffff" size={24} />
              <Text className="text-white font-bold text-sm">Play Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(app)/(tabs)/leaderboard' as never)}
              className="flex-1 bg-surface-200 border border-surface-100 rounded-2xl p-4 items-center gap-2"
            >
              <Trophy color="#ffd700" size={24} />
              <Text className="text-white font-bold text-sm">Rankings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(app)/(tabs)/social' as never)}
              className="flex-1 bg-surface-200 border border-surface-100 rounded-2xl p-4 items-center gap-2"
            >
              <Users color="#3b82f6" size={24} />
              <Text className="text-white font-bold text-sm">Friends</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Games */}
        <View className="mt-6">
          <View className="px-5 flex-row items-center justify-between mb-3">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
              Active Games
            </Text>
            <TouchableOpacity className="flex-row items-center gap-1">
              <Text className="text-brand-600 text-xs font-semibold">See all</Text>
              <ChevronRight color="#c80d0d" size={14} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-5 gap-3">
            {games.map((game) => (
              <GameCard key={game.id} game={game} onPress={() => router.push(`/(app)/game/${game.id}` as never)} />
            ))}
          </ScrollView>
        </View>

        {/* Recent matches */}
        {recentMatches.length > 0 && (
          <View className="px-5 mt-6 mb-8">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
              Recent Matches
            </Text>
            <View className="gap-3">
              {recentMatches.slice(0, 5).map((mp) => (
                <RecentMatchRow
                  key={mp.id}
                  matchPlayer={mp as never}
                  onPress={() => router.push(`/(app)/match/${(mp as never).match?.id}` as never)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function GameCard({ game, onPress }: { game: Game; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="w-36">
      <Card padding="none" className="overflow-hidden">
        <View className="h-20 bg-brand-950/50 items-center justify-center">
          <Text className="text-4xl">🎮</Text>
        </View>
        <View className="p-3">
          <Text className="text-white font-bold text-sm" numberOfLines={1}>{game.name}</Text>
          <Badge variant="brand" size="sm">{game.is_active ? 'Active' : 'Inactive'}</Badge>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function RecentMatchRow({ matchPlayer, onPress }: { matchPlayer: any; onPress: () => void }) {
  const match = matchPlayer.match;
  if (!match) return null;
  const isWinner = matchPlayer.is_winner;
  const delta = matchPlayer.mmr_delta;

  return (
    <TouchableOpacity onPress={onPress}>
      <Card className="flex-row items-center gap-3">
        <View
          className={`w-1 self-stretch rounded-full ${isWinner ? 'bg-green-500' : isWinner === false ? 'bg-red-600' : 'bg-gray-600'}`}
        />
        <View className="flex-1">
          <Text className="text-white font-semibold text-sm">{match.game?.name ?? 'Match'}</Text>
          <Text className="text-gray-500 text-xs">
            {match.completed_at ? format(new Date(match.completed_at), 'MMM d, HH:mm') : 'In progress'}
          </Text>
        </View>
        {isWinner !== null && (
          <View>
            <Badge variant={isWinner ? 'success' : 'danger'}>{isWinner ? 'WIN' : 'LOSS'}</Badge>
            {delta !== null && (
              <Text className={`text-xs font-bold text-center mt-1 ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {delta > 0 ? '+' : ''}{delta} MMR
              </Text>
            )}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { Swords, Clock, Users, Zap, X, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useQueueStore } from '@/stores/queue.store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { fetchActiveGames, fetchGameMmrSystem } from '@/services/games.service';
import { joinQueue, leaveQueue, getQueueForGame, attemptMatchmaking } from '@/services/queue.service';
import { queryKeys } from '@/lib/query/client';
import type { Game, QueueEntry } from '@/types';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';

export default function QueueScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const isInQueue = useQueueStore((s) => selectedGame ? s.isInQueue(selectedGame.id) : false);
  const myEntry = useQueueStore((s) => selectedGame ? s.myEntries[selectedGame.id] ?? null : null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: games = [] } = useQuery({
    queryKey: queryKeys.games.active,
    queryFn: fetchActiveGames,
  });

  const { data: queueEntries = [], isLoading: queueLoading } = useQuery({
    queryKey: selectedGame ? queryKeys.queue.byGame(selectedGame.id) : ['noop'],
    queryFn: () => getQueueForGame(selectedGame!.id),
    enabled: !!selectedGame,
    refetchInterval: 5000,
  });

  // Timer for queue duration
  useEffect(() => {
    if (isInQueue && myEntry) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isInQueue, myEntry?.id]);

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedGame) return;
      const system = await fetchGameMmrSystem(selectedGame.id);
      const mmrData = await supabase
        .from('player_mmr')
        .select('mmr')
        .eq('player_id', user.id)
        .eq('game_id', selectedGame.id)
        .maybeSingle();
      const mmr = mmrData.data?.mmr ?? system.base_mmr;
      return joinQueue({ player_id: user.id, game_id: selectedGame.id, mmr_system_id: system.id, mmr_at_queue: mmr, match_id: null });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: selectedGame ? queryKeys.queue.byGame(selectedGame.id) : [] });
      // Attempt matchmaking (in production this is an Edge Function)
      if (selectedGame) attemptMatchmaking(selectedGame.id).catch(() => {});
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => {
      if (!user || !selectedGame) return Promise.resolve();
      return leaveQueue(user.id, selectedGame.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: selectedGame ? queryKeys.queue.byGame(selectedGame.id) : [] });
    },
  });

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView className="flex-1 bg-surface-400">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 border-b border-surface-100">
        <View className="flex-row items-center gap-2 mb-4">
          <Swords color="#c80d0d" size={22} />
          <Text className="text-white font-black text-xl tracking-wide">MATCHMAKING</Text>
        </View>

        {/* Game selector */}
        <FlatList
          horizontal
          data={games}
          keyExtractor={(g) => g.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedGame(item)}
              className={`mr-2 px-4 py-2.5 rounded-xl ${selectedGame?.id === item.id ? 'bg-brand-700' : 'bg-surface-100'}`}
            >
              <Text className={`font-bold text-sm ${selectedGame?.id === item.id ? 'text-white' : 'text-gray-400'}`}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {!selectedGame ? (
        <View className="flex-1 items-center justify-center gap-3">
          <Swords color="#374151" size={48} />
          <Text className="text-gray-500 text-base font-semibold">Select a game to queue</Text>
        </View>
      ) : (
        <View className="flex-1">
          {/* Queue status */}
          <View className="px-5 pt-5">
            <Card glow={isInQueue} className="items-center py-6 gap-4">
              {isInQueue ? (
                <>
                  <View className="w-16 h-16 bg-brand-950/60 rounded-full items-center justify-center border-2 border-brand-700">
                    <Zap color="#c80d0d" size={28} />
                  </View>
                  <View className="items-center">
                    <Text className="text-white font-black text-lg">SEARCHING...</Text>
                    <Text className="text-brand-600 font-bold text-2xl mt-1">{formatTime(elapsed)}</Text>
                    <Text className="text-gray-500 text-sm mt-1">{selectedGame.name}</Text>
                  </View>
                  <Button
                    onPress={() => leaveMutation.mutate()}
                    loading={leaveMutation.isPending}
                    variant="danger"
                    icon={<X color="#fff" size={16} />}
                  >
                    Cancel Queue
                  </Button>
                </>
              ) : (
                <>
                  <View className="w-16 h-16 bg-surface-100 rounded-full items-center justify-center">
                    <Swords color="#6b7280" size={28} />
                  </View>
                  <View className="items-center gap-1">
                    <Text className="text-white font-bold text-lg">{selectedGame.name}</Text>
                    <View className="flex-row items-center gap-2">
                      <Users color="#6b7280" size={14} />
                      <Text className="text-gray-500 text-sm">{queueEntries.length} players in queue</Text>
                    </View>
                  </View>
                  <Button
                    onPress={() => joinMutation.mutate()}
                    loading={joinMutation.isPending}
                    icon={<Zap color="#fff" size={16} />}
                    size="lg"
                  >
                    Find Match
                  </Button>
                </>
              )}
            </Card>
          </View>

          {/* Live queue */}
          <View className="px-5 mt-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
                Players in Queue ({queueEntries.length})
              </Text>
              {queueLoading && <ActivityIndicator size="small" color="#6b7280" />}
            </View>
            <FlatList
              data={queueEntries}
              keyExtractor={(e) => e.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <QueueEntryRow entry={item} isMe={item.player_id === user?.id} />}
              ListEmptyComponent={
                <View className="items-center py-8">
                  <Text className="text-gray-600 text-sm">No players searching right now</Text>
                </View>
              }
              ItemSeparatorComponent={() => <View className="h-2" />}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function QueueEntryRow({ entry, isMe }: { entry: QueueEntry; isMe: boolean }) {
  return (
    <Card className={`flex-row items-center gap-3 ${isMe ? 'border-brand-700/50' : ''}`} padding="sm">
      <View className="w-8 h-8 rounded-full bg-surface-100 items-center justify-center">
        <Text className="text-gray-400 text-xs font-bold">{entry.mmr_at_queue}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-300 text-xs" numberOfLines={1}>
          {isMe ? '(You)' : `Player #${entry.player_id.slice(0, 6)}`}
        </Text>
        <View className="flex-row items-center gap-1 mt-0.5">
          <Clock color="#6b7280" size={10} />
          <Text className="text-gray-600 text-xs">
            {formatDistanceToNow(new Date(entry.joined_at), { addSuffix: true })}
          </Text>
        </View>
      </View>
      <Badge variant="brand">{entry.mmr_at_queue} MMR</Badge>
    </Card>
  );
}

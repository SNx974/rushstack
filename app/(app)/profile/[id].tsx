import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit2, MapPin, ExternalLink, Trophy, Swords, TrendingUp } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useAuthStore } from '@/stores/auth.store';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { RankBadge } from '@/components/ui/RankBadge';
import { Button } from '@/components/ui/Button';
import { fetchProfile } from '@/services/profile.service';
import { fetchPlayerMatchHistory } from '@/services/matches.service';
import { queryKeys } from '@/lib/query/client';
import { supabase } from '@/lib/supabase';
import type { PlayerMmr, RankTier } from '@/types';
import { format } from 'date-fns';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const isMe = currentUser?.id === id;

  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.profiles.detail(id),
    queryFn: () => fetchProfile(id),
    enabled: !!id,
  });

  const { data: matchHistory = [] } = useQuery({
    queryKey: queryKeys.matches.history(id),
    queryFn: () => fetchPlayerMatchHistory(id, 10),
    enabled: !!id,
  });

  const { data: playerMmrList = [] } = useQuery({
    queryKey: queryKeys.playerMmr.all(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_mmr')
        .select(`*, game:games(id, name, icon_url), mmr_system:mmr_systems(*)`)
        .eq('player_id', id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface-400 items-center justify-center">
        <ActivityIndicator size="large" color="#c80d0d" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-surface-400 items-center justify-center">
        <Text className="text-gray-500 text-lg">Player not found</Text>
      </SafeAreaView>
    );
  }

  const totalWins = playerMmrList.reduce((s, m) => s + m.wins, 0);
  const totalLosses = playerMmrList.reduce((s, m) => s + m.losses, 0);
  const winRate = totalWins + totalLosses > 0
    ? Math.round(totalWins / (totalWins + totalLosses) * 100)
    : 0;

  return (
    <SafeAreaView className="flex-1 bg-surface-400">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View className="h-40 bg-brand-950/60 relative">
          {profile.banner_url && (
            <Image source={{ uri: profile.banner_url }} style={{ ...StyleSheet.absoluteFillObject }} contentFit="cover" />
          )}
          <View className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-400/90" />

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-9 h-9 bg-black/50 rounded-full items-center justify-center"
          >
            <ArrowLeft color="#ffffff" size={18} />
          </TouchableOpacity>

          {/* Edit button for own profile */}
          {isMe && (
            <TouchableOpacity
              onPress={() => router.push('/(app)/settings' as never)}
              className="absolute top-4 right-4 w-9 h-9 bg-black/50 rounded-full items-center justify-center"
            >
              <Edit2 color="#ffffff" size={16} />
            </TouchableOpacity>
          )}
        </View>

        {/* Profile info */}
        <View className="px-5 -mt-10">
          <View className="flex-row items-end justify-between mb-4">
            <View className="border-4 border-surface-400 rounded-full">
              <Avatar uri={profile.avatar_url} username={profile.username} size={80} />
            </View>
            {!isMe && (
              <Button variant="outline" size="sm" onPress={() => {}}>Add Friend</Button>
            )}
          </View>

          {/* Name and role */}
          <View className="mb-1">
            <View className="flex-row items-center gap-2 flex-wrap">
              <Text className="text-white font-black text-2xl">{profile.display_name ?? profile.username}</Text>
              {profile.is_verified && <Badge variant="info">✓ Verified</Badge>}
              {profile.role !== 'player' && (
                <Badge variant={profile.role === 'admin' || profile.role === 'superadmin' ? 'danger' : 'warning'}>
                  {profile.role.toUpperCase()}
                </Badge>
              )}
            </View>
            <Text className="text-gray-500 text-sm">@{profile.username}</Text>
          </View>

          {/* Bio */}
          {profile.bio && (
            <Text className="text-gray-400 text-sm mt-2 mb-3">{profile.bio}</Text>
          )}

          {/* Meta */}
          <View className="flex-row gap-4 mb-5">
            {profile.country && (
              <View className="flex-row items-center gap-1.5">
                <MapPin color="#6b7280" size={13} />
                <Text className="text-gray-500 text-xs">{profile.country}</Text>
              </View>
            )}
            {profile.created_at && (
              <Text className="text-gray-600 text-xs">
                Joined {format(new Date(profile.created_at), 'MMM yyyy')}
              </Text>
            )}
          </View>

          {/* Stats summary */}
          <View className="flex-row gap-3 mb-5">
            {[
              { label: 'Wins', value: totalWins, icon: <Trophy color="#ffd700" size={14} /> },
              { label: 'Losses', value: totalLosses, icon: <Swords color="#ef4444" size={14} /> },
              { label: 'Win Rate', value: `${winRate}%`, icon: <TrendingUp color="#22c55e" size={14} /> },
            ].map((stat) => (
              <Card key={stat.label} className="flex-1 items-center py-3" padding="none">
                <View className="mb-1">{stat.icon}</View>
                <Text className="text-white font-bold text-lg">{stat.value}</Text>
                <Text className="text-gray-500 text-xs">{stat.label}</Text>
              </Card>
            ))}
          </View>

          {/* Game ranks */}
          {playerMmrList.length > 0 && (
            <View className="mb-5">
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
                Game Ranks
              </Text>
              <View className="gap-3">
                {playerMmrList.map((pm: any) => (
                  <Card key={pm.id} className="flex-row items-center gap-3">
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-sm">{pm.game?.name}</Text>
                      <Text className="text-gray-500 text-xs">{pm.wins}W / {pm.losses}L</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-white font-bold text-base">{pm.mmr}</Text>
                      <Text className="text-gray-600 text-xs">MMR</Text>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          )}

          {/* Match history */}
          {matchHistory.length > 0 && (
            <View className="mb-8">
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
                Recent Matches
              </Text>
              <View className="gap-2">
                {matchHistory.map((mp: any) => {
                  const m = mp.match;
                  if (!m) return null;
                  return (
                    <Card key={mp.id} className="flex-row items-center gap-3" padding="sm">
                      <View className={`w-1 self-stretch rounded-full ${mp.is_winner ? 'bg-green-500' : 'bg-red-600'}`} />
                      <View className="flex-1">
                        <Text className="text-white font-medium text-sm">{m.game?.name}</Text>
                        <Text className="text-gray-500 text-xs">
                          {m.completed_at ? format(new Date(m.completed_at), 'MMM d, HH:mm') : '—'}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Badge variant={mp.is_winner ? 'success' : 'danger'}>{mp.is_winner ? 'WIN' : 'LOSS'}</Badge>
                        {mp.mmr_delta !== null && (
                          <Text className={`text-xs font-bold mt-0.5 ${mp.mmr_delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {mp.mmr_delta > 0 ? '+' : ''}{mp.mmr_delta} MMR
                          </Text>
                        )}
                      </View>
                    </Card>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Simple StyleSheet shim for web compatibility
const StyleSheet = { absoluteFillObject: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 } };

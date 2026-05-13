import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, Flag, Check, AlertTriangle } from 'lucide-react-native';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { fetchMatch, submitMatchResult, openDispute } from '@/services/matches.service';
import { queryKeys } from '@/lib/query/client';
import { format } from 'date-fns';

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [selectedWinner, setSelectedWinner] = useState<number | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  const { data: match, isLoading } = useQuery({
    queryKey: queryKeys.matches.detail(id),
    queryFn: () => fetchMatch(id),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: () => submitMatchResult({
      match_id: id,
      submitted_by: user!.id,
      winning_team: selectedWinner!,
      screenshot_url: null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.matches.detail(id) });
      Alert.alert('Result submitted', 'Waiting for opponent confirmation.');
    },
  });

  const disputeMutation = useMutation({
    mutationFn: () => openDispute({ match_id: id, opened_by: user!.id, reason: disputeReason }),
    onSuccess: () => Alert.alert('Dispute opened', 'A moderator will review your case.'),
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface-400 items-center justify-center">
        <ActivityIndicator color="#c80d0d" size="large" />
      </SafeAreaView>
    );
  }

  if (!match) return null;

  const myPlayer = (match as any).match_players?.find((mp: any) => mp.player_id === user?.id);
  const myTeam = myPlayer?.team;
  const isCompleted = match.status === 'completed';
  const isActive = match.status === 'active';
  const teams: Record<number, any[]> = {};
  (match as any).match_players?.forEach((mp: any) => {
    teams[mp.team] = teams[mp.team] ?? [];
    teams[mp.team].push(mp);
  });

  return (
    <SafeAreaView className="flex-1 bg-surface-400">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-3 flex-row items-center gap-3 border-b border-surface-100">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <ArrowLeft color="#ffffff" size={22} />
          </TouchableOpacity>
          <Text className="text-white font-black text-lg flex-1">{(match as any).game?.name ?? 'Match'}</Text>
          <Badge
            variant={
              isCompleted ? 'success' :
              match.status === 'disputed' ? 'danger' :
              isActive ? 'brand' : 'default'
            }
          >
            {match.status.toUpperCase()}
          </Badge>
        </View>

        <View className="px-5 pt-5 gap-5">
          {/* Match date */}
          <Text className="text-gray-500 text-xs text-center">
            {match.started_at ? format(new Date(match.started_at), 'MMM d, yyyy HH:mm') : 'Pending start'}
          </Text>

          {/* Teams */}
          <View className="gap-4">
            {Object.entries(teams).map(([teamNum, players]) => {
              const team = Number(teamNum);
              const result = (match as any).match_results?.[0];
              const isWinner = result?.status === 'confirmed' && result?.winning_team === team;
              return (
                <Card key={teamNum} glow={isWinner} className={isWinner ? 'border-green-700/50' : ''}>
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
                      Team {teamNum}
                    </Text>
                    {isWinner && <Badge variant="success">WINNER</Badge>}
                  </View>
                  {players.map((mp: any) => (
                    <View key={mp.player_id} className="flex-row items-center gap-3 py-2">
                      <Avatar uri={mp.profile?.avatar_url} username={mp.profile?.username} size={36} />
                      <View className="flex-1">
                        <Text className="text-white font-semibold text-sm">
                          {mp.profile?.display_name ?? mp.profile?.username ?? 'Unknown'}
                        </Text>
                        <Text className="text-gray-500 text-xs">{mp.mmr_at_match} MMR</Text>
                      </View>
                      {mp.mmr_delta !== null && (
                        <Text className={`font-bold text-sm ${mp.mmr_delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {mp.mmr_delta > 0 ? '+' : ''}{mp.mmr_delta}
                        </Text>
                      )}
                    </View>
                  ))}
                </Card>
              );
            })}
          </View>

          {/* Submit result */}
          {isActive && myTeam && (
            <Card className="gap-4">
              <Text className="text-white font-bold text-base">Submit Result</Text>
              <Text className="text-gray-400 text-sm">Which team won?</Text>
              <View className="flex-row gap-3">
                {Object.keys(teams).map((teamNum) => (
                  <TouchableOpacity
                    key={teamNum}
                    onPress={() => setSelectedWinner(Number(teamNum))}
                    className={`flex-1 py-3 rounded-xl border items-center ${
                      selectedWinner === Number(teamNum)
                        ? 'bg-brand-700/20 border-brand-700'
                        : 'bg-surface-100 border-surface-100'
                    }`}
                  >
                    <Text className={`font-bold text-sm ${selectedWinner === Number(teamNum) ? 'text-brand-500' : 'text-gray-400'}`}>
                      Team {teamNum}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                onPress={() => submitMutation.mutate()}
                loading={submitMutation.isPending}
                disabled={selectedWinner === null}
                icon={<Check color="#fff" size={16} />}
                fullWidth
              >
                Submit Result
              </Button>

              <Button
                onPress={() => disputeMutation.mutate()}
                loading={disputeMutation.isPending}
                variant="danger"
                icon={<Flag color="#fff" size={16} />}
                fullWidth
              >
                Open Dispute
              </Button>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, AlertTriangle, Check, X } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { fetchAllDisputes, resolveDispute } from '@/services/admin.service';
import { queryKeys } from '@/lib/query/client';
import { useAuthStore } from '@/stores/auth.store';
import { format } from 'date-fns';

type StatusFilter = 'open' | 'under_review' | 'resolved';

export default function AdminDisputesScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const adminProfile = useAuthStore((s) => s.profile);
  const [filter, setFilter] = useState<StatusFilter>('open');

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: queryKeys.admin.disputes(filter),
    queryFn: () => fetchAllDisputes(filter),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolution, cancelMatch }: { id: string; resolution: string; cancelMatch: boolean }) =>
      resolveDispute(id, adminProfile!.id, resolution, cancelMatch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.disputes() });
      Alert.alert('Dispute resolved');
    },
  });

  function promptResolve(id: string) {
    Alert.prompt('Resolve dispute', 'Enter resolution notes:', (resolution) => {
      if (!resolution) return;
      Alert.alert('Cancel match?', 'Should the match be cancelled?', [
        { text: 'No', onPress: () => resolveMutation.mutate({ id, resolution, cancelMatch: false }) },
        { text: 'Yes', style: 'destructive', onPress: () => resolveMutation.mutate({ id, resolution, cancelMatch: true }) },
      ]);
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-400">
      <View className="px-5 pt-4 pb-3 flex-row items-center gap-3 border-b border-surface-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft color="#ffffff" size={20} />
        </TouchableOpacity>
        <Text className="text-white font-black text-lg flex-1">Disputes</Text>
        {isLoading && <ActivityIndicator size="small" color="#c80d0d" />}
      </View>

      {/* Filter */}
      <View className="px-5 py-3 flex-row gap-2 border-b border-surface-100">
        {(['open', 'under_review', 'resolved'] as StatusFilter[]).map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg ${filter === s ? 'bg-brand-700' : 'bg-surface-100'}`}
          >
            <Text className={`text-xs font-semibold capitalize ${filter === s ? 'text-white' : 'text-gray-400'}`}>
              {s.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={disputes}
        keyExtractor={(d) => d.id}
        renderItem={({ item }) => (
          <DisputeRow dispute={item as never} onResolve={() => promptResolve(item.id)} />
        )}
        contentContainerClassName="px-5 py-4 gap-3"
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20 gap-2">
              <AlertTriangle color="#374151" size={40} />
              <Text className="text-gray-500 text-sm">No disputes found</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function DisputeRow({ dispute, onResolve }: { dispute: any; onResolve: () => void }) {
  return (
    <Card className="gap-3">
      <View className="flex-row items-start gap-3">
        <AlertTriangle color="#f59e0b" size={18} />
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Badge
              variant={dispute.status === 'open' ? 'warning' : dispute.status === 'resolved' ? 'success' : 'info'}
            >
              {dispute.status.toUpperCase()}
            </Badge>
            <Text className="text-gray-500 text-xs">
              {format(new Date(dispute.created_at), 'MMM d, HH:mm')}
            </Text>
          </View>
          <Text className="text-white font-semibold text-sm" numberOfLines={2}>{dispute.reason}</Text>
          {dispute.match && (
            <Text className="text-gray-500 text-xs mt-1">Match: {dispute.match.game?.name}</Text>
          )}
          {dispute.opener && (
            <Text className="text-gray-500 text-xs">By: @{dispute.opener.username}</Text>
          )}
          {dispute.resolution && (
            <View className="mt-2 bg-green-900/20 rounded-lg p-2">
              <Text className="text-green-400 text-xs">{dispute.resolution}</Text>
            </View>
          )}
        </View>
      </View>
      {dispute.status !== 'resolved' && (
        <Button onPress={onResolve} variant="secondary" size="sm" icon={<Check color="#22c55e" size={14} />}>
          Resolve
        </Button>
      )}
    </Card>
  );
}

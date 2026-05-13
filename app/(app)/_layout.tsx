import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { View, ActivityIndicator } from 'react-native';
import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Wire realtime globally once authenticated
  useRealtimeSubscriptions();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-400">
        <ActivityIndicator size="large" color="#c80d0d" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0a0a0a' },
      }}
    />
  );
}

import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { View, Text } from 'react-native';

export default function AdminLayout() {
  const profile = useAuthStore((s) => s.profile);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  if (!profile) return null;

  const isAllowed = ['admin', 'superadmin', 'moderator'].includes(profile.role);
  if (!isAllowed) {
    return (
      <View className="flex-1 bg-surface-400 items-center justify-center">
        <Text className="text-red-500 font-bold text-lg">Access Denied</Text>
        <Text className="text-gray-500 text-sm mt-2">You need admin privileges.</Text>
      </View>
    );
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

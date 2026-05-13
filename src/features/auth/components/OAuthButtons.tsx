import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { signInWithOAuth } from '@/features/auth/services/auth.service';

const OAUTH_PROVIDERS = [
  { id: 'discord' as const, label: 'Discord',  color: '#5865F2', letter: 'D' },
  { id: 'google'  as const, label: 'Google',   color: '#EA4335', letter: 'G' },
  { id: 'twitch'  as const, label: 'Twitch',   color: '#9146FF', letter: 'T' },
];

interface OAuthButtonsProps {
  onError: (msg: string) => void;
}

export function OAuthButtons({ onError }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  async function handleOAuth(provider: 'discord' | 'google' | 'twitch') {
    try {
      setLoadingProvider(provider);
      await signInWithOAuth(provider);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'OAuth failed');
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <View className="gap-3">
      {OAUTH_PROVIDERS.map((p) => (
        <TouchableOpacity
          key={p.id}
          onPress={() => handleOAuth(p.id)}
          disabled={loadingProvider !== null}
          className="flex-row items-center justify-center gap-3 bg-surface-100 border border-surface-100 rounded-xl py-3.5 active:bg-surface-200"
        >
          {loadingProvider === p.id ? (
            <ActivityIndicator size="small" color={p.color} />
          ) : (
            <View
              className="w-6 h-6 rounded-md items-center justify-center"
              style={{ backgroundColor: p.color }}
            >
              <Text className="text-white font-bold text-xs">{p.letter}</Text>
            </View>
          )}
          <Text className="text-gray-200 font-semibold text-sm">
            Continue with {p.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

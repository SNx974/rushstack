import { View, Text } from 'react-native';
import { Image } from 'expo-image';

interface AvatarProps {
  uri?: string | null;
  username?: string;
  size?: number;
  online?: boolean;
  className?: string;
}

export function Avatar({ uri, username, size = 40, online, className = '' }: AvatarProps) {
  const initials = username?.slice(0, 2).toUpperCase() ?? '??';
  const fontSize = Math.max(10, Math.floor(size * 0.38));
  const indicatorSize = Math.max(8, Math.floor(size * 0.28));

  return (
    <View className={`relative ${className}`} style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          className="bg-brand-950 items-center justify-center"
          style={{ width: size, height: size, borderRadius: size / 2 }}
        >
          <Text className="text-brand-500 font-bold" style={{ fontSize }}>
            {initials}
          </Text>
        </View>
      )}

      {online !== undefined && (
        <View
          className={`absolute bottom-0 right-0 rounded-full border-2 border-surface-400 ${online ? 'bg-online' : 'bg-offline'}`}
          style={{ width: indicatorSize, height: indicatorSize }}
        />
      )}
    </View>
  );
}

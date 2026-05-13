import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import type { RankTier } from '@/types';

interface RankBadgeProps {
  tier: RankTier | null | undefined;
  mmr?: number;
  showMmr?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const sizeConfig = {
  sm: { icon: 20, text: 'text-xs', mmrText: 'text-xs' },
  md: { icon: 32, text: 'text-sm', mmrText: 'text-xs' },
  lg: { icon: 48, text: 'text-base', mmrText: 'text-sm' },
};

export function RankBadge({ tier, mmr, showMmr = false, size = 'md', showName = true }: RankBadgeProps) {
  const cfg = sizeConfig[size];

  if (!tier) {
    return (
      <View className="flex-row items-center gap-2">
        <View
          className="bg-surface-100 rounded-full items-center justify-center"
          style={{ width: cfg.icon, height: cfg.icon }}
        >
          <Text className="text-gray-500 font-bold" style={{ fontSize: cfg.icon * 0.4 }}>?</Text>
        </View>
        {showName && <Text className="text-gray-500 font-semibold text-xs">Unranked</Text>}
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-2">
      {tier.icon_url ? (
        <Image
          source={{ uri: tier.icon_url }}
          style={{ width: cfg.icon, height: cfg.icon }}
          contentFit="contain"
        />
      ) : (
        <View
          className="rounded-full items-center justify-center"
          style={{
            width: cfg.icon,
            height: cfg.icon,
            backgroundColor: tier.color + '33',
            borderWidth: 2,
            borderColor: tier.color,
          }}
        >
          <Text style={{ color: tier.color, fontSize: cfg.icon * 0.35, fontWeight: '800' }}>
            {tier.name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
      )}

      {(showName || showMmr) && (
        <View>
          {showName && (
            <Text className={`font-bold ${cfg.text}`} style={{ color: tier.color }}>
              {tier.name} {tier.division && `${tier.division}`}
            </Text>
          )}
          {showMmr && mmr !== undefined && (
            <Text className={`text-gray-400 ${cfg.mmrText}`}>{mmr} MMR</Text>
          )}
        </View>
      )}
    </View>
  );
}

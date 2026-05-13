import { View, Text } from 'react-native';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'brand' | 'info';

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default:  { bg: 'bg-surface-100', text: 'text-gray-300' },
  success:  { bg: 'bg-green-900/40', text: 'text-green-400' },
  warning:  { bg: 'bg-amber-900/40', text: 'text-amber-400' },
  danger:   { bg: 'bg-red-900/40', text: 'text-red-400' },
  brand:    { bg: 'bg-brand-950/60', text: 'text-brand-500' },
  info:     { bg: 'bg-blue-900/40', text: 'text-blue-400' },
};

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const { bg, text } = variantStyles[variant];
  return (
    <View className={`rounded-full self-start ${bg} ${size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1'}`}>
      <Text className={`font-semibold ${text} ${size === 'sm' ? 'text-xs' : 'text-xs'}`}>
        {children}
      </Text>
    </View>
  );
}

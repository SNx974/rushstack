import { View, Text } from 'react-native';

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className = '' }: DividerProps) {
  if (!label) {
    return <View className={`h-px bg-surface-100 ${className}`} />;
  }

  return (
    <View className={`flex-row items-center gap-3 ${className}`}>
      <View className="flex-1 h-px bg-surface-100" />
      <Text className="text-gray-500 text-xs font-medium">{label}</Text>
      <View className="flex-1 h-px bg-surface-100" />
    </View>
  );
}

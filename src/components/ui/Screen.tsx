import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';

interface ScreenProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  scrollable?: boolean;
  className?: string;
  headerRight?: ReactNode;
}

export function Screen({
  children,
  title,
  showBack = false,
  scrollable = true,
  className = '',
  headerRight,
}: ScreenProps) {
  const router = useRouter();
  const content = scrollable ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={`pb-8 ${className}`}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${className}`}>{children}</View>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface-400">
      {(title || showBack) && (
        <View className="flex-row items-center px-4 py-3 border-b border-surface-100">
          {showBack && (
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
              <ArrowLeft color="#ffffff" size={22} />
            </TouchableOpacity>
          )}
          {title && (
            <Text className="text-white font-bold text-lg flex-1">{title}</Text>
          )}
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}
      {content}
    </SafeAreaView>
  );
}

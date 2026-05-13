import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Zap } from 'lucide-react-native';
import { loginSchema, type LoginInput } from '@/features/auth/schemas/auth.schemas';
import { signIn } from '@/features/auth/services/auth.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { OAuthButtons } from '@/features/auth/components/OAuthButtons';
import { useState } from 'react';

export default function LoginScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { isSubmitting, errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginInput) {
    try {
      setError(null);
      await signIn(values.email, values.password);
      // Auth state listener in _layout will redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-surface-400"
      contentContainerClassName="min-h-full justify-center px-6 py-12"
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo */}
      <View className="items-center mb-10">
        <View className="flex-row items-center gap-2 mb-3">
          <Zap color="#c80d0d" size={32} />
          <Text className="text-white font-black text-3xl tracking-widest">RUSH STACK</Text>
        </View>
        <Text className="text-gray-500 text-sm">Competitive matchmaking platform</Text>
      </View>

      {/* Form card */}
      <View className="bg-surface-300 rounded-3xl border border-surface-100 p-6 gap-5">
        <Text className="text-white font-bold text-xl text-center">Sign In</Text>

        {error && (
          <View className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="your@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
              leftIcon={<Mail color="#6b7280" size={18} />}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
              leftIcon={<Lock color="#6b7280" size={18} />}
            />
          )}
        />

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
          <Text className="text-brand-600 text-sm font-semibold text-right">Forgot password?</Text>
        </TouchableOpacity>

        <Button onPress={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth>
          Sign In
        </Button>

        <Divider label="or continue with" />

        <OAuthButtons onError={setError} />
      </View>

      {/* Register link */}
      <View className="flex-row justify-center mt-6 gap-1">
        <Text className="text-gray-500 text-sm">Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text className="text-brand-600 font-semibold text-sm">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Zap } from 'lucide-react-native';
import { registerSchema, type RegisterInput } from '@/features/auth/schemas/auth.schemas';
import { signUp } from '@/features/auth/services/auth.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { OAuthButtons } from '@/features/auth/components/OAuthButtons';
import { useState } from 'react';

export default function RegisterScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, formState: { isSubmitting, errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterInput) {
    try {
      setError(null);
      await signUp(values.email, values.password, values.username);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  if (success) {
    return (
      <View className="flex-1 bg-surface-400 items-center justify-center px-6">
        <Zap color="#c80d0d" size={48} />
        <Text className="text-white font-bold text-2xl mt-4 mb-2">Check your email</Text>
        <Text className="text-gray-400 text-sm text-center mb-8">
          We sent a verification link to your email. Click it to activate your account.
        </Text>
        <Button onPress={() => router.replace('/(auth)/login')} variant="outline">
          Back to Login
        </Button>
      </View>
    );
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
        <Text className="text-gray-500 text-sm">Join the competition</Text>
      </View>

      <View className="bg-surface-300 rounded-3xl border border-surface-100 p-6 gap-5">
        <Text className="text-white font-bold text-xl text-center">Create Account</Text>

        {error && (
          <View className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Username"
              placeholder="CyberPlayer99"
              autoCapitalize="none"
              returnKeyType="next"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.username?.message}
              hint="3–24 chars, letters/numbers/_ only"
              leftIcon={<User color="#6b7280" size={18} />}
            />
          )}
        />

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
              returnKeyType="next"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
              hint="At least 8 characters"
              leftIcon={<Lock color="#6b7280" size={18} />}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirm Password"
              placeholder="••••••••"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.confirmPassword?.message}
              leftIcon={<Lock color="#6b7280" size={18} />}
            />
          )}
        />

        <Button onPress={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth>
          Create Account
        </Button>

        <Divider label="or continue with" />

        <OAuthButtons onError={setError} />
      </View>

      <View className="flex-row justify-center mt-6 gap-1">
        <Text className="text-gray-500 text-sm">Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text className="text-brand-600 font-semibold text-sm">Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

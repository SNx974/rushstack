import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/features/auth/schemas/auth.schemas';
import { resetPassword } from '@/features/auth/services/auth.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { isSubmitting, errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordInput) {
    try {
      setError(null);
      await resetPassword(values.email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-surface-400"
      contentContainerClassName="min-h-full justify-center px-6 py-12"
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2 mb-8">
        <ArrowLeft color="#6b7280" size={20} />
        <Text className="text-gray-400 text-sm">Back</Text>
      </TouchableOpacity>

      <View className="bg-surface-300 rounded-3xl border border-surface-100 p-6 gap-5">
        <View className="items-center mb-2">
          <Text className="text-white font-bold text-xl mb-2">Reset Password</Text>
          <Text className="text-gray-500 text-sm text-center">
            Enter your email and we'll send you a reset link.
          </Text>
        </View>

        {sent ? (
          <View className="items-center gap-4 py-4">
            <View className="w-16 h-16 bg-green-900/30 rounded-full items-center justify-center">
              <Mail color="#22c55e" size={28} />
            </View>
            <Text className="text-green-400 font-semibold text-center">
              Reset link sent! Check your inbox.
            </Text>
            <Button onPress={() => router.replace('/(auth)/login')} variant="outline">
              Back to Login
            </Button>
          </View>
        ) : (
          <>
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
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                  leftIcon={<Mail color="#6b7280" size={18} />}
                />
              )}
            />

            <Button onPress={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth>
              Send Reset Link
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  );
}

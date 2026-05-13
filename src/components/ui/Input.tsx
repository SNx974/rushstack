import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';
import type { TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, leftIcon, rightIcon, containerClassName = '', secureTextEntry, ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View className={`w-full ${containerClassName}`}>
      {label && (
        <Text className="text-gray-300 text-sm font-semibold mb-2">{label}</Text>
      )}

      <View
        className={`
          flex-row items-center bg-surface-100 rounded-xl border px-4 h-12
          ${error ? 'border-red-600' : 'border-surface-100 focus-within:border-brand-700'}
        `}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <TextInput
          ref={ref}
          className="flex-1 text-white text-sm"
          placeholderTextColor="#6b7280"
          selectionColor="#c80d0d"
          secureTextEntry={isPassword && !showPassword}
          style={{ outline: 'none' } as never}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} className="ml-2">
            {showPassword ? (
              <EyeOff color="#6b7280" size={18} />
            ) : (
              <Eye color="#6b7280" size={18} />
            )}
          </TouchableOpacity>
        ) : (
          rightIcon && <View className="ml-2">{rightIcon}</View>
        )}
      </View>

      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
      {hint && !error && <Text className="text-gray-500 text-xs mt-1">{hint}</Text>}
    </View>
  );
});

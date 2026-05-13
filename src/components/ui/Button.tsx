import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-brand-700 active:bg-brand-800',
  secondary: 'bg-surface-100 active:bg-surface-200',
  ghost:     'bg-transparent active:bg-surface-100',
  danger:    'bg-red-700 active:bg-red-800',
  outline:   'bg-transparent border border-brand-700 active:bg-brand-950/30',
};

const textStyles: Record<Variant, string> = {
  primary:   'text-white',
  secondary: 'text-gray-200',
  ghost:     'text-gray-300',
  danger:    'text-white',
  outline:   'text-brand-600',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-2',
  md: 'px-5 py-3',
  lg: 'px-7 py-4',
};

const textSizeStyles: Record<Size, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`
        flex-row items-center justify-center rounded-xl gap-2
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : 'self-start'}
        ${isDisabled ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'ghost' ? '#9ca3af' : '#ffffff'} />
      ) : (
        <>
          {icon && <View>{icon}</View>}
          <Text className={`font-semibold ${textStyles[variant]} ${textSizeStyles[size]}`}>
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

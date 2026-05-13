import { View } from 'react-native';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ children, className = '', padding = 'md', glow = false }: CardProps) {
  return (
    <View
      className={`
        bg-surface-200 rounded-2xl border border-surface-100
        ${paddingStyles[padding]}
        ${glow ? 'border-brand-950' : ''}
        ${className}
      `}
      style={glow ? { shadowColor: '#c80d0d', shadowOpacity: 0.15, shadowRadius: 20 } : undefined}
    >
      {children}
    </View>
  );
}

import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeColors } from '../theme/theme';

export interface SpinnerProps {
  size?: 'small' | 'large';
  color?: keyof ThemeColors | (string & {});
}

export function Spinner({ size = 'small', color = 'primary' }: SpinnerProps) {
  const { theme } = useTheme();
  const resolved =
    color in theme.colors ? theme.colors[color as keyof ThemeColors] : (color as string);
  return <ActivityIndicator size={size} color={resolved} />;
}

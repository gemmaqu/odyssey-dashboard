import React, { useState } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme } from '../theme/theme';
import type { TypographyVariant } from '../theme/tokens';
import { Spinner } from './Spinner';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

const SIZES: Record<ButtonSize, { paddingV: number; paddingH: number; variant: TypographyVariant }> = {
  sm: { paddingV: 6, paddingH: 12, variant: 'label' },
  md: { paddingV: 10, paddingH: 16, variant: 'bodyStrong' },
  lg: { paddingV: 14, paddingH: 20, variant: 'title' },
};

function resolveColors(theme: Theme, variant: ButtonVariant, state: 'base' | 'hover' | 'active') {
  const c = theme.colors;
  switch (variant) {
    case 'primary':
      return {
        bg: state === 'active' ? c.primaryActive : state === 'hover' ? c.primaryHover : c.primary,
        fg: c.onPrimary,
        border: 'transparent',
      };
    case 'danger':
      return {
        bg: state === 'hover' || state === 'active' ? c.dangerHover : c.danger,
        fg: c.onDanger,
        border: 'transparent',
      };
    case 'secondary':
      return {
        bg: state === 'base' ? c.surfaceAlt : c.surfaceHover,
        fg: c.text,
        border: c.border,
      };
    case 'outline':
      return {
        bg: state === 'base' ? 'transparent' : c.surfaceHover,
        fg: c.text,
        border: c.borderStrong,
      };
    case 'ghost':
      return {
        bg: state === 'base' ? 'transparent' : c.surfaceHover,
        fg: c.text,
        border: 'transparent',
      };
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  testID,
}: ButtonProps) {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const sizing = SIZES[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => {
        const state = pressed ? 'active' : hovered ? 'hover' : 'base';
        const colors = resolveColors(theme, variant, state);
        return [
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.sm,
            paddingVertical: sizing.paddingV,
            paddingHorizontal: sizing.paddingH,
            borderRadius: theme.radii.md,
            borderWidth: 1,
            backgroundColor: colors.bg,
            borderColor: focused ? theme.colors.focusRing : colors.border,
            opacity: isDisabled ? 0.5 : 1,
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
            ...(focused
              ? {
                  shadowColor: theme.colors.focusRing,
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 0 },
                }
              : null),
          } as ViewStyle,
          style,
        ];
      }}
    >
      {loading ? (
        <Spinner size="small" color={variant === 'primary' || variant === 'danger' ? 'onPrimary' : 'text'} />
      ) : (
        leftIcon && <View>{leftIcon}</View>
      )}
      <Text
        variant={sizing.variant}
        style={{ color: resolveColors(theme, variant, hovered ? 'hover' : 'base').fg }}
      >
        {label}
      </Text>
      {!loading && rightIcon ? <View>{rightIcon}</View> : null}
    </Pressable>
  );
}

import React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { RadiusToken, SpacingToken } from '../theme/tokens';

export interface SurfaceProps extends ViewProps {
  padding?: SpacingToken;
  radius?: RadiusToken;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  /** Use the subtle alternate background instead of the base surface. */
  alt?: boolean;
}

export function Surface({
  padding = 'lg',
  radius = 'lg',
  elevation = 'none',
  bordered = true,
  alt = false,
  style,
  children,
  ...rest
}: SurfaceProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: alt ? theme.colors.surfaceAlt : theme.colors.surface,
          borderRadius: theme.radii[radius],
          padding: theme.spacing[padding],
          borderWidth: bordered ? 1 : 0,
          borderColor: theme.colors.border,
        } as ViewStyle,
        elevation !== 'none' ? theme.shadows[elevation] : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

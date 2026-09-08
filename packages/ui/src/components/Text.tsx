import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeColors } from '../theme/theme';
import type { TypographyVariant } from '../theme/tokens';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  /** A semantic color role, or any explicit color string. */
  color?: keyof ThemeColors | (string & {});
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
}

export function Text({
  variant = 'body',
  color = 'text',
  weight,
  align,
  style,
  ...rest
}: TextProps) {
  const { theme } = useTheme();
  const variantStyle = theme.typography[variant];
  const resolvedColor =
    color in theme.colors ? theme.colors[color as keyof ThemeColors] : (color as string);

  return (
    <RNText
      style={[
        variantStyle as TextStyle,
        { color: resolvedColor },
        weight ? { fontWeight: weight } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
      {...rest}
    />
  );
}

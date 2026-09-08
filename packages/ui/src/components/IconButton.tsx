import React, { useState } from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export interface IconButtonProps {
  /** A unicode glyph shortcut, e.g. "×". Ignored if `children` is provided. */
  glyph?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  size?: number;
  disabled?: boolean;
  style?: ViewStyle;
}

export function IconButton({
  glyph,
  children,
  onPress,
  accessibilityLabel,
  size = 32,
  disabled = false,
  style,
}: IconButtonProps) {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.radii.md,
          backgroundColor: hovered ? theme.colors.surfaceHover : 'transparent',
          opacity: disabled ? 0.5 : 1,
        } as ViewStyle,
        style,
      ]}
    >
      {children ?? (
        <Text variant="h3" color="textMuted">
          {glyph}
        </Text>
      )}
    </Pressable>
  );
}

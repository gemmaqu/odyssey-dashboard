import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export interface NavItemProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
  trailing?: React.ReactNode;
}

export function NavItem({ label, icon, active = false, onPress, trailing }: NavItemProps) {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);

  const bg = active
    ? theme.colors.primarySubtle
    : hovered
      ? theme.colors.surfaceHover
      : 'transparent';
  const fg = active ? theme.colors.primary : theme.colors.textMuted;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radii.md,
        backgroundColor: bg,
      }}
    >
      {icon ? <View style={{ width: 20, alignItems: 'center' }}>{icon}</View> : null}
      <Text variant="bodyStrong" style={{ flex: 1, color: fg }}>
        {label}
      </Text>
      {trailing ?? null}
    </Pressable>
  );
}

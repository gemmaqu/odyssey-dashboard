import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@odyssey/types';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  dot?: boolean;
  style?: ViewStyle;
}

export function Badge({ label, tone = 'neutral', dot = false, style }: BadgeProps) {
  const { theme } = useTheme();
  const c = theme.colors;
  const map: Record<BadgeTone, { fg: string; bg: string }> = {
    neutral: { fg: c.textMuted, bg: c.surfaceAlt },
    primary: { fg: c.primary, bg: c.primarySubtle },
    success: { fg: c.success, bg: c.successSubtle },
    warning: { fg: c.warning, bg: c.warningSubtle },
    danger: { fg: c.danger, bg: c.dangerSubtle },
    info: { fg: c.info, bg: c.infoSubtle },
  };
  const colors = map[tone];

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          backgroundColor: colors.bg,
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderRadius: theme.radii.full,
        },
        style,
      ]}
    >
      {dot ? (
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.fg }} />
      ) : null}
      <Text variant="caption" weight="600" style={{ color: colors.fg }}>
        {label}
      </Text>
    </View>
  );
}

/** Order status pill using the centralized status color map from the theme. */
export function StatusBadge({ status }: { status: OrderStatus }) {
  const { theme } = useTheme();
  const colors = theme.status[status];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        backgroundColor: colors.bg,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: theme.radii.full,
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.dot }} />
      <Text variant="caption" weight="600" style={{ color: colors.fg }}>
        {ORDER_STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

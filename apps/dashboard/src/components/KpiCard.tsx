import { Skeleton, Surface, Text, useTheme } from '@odyssey/ui';
import React from 'react';
import { View } from 'react-native';

export function KpiCard({
  label,
  value,
  hint,
  accent = 'primary',
  loading = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: 'primary' | 'success' | 'warning' | 'info';
  loading?: boolean;
}) {
  const { theme } = useTheme();
  const accentColor = theme.colors[accent];

  return (
    <Surface elevation="sm" style={{ flex: 1, minWidth: 180, gap: theme.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accentColor }} />
        <Text variant="overline" color="textMuted">
          {label}
        </Text>
      </View>
      {loading ? (
        <Skeleton width="60%" height={28} />
      ) : (
        <Text variant="display" style={{ fontSize: 30, lineHeight: 36 }}>
          {value}
        </Text>
      )}
      {hint ? (
        <Text variant="caption" color="textSubtle">
          {hint}
        </Text>
      ) : null}
    </Surface>
  );
}

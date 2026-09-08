import { Text, useTheme } from '@odyssey/ui';
import React from 'react';
import { View } from 'react-native';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
        flexWrap: 'wrap',
      }}
    >
      <View style={{ gap: 4 }}>
        <Text variant="h1">{title}</Text>
        {subtitle ? (
          <Text variant="body" color="textMuted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actions ? <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>{actions}</View> : null}
    </View>
  );
}

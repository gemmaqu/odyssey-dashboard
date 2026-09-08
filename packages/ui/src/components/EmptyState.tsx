import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export interface EmptyStateProps {
  /** Optional glyph or icon node shown above the title. */
  glyph?: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: 'neutral' | 'danger';
}

export function EmptyState({ glyph, icon, title, description, action, tone = 'neutral' }: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xl }}>
      {icon ??
        (glyph ? (
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: theme.radii.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: tone === 'danger' ? theme.colors.dangerSubtle : theme.colors.surfaceAlt,
            }}
          >
            <Text variant="h2" color={tone === 'danger' ? 'danger' : 'textSubtle'}>
              {glyph}
            </Text>
          </View>
        ) : null)}
      <View style={{ alignItems: 'center', gap: 4, maxWidth: 360 }}>
        <Text variant="title" align="center">
          {title}
        </Text>
        {description ? (
          <Text variant="body" color="textMuted" align="center">
            {description}
          </Text>
        ) : null}
      </View>
      {action ? <View style={{ marginTop: theme.spacing.xs }}>{action}</View> : null}
    </View>
  );
}

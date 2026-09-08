import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Surface } from './Surface';
import { Text } from './Text';

export interface CardProps {
  title?: string;
  subtitle?: string;
  /** Rendered on the right of the header (e.g. a button or badge). */
  action?: React.ReactNode;
  footer?: React.ReactNode;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  style?: ViewStyle;
  bodyStyle?: ViewStyle;
}

export function Card({
  title,
  subtitle,
  action,
  footer,
  elevation = 'sm',
  children,
  style,
  bodyStyle,
}: CardProps) {
  const { theme } = useTheme();
  const hasHeader = title || subtitle || action;

  return (
    <Surface padding="none" elevation={elevation} style={style}>
      {hasHeader ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            paddingBottom: children ? theme.spacing.md : theme.spacing.lg,
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            {title ? <Text variant="h3">{title}</Text> : null}
            {subtitle ? (
              <Text variant="label" color="textMuted">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {action ? <View>{action}</View> : null}
        </View>
      ) : null}

      {children ? (
        <View
          style={[
            {
              paddingHorizontal: theme.spacing.lg,
              paddingTop: hasHeader ? 0 : theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
            },
            bodyStyle,
          ]}
        >
          {children}
        </View>
      ) : null}

      {footer ? (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
          }}
        >
          {footer}
        </View>
      ) : null}
    </Surface>
  );
}

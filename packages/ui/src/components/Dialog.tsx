import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { IconButton } from './IconButton';
import { Text } from './Text';

export interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const WIDTHS = { sm: 420, md: 560, lg: 760 };

export function Dialog({ visible, onClose, title, subtitle, children, footer, size = 'md' }: DialogProps) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.lg,
        }}
      >
        {/* Stop propagation so clicks inside the card don't close the dialog. */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: WIDTHS[size],
            maxHeight: '90%',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.xl,
            borderWidth: 1,
            borderColor: theme.colors.border,
            ...theme.shadows.lg,
          }}
        >
          {title || subtitle ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: theme.spacing.md,
                paddingHorizontal: theme.spacing.xl,
                paddingTop: theme.spacing.xl,
                paddingBottom: theme.spacing.md,
              }}
            >
              <View style={{ flex: 1, gap: 4 }}>
                {title ? <Text variant="h2">{title}</Text> : null}
                {subtitle ? (
                  <Text variant="body" color="textMuted">
                    {subtitle}
                  </Text>
                ) : null}
              </View>
              <IconButton glyph="×" onPress={onClose} accessibilityLabel="Close dialog" />
            </View>
          ) : null}

          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: theme.spacing.xl,
              paddingTop: title ? 0 : theme.spacing.xl,
              paddingBottom: theme.spacing.xl,
            }}
          >
            {children}
          </ScrollView>

          {footer ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: theme.spacing.sm,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
                paddingHorizontal: theme.spacing.xl,
                paddingVertical: theme.spacing.md,
              }}
            >
              {footer}
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeColors } from '../theme/theme';
import { IconButton } from './IconButton';
import { Text } from './Text';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, options?: { variant?: ToastVariant; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_COLOR: Record<ToastVariant, keyof ThemeColors> = {
  success: 'success',
  error: 'danger',
  info: 'info',
  warning: 'warning',
};

const VARIANT_GLYPH: Record<ToastVariant, string> = {
  success: '✓',
  error: '!',
  info: 'i',
  warning: '!',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ToastContextValue['show']>(
    (message, options) => {
      const id = `toast-${counter.current++}`;
      const variant = options?.variant ?? 'info';
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), options?.duration ?? 3500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', top: theme.spacing.lg, right: theme.spacing.lg, gap: theme.spacing.sm, zIndex: 1000 }}
      >
        {toasts.map((toast) => {
          const colorKey = VARIANT_COLOR[toast.variant];
          const accent = theme.colors[colorKey];
          return (
            <View
              key={toast.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.sm,
                minWidth: 260,
                maxWidth: 420,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderLeftWidth: 3,
                borderLeftColor: accent,
                borderRadius: theme.radii.md,
                paddingVertical: theme.spacing.sm,
                paddingHorizontal: theme.spacing.md,
                ...theme.shadows.md,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="caption" weight="700" style={{ color: theme.colors.onPrimary }}>
                  {VARIANT_GLYPH[toast.variant]}
                </Text>
              </View>
              <Text variant="label" style={{ flex: 1 }}>
                {toast.message}
              </Text>
              <IconButton glyph="×" size={24} accessibilityLabel="Dismiss" onPress={() => dismiss(toast.id)} />
            </View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>.');
  return ctx;
}

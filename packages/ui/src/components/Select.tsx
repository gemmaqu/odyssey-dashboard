import React, { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export interface SelectOption<T extends string> {
  label: string;
  value: T;
}

export interface SelectProps<T extends string> {
  value: T | null;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  testID?: string;
}

interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  label,
  error,
  disabled = false,
  containerStyle,
  testID,
}: SelectProps<T>) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const triggerRef = useRef<View>(null);

  const selected = options.find((o) => o.value === value);

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label ? (
        <Text variant="label" color="textMuted">
          {label}
        </Text>
      ) : null}

      <Pressable
        ref={triggerRef}
        testID={testID}
        accessibilityRole="button"
        disabled={disabled}
        onPress={openMenu}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.sm,
          minHeight: 40,
          paddingHorizontal: theme.spacing.md,
          backgroundColor: disabled ? theme.colors.surfaceAlt : theme.colors.surface,
          borderWidth: 1,
          borderColor: error ? theme.colors.danger : open ? theme.colors.focusRing : theme.colors.border,
          borderRadius: theme.radii.md,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Text color={selected ? 'text' : 'textSubtle'} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text color="textMuted">▾</Text>
      </Pressable>

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)}>
          {anchor ? (
            <View
              style={{
                position: 'absolute',
                top: anchor.y + anchor.height + 4,
                left: anchor.x,
                width: anchor.width,
                maxHeight: 260,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.md,
                ...theme.shadows.lg,
              }}
            >
              <ScrollView>
                {options.map((option) => {
                  const isSelected = option.value === value;
                  const isHovered = hovered === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onHoverIn={() => setHovered(option.value)}
                      onHoverOut={() => setHovered((h) => (h === option.value ? null : h))}
                      onPress={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        backgroundColor:
                          isHovered || isSelected ? theme.colors.surfaceHover : 'transparent',
                      }}
                    >
                      <Text color={isSelected ? 'primary' : 'text'}>{option.label}</Text>
                      {isSelected ? <Text color="primary">✓</Text> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

import React, { useState } from 'react';
import { TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextInputProps['style'];
}

export function Input({
  label,
  hint,
  error,
  leftIcon,
  rightSlot,
  editable = true,
  multiline,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.focusRing
      : theme.colors.border;

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label ? (
        <Text variant="label" color="textMuted">
          {label}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          gap: theme.spacing.sm,
          backgroundColor: editable ? theme.colors.surface : theme.colors.surfaceAlt,
          borderWidth: 1,
          borderColor,
          borderRadius: theme.radii.md,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: multiline ? theme.spacing.md : 0,
          minHeight: multiline ? 88 : 40,
          opacity: editable ? 1 : 0.6,
          ...(focused && !error
            ? {
                shadowColor: theme.colors.focusRing,
                shadowOpacity: 0.35,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 0 },
              }
            : null),
        }}
      >
        {leftIcon ? <View>{leftIcon}</View> : null}
        <TextInput
          editable={editable}
          multiline={multiline}
          placeholderTextColor={theme.colors.textSubtle}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              color: theme.colors.text,
              fontSize: theme.fontSizes.base,
              paddingVertical: multiline ? 0 : theme.spacing.sm,
              // Remove the web focus outline; we render our own ring.
              ...(({ outlineStyle: 'none' } as unknown) as object),
            },
            inputStyle,
          ]}
          {...rest}
        />
        {rightSlot ? <View>{rightSlot}</View> : null}
      </View>

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="textSubtle">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

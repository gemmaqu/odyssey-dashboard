import React, { useState } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';
import { Text } from './Text';

export interface Column<T> {
  key: string;
  header: string;
  width?: number;
  flex?: number;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowPress?: (row: T) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  style?: ViewStyle;
}

function cellAlign(align?: 'left' | 'right' | 'center') {
  return align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start';
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowPress,
  loading = false,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  style,
}: TableProps<T>) {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState<string | null>(null);

  const columnStyle = (col: Column<T>): ViewStyle => ({
    width: col.width,
    flex: col.width ? undefined : (col.flex ?? 1),
    alignItems: cellAlign(col.align),
    justifyContent: 'center',
  });

  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          overflow: 'hidden',
          backgroundColor: theme.colors.surface,
        },
        style,
      ]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          backgroundColor: theme.colors.surfaceAlt,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        {columns.map((col) => (
          <View key={col.key} style={columnStyle(col)}>
            <Text variant="overline" color="textMuted">
              {col.header}
            </Text>
          </View>
        ))}
      </View>

      {/* Body */}
      {loading ? (
        <View style={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={20} />
          ))}
        </View>
      ) : data.length === 0 ? (
        <View style={{ padding: theme.spacing['2xl'] }}>
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </View>
      ) : (
        data.map((row, index) => {
          const id = keyExtractor(row);
          const isHovered = hovered === id;
          return (
            <Pressable
              key={id}
              disabled={!onRowPress}
              onPress={() => onRowPress?.(row)}
              onHoverIn={() => setHovered(id)}
              onHoverOut={() => setHovered((h) => (h === id ? null : h))}
              style={{
                flexDirection: 'row',
                gap: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
                backgroundColor: isHovered && onRowPress ? theme.colors.surfaceHover : 'transparent',
                borderBottomWidth: index === data.length - 1 ? 0 : 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              {columns.map((col) => (
                <View key={col.key} style={columnStyle(col)}>
                  {col.render ? (
                    col.render(row)
                  ) : (
                    <Text numberOfLines={1}>{String((row as Record<string, unknown>)[col.key] ?? '')}</Text>
                  )}
                </View>
              ))}
            </Pressable>
          );
        })
      )}
    </View>
  );
}

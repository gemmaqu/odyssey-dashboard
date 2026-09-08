import type { MenuCategoryWithItems, MenuItem } from '@odyssey/api-client';
import { formatMoney } from '@odyssey/shared';
import { Badge, Button, Card, IconButton, Skeleton, Text, useTheme, useToast } from '@odyssey/ui';
import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { DataState } from '../../components/DataState';
import { MenuItemDialog } from '../../components/MenuItemDialog';
import { PageHeader } from '../../components/PageHeader';
import { useMenu, useUpdateMenuItem } from '../../features/menu';

export default function MenuScreen() {
  const { theme } = useTheme();
  const toast = useToast();
  const query = useMenu();
  const updateItem = useUpdateMenuItem();
  const categories = query.data ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setDialogOpen(true);
  };

  const toggleAvailability = (item: MenuItem) => {
    updateItem.mutate(
      { id: item.id, data: { isAvailable: !item.isAvailable } },
      {
        onSuccess: () => toast.show(item.isAvailable ? 'Marked unavailable' : 'Marked available', { variant: 'success' }),
        onError: () => toast.show('Could not update availability', { variant: 'error' }),
      },
    );
  };

  return (
    <View>
      <PageHeader
        title="Menu"
        subtitle="Categories, items, pricing and availability"
        actions={<Button label="+ Add item" onPress={openCreate} disabled={categories.length === 0} />}
      />

      <DataState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={query.refetch}
        loading={<Skeleton height={320} />}
      >
        <View style={{ gap: theme.spacing.lg }}>
          {categories.map((category: MenuCategoryWithItems) => (
            <Card key={category.id} title={category.name} subtitle={`${category.items.length} items`}>
              <View style={{ gap: theme.spacing.sm }}>
                {category.items.length === 0 ? (
                  <Text color="textSubtle">No items in this category.</Text>
                ) : (
                  category.items.map((item: MenuItem) => (
                    <View
                      key={item.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                          <Text variant="bodyStrong">{item.name}</Text>
                          {!item.isAvailable ? <Badge label="Unavailable" tone="neutral" /> : null}
                        </View>
                        {item.description ? (
                          <Text variant="caption" color="textSubtle" numberOfLines={1}>
                            {item.description}
                          </Text>
                        ) : null}
                      </View>
                      <Text variant="bodyStrong" style={{ width: 80, textAlign: 'right' }}>
                        {formatMoney(item.priceCents)}
                      </Text>
                      <Switch
                        value={item.isAvailable}
                        onValueChange={() => toggleAvailability(item)}
                        trackColor={{ true: theme.colors.primary, false: theme.colors.borderStrong }}
                      />
                      <IconButton glyph="✎" accessibilityLabel={`Edit ${item.name}`} onPress={() => openEdit(item)} />
                    </View>
                  ))
                )}
              </View>
            </Card>
          ))}
        </View>
      </DataState>

      <MenuItemDialog visible={dialogOpen} onClose={() => setDialogOpen(false)} item={editing} categories={categories} />
    </View>
  );
}

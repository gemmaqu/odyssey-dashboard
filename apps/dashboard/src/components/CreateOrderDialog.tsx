import type { CustomerSummary, MenuCategoryWithItems, MenuItem } from '@odyssey/api-client';
import { ApiError } from '@odyssey/api-client';
import { formatMoney } from '@odyssey/shared';
import {
  Button,
  Dialog,
  IconButton,
  Input,
  Select,
  Surface,
  Text,
  useTheme,
  useToast,
} from '@odyssey/ui';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useCustomers } from '../features/customers';
import { useCreateOrder } from '../features/orders';
import { useMenu } from '../features/menu';
import { useSettings } from '../features/settings';
import { addLine, cartTotals, setQuantity, toCreateOrderItems, type CartLine } from '../lib/cart';

export function CreateOrderDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { theme } = useTheme();
  const toast = useToast();
  const customersQuery = useCustomers();
  const menuQuery = useMenu();
  const settingsQuery = useSettings();
  const createOrder = useCreateOrder();

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [notes, setNotes] = useState('');

  const taxRateBps = settingsQuery.data?.taxRateBps ?? 0;
  const totals = useMemo(() => cartTotals(lines, taxRateBps), [lines, taxRateBps]);

  const reset = () => {
    setCustomerId(null);
    setLines([]);
    setNotes('');
  };

  const close = () => {
    reset();
    onClose();
  };

  const canSubmit = Boolean(customerId) && lines.length > 0 && !createOrder.isPending;

  const submit = () => {
    if (!customerId) return;
    createOrder.mutate(
      { data: { customerId, items: toCreateOrderItems(lines), notes: notes || null } },
      {
        onSuccess: () => {
          toast.show('Order created', { variant: 'success' });
          close();
        },
        onError: (err) => {
          const message =
            err instanceof ApiError ? err.body?.error?.message ?? err.message : 'Failed to create order';
          toast.show(message, { variant: 'error' });
        },
      },
    );
  };

  const customerOptions = (customersQuery.data ?? []).map((c: CustomerSummary) => ({
    label: c.name,
    value: c.id,
  }));

  return (
    <Dialog
      visible={visible}
      onClose={close}
      title="New order"
      subtitle="Prices and totals are calculated on the server."
      size="lg"
      footer={
        <>
          <Button label="Cancel" variant="ghost" onPress={close} />
          <Button label="Create order" onPress={submit} disabled={!canSubmit} loading={createOrder.isPending} />
        </>
      }
    >
      <View style={{ gap: theme.spacing.lg }}>
        <Select
          label="Customer"
          placeholder="Select a customer"
          value={customerId}
          onChange={setCustomerId}
          options={customerOptions}
        />

        <View style={{ flexDirection: 'row', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
          {/* Menu picker */}
          <View style={{ flex: 1, minWidth: 260, gap: theme.spacing.sm }}>
            <Text variant="label" color="textMuted">
              Menu
            </Text>
            <Surface padding="sm" style={{ maxHeight: 320 }}>
              <ScrollView>
                {(menuQuery.data ?? []).map((category: MenuCategoryWithItems) => (
                  <View key={category.id} style={{ marginBottom: theme.spacing.sm }}>
                    <Text variant="overline" color="textSubtle" style={{ padding: theme.spacing.sm }}>
                      {category.name}
                    </Text>
                    {category.items.map((item: MenuItem) => (
                      <View
                        key={item.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: theme.spacing.sm,
                          paddingVertical: 6,
                          paddingHorizontal: theme.spacing.sm,
                          opacity: item.isAvailable ? 1 : 0.5,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text numberOfLines={1}>{item.name}</Text>
                          <Text variant="caption" color="textSubtle">
                            {formatMoney(item.priceCents)}
                            {item.isAvailable ? '' : ' · unavailable'}
                          </Text>
                        </View>
                        <Button
                          label="Add"
                          size="sm"
                          variant="secondary"
                          disabled={!item.isAvailable}
                          onPress={() => setLines((prev) => addLine(prev, item))}
                        />
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>
            </Surface>
          </View>

          {/* Cart */}
          <View style={{ flex: 1, minWidth: 260, gap: theme.spacing.sm }}>
            <Text variant="label" color="textMuted">
              Order
            </Text>
            <Surface padding="md" style={{ gap: theme.spacing.sm, minHeight: 120 }}>
              {lines.length === 0 ? (
                <Text color="textSubtle">Add items from the menu.</Text>
              ) : (
                lines.map((line) => (
                  <View
                    key={line.menuItemId}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
                  >
                    <Text style={{ flex: 1 }} numberOfLines={1}>
                      {line.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <IconButton
                        glyph="−"
                        size={26}
                        accessibilityLabel={`Decrease ${line.name}`}
                        onPress={() => setLines((prev) => setQuantity(prev, line.menuItemId, line.quantity - 1))}
                      />
                      <Text variant="bodyStrong" style={{ minWidth: 20, textAlign: 'center' }}>
                        {line.quantity}
                      </Text>
                      <IconButton
                        glyph="+"
                        size={26}
                        accessibilityLabel={`Increase ${line.name}`}
                        onPress={() => setLines((prev) => setQuantity(prev, line.menuItemId, line.quantity + 1))}
                      />
                    </View>
                    <Text variant="bodyStrong" style={{ width: 72, textAlign: 'right' }}>
                      {formatMoney(line.unitPriceCents * line.quantity)}
                    </Text>
                  </View>
                ))
              )}

              {lines.length > 0 ? (
                <View style={{ gap: 4, marginTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm }}>
                  <Row label="Subtotal" value={formatMoney(totals.subtotalCents)} />
                  <Row label={`Tax (${(taxRateBps / 100).toFixed(1)}%)`} value={formatMoney(totals.taxCents)} />
                  <Row label="Total" value={formatMoney(totals.totalCents)} strong />
                </View>
              ) : null}
            </Surface>

            <Input
              label="Notes (optional)"
              placeholder="e.g. no onions"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>
      </View>
    </Dialog>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text variant={strong ? 'bodyStrong' : 'label'} color={strong ? 'text' : 'textMuted'}>
        {label}
      </Text>
      <Text variant={strong ? 'bodyStrong' : 'label'}>{value}</Text>
    </View>
  );
}

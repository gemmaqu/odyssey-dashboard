import type { OrderItem } from '@odyssey/api-client';
import { formatDateTime, formatMoney } from '@odyssey/shared';
import { Button, Card, Divider, Skeleton, StatusBadge, Text, useTheme } from '@odyssey/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { DataState } from '../../components/DataState';
import { OrderStatusActions } from '../../components/OrderStatusActions';
import { PageHeader } from '../../components/PageHeader';
import { useOrder } from '../../features/orders';

export default function OrderDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useOrder(id);
  const order = query.data;

  return (
    <View>
      <Button label="← Back to orders" variant="ghost" size="sm" onPress={() => router.push('/orders' as never)} style={{ marginBottom: theme.spacing.md }} />

      <DataState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={query.refetch}
        loading={<Skeleton height={320} />}
      >
        {order ? (
          <View style={{ gap: theme.spacing.xl }}>
            <PageHeader
              title={`Order #${order.id.slice(0, 8)}`}
              subtitle={`Placed ${formatDateTime(order.createdAt)}`}
              actions={<OrderStatusActions orderId={order.id} actions={order.availableActions} />}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <Text variant="label" color="textMuted">
                Status
              </Text>
              <StatusBadge status={order.status} />
            </View>

            <View style={{ flexDirection: 'row', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
              <View style={{ flex: 2, minWidth: 320 }}>
                <Card title="Items">
                  <View style={{ gap: theme.spacing.sm }}>
                    {order.items.map((item: OrderItem) => (
                      <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                        <Text variant="bodyStrong" style={{ width: 28 }}>
                          {item.quantity}×
                        </Text>
                        <Text style={{ flex: 1 }} numberOfLines={1}>
                          {item.nameSnapshot}
                        </Text>
                        <Text color="textMuted">{formatMoney(item.unitPriceCents)}</Text>
                        <Text variant="bodyStrong" style={{ width: 80, textAlign: 'right' }}>
                          {formatMoney(item.lineTotalCents)}
                        </Text>
                      </View>
                    ))}
                    <Divider spacing={4} />
                    <SummaryRow label="Subtotal" value={formatMoney(order.subtotalCents)} />
                    <SummaryRow label="Tax" value={formatMoney(order.taxCents)} />
                    <SummaryRow label="Total" value={formatMoney(order.totalCents)} strong />
                  </View>
                  {order.notes ? (
                    <View style={{ marginTop: theme.spacing.md }}>
                      <Text variant="label" color="textMuted">
                        Notes
                      </Text>
                      <Text>{order.notes}</Text>
                    </View>
                  ) : null}
                </Card>
              </View>

              <View style={{ flex: 1, minWidth: 240 }}>
                <Card title="Customer">
                  <View style={{ gap: 6 }}>
                    <Text variant="bodyStrong">{order.customer.name}</Text>
                    <Text color="textMuted">{order.customer.email}</Text>
                    {order.customer.phone ? <Text color="textMuted">{order.customer.phone}</Text> : null}
                    <Divider spacing={6} />
                    <Button
                      label="View customer"
                      variant="outline"
                      size="sm"
                      onPress={() => router.push(`/customers/${order.customer.id}` as never)}
                    />
                  </View>
                </Card>
              </View>
            </View>
          </View>
        ) : null}
      </DataState>
    </View>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text variant={strong ? 'bodyStrong' : 'label'} color={strong ? 'text' : 'textMuted'}>
        {label}
      </Text>
      <Text variant={strong ? 'bodyStrong' : 'label'}>{value}</Text>
    </View>
  );
}

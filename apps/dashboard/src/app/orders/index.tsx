import type { GetOrdersStatus, OrderSummary } from '@odyssey/api-client';
import { formatMoney, formatRelativeTime } from '@odyssey/shared';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@odyssey/types';
import { Button, Skeleton, StatusBadge, Table, Text, useTheme } from '@odyssey/ui';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { CreateOrderDialog } from '../../components/CreateOrderDialog';
import { DataState } from '../../components/DataState';
import { PageHeader } from '../../components/PageHeader';
import { useOrders } from '../../features/orders';

type Filter = GetOrdersStatus | 'all';
const FILTERS: Filter[] = ['all', ...ORDER_STATUSES];

export default function OrdersScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const query = useOrders({ limit: 100, ...(filter !== 'all' ? { status: filter } : {}) });

  return (
    <View>
      <PageHeader
        title="Orders"
        subtitle="Track and advance orders through the kitchen"
        actions={<Button label="+ New order" onPress={() => setDialogOpen(true)} />}
      />

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap', marginBottom: theme.spacing.lg }}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: theme.radii.full,
                borderWidth: 1,
                borderColor: active ? theme.colors.primary : theme.colors.border,
                backgroundColor: active ? theme.colors.primarySubtle : theme.colors.surface,
              }}
            >
              <Text variant="label" color={active ? 'primary' : 'textMuted'}>
                {f === 'all' ? 'All' : ORDER_STATUS_LABELS[f]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <DataState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={query.refetch}
        loading={<Skeleton height={280} />}
      >
        <Table<OrderSummary>
          data={query.data?.data ?? []}
          keyExtractor={(o) => o.id}
          onRowPress={(o) => router.push(`/orders/${o.id}` as never)}
          emptyTitle={filter === 'all' ? 'No orders yet' : `No ${ORDER_STATUS_LABELS[filter as GetOrdersStatus].toLowerCase()} orders`}
          emptyDescription="Create an order to get started."
          columns={[
            { key: 'id', header: 'Order', flex: 1, render: (o) => <Text variant="label" color="textMuted">#{o.id.slice(0, 8)}</Text> },
            { key: 'customer', header: 'Customer', flex: 2, render: (o) => <Text numberOfLines={1}>{o.customerName}</Text> },
            { key: 'items', header: 'Items', width: 64, align: 'center', render: (o) => <Text color="textMuted">{o.itemCount}</Text> },
            { key: 'total', header: 'Total', width: 100, align: 'right', render: (o) => <Text variant="bodyStrong">{formatMoney(o.totalCents)}</Text> },
            { key: 'status', header: 'Status', width: 120, render: (o) => <StatusBadge status={o.status} /> },
            { key: 'time', header: 'When', width: 90, align: 'right', render: (o) => <Text variant="caption" color="textSubtle">{formatRelativeTime(o.createdAt)}</Text> },
          ]}
        />
      </DataState>

      <CreateOrderDialog visible={dialogOpen} onClose={() => setDialogOpen(false)} />
    </View>
  );
}

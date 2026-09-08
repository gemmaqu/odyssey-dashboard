import type { OrderSummary } from '@odyssey/api-client';
import { formatMoney, formatRelativeTime } from '@odyssey/shared';
import { Button, Card, Skeleton, StatusBadge, Table, Text, useTheme } from '@odyssey/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { DataState } from '../../components/DataState';
import { KpiCard } from '../../components/KpiCard';
import { PageHeader } from '../../components/PageHeader';
import { useCustomer } from '../../features/customers';

export default function CustomerDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useCustomer(id);
  const customer = query.data;

  return (
    <View>
      <Button label="← Back to CRM" variant="ghost" size="sm" onPress={() => router.push('/customers' as never)} style={{ marginBottom: theme.spacing.md }} />

      <DataState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={query.refetch}
        loading={<Skeleton height={300} />}
      >
        {customer ? (
          <View style={{ gap: theme.spacing.xl }}>
            <PageHeader title={customer.name} subtitle={customer.email} />

            <View style={{ flexDirection: 'row', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
              <KpiCard label="Orders" value={String(customer.orderCount)} accent="primary" />
              <KpiCard label="Total spend" value={formatMoney(customer.totalSpentCents)} accent="success" />
              <KpiCard
                label="Last order"
                value={customer.lastOrderAt ? formatRelativeTime(customer.lastOrderAt) : '—'}
                accent="info"
              />
            </View>

            <Card title="Recent orders">
              <Table<OrderSummary>
                data={customer.recentOrders}
                keyExtractor={(o) => o.id}
                onRowPress={(o) => router.push(`/orders/${o.id}` as never)}
                emptyTitle="No orders yet"
                columns={[
                  { key: 'id', header: 'Order', flex: 1, render: (o) => <Text variant="label" color="textMuted">#{o.id.slice(0, 8)}</Text> },
                  { key: 'items', header: 'Items', width: 64, align: 'center', render: (o) => <Text color="textMuted">{o.itemCount}</Text> },
                  { key: 'total', header: 'Total', width: 100, align: 'right', render: (o) => <Text variant="bodyStrong">{formatMoney(o.totalCents)}</Text> },
                  { key: 'status', header: 'Status', width: 120, render: (o) => <StatusBadge status={o.status} /> },
                  { key: 'time', header: 'When', width: 90, align: 'right', render: (o) => <Text variant="caption" color="textSubtle">{formatRelativeTime(o.createdAt)}</Text> },
                ]}
              />
            </Card>
          </View>
        ) : null}
      </DataState>
    </View>
  );
}

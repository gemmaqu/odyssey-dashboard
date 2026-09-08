import { formatMoney, formatRelativeTime } from '@odyssey/shared';
import { Card, Skeleton, StatusBadge, Table, Text, useTheme } from '@odyssey/ui';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import type { OrderSummary, PopularItem } from '@odyssey/api-client';
import { DataState } from '../components/DataState';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import { useDashboardSummary } from '../features/stats';

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const query = useDashboardSummary();
  const s = query.data;

  return (
    <View>
      <PageHeader title="Home" subtitle="Today at a glance" />

      <DataState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={query.refetch}
        loading={
          <View style={{ flexDirection: 'row', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={110} style={{ flex: 1, minWidth: 180 }} />
            ))}
          </View>
        }
      >
        {s ? (
          <View style={{ gap: theme.spacing.xl }}>
            <View style={{ flexDirection: 'row', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
              <KpiCard label="Total orders" value={String(s.totalOrders)} accent="primary" hint={`${s.completedOrders} completed`} />
              <KpiCard label="Revenue" value={formatMoney(s.revenueCents)} accent="success" hint="Excludes cancelled" />
              <KpiCard label="Pending" value={String(s.pendingOrders)} accent="warning" hint={`${s.activeOrders} active in kitchen`} />
              <KpiCard label="Avg order" value={formatMoney(s.avgOrderValueCents)} accent="info" />
            </View>

            <View style={{ flexDirection: 'row', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
              <View style={{ flex: 1, minWidth: 300 }}>
                <Card title="Popular items" subtitle="By quantity sold">
                  {s.popularItems.length === 0 ? (
                    <Text color="textMuted">No sales yet.</Text>
                  ) : (
                    <View style={{ gap: theme.spacing.md }}>
                      {s.popularItems.map((item: PopularItem, index: number) => (
                        <View key={item.menuItemId} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                          <Text variant="label" color="textSubtle" style={{ width: 20 }}>
                            {index + 1}
                          </Text>
                          <Text style={{ flex: 1 }} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text variant="label" color="textMuted">
                            ×{item.quantity}
                          </Text>
                          <Text variant="bodyStrong" style={{ width: 84, textAlign: 'right' }}>
                            {formatMoney(item.revenueCents)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Card>
              </View>

              <View style={{ flex: 2, minWidth: 340 }}>
                <Card title="Recent orders" subtitle="Latest activity">
                  <Table<OrderSummary>
                    data={s.recentOrders}
                    keyExtractor={(o) => o.id}
                    onRowPress={(o) => router.push(`/orders/${o.id}` as never)}
                    emptyTitle="No orders yet"
                    columns={[
                      { key: 'customer', header: 'Customer', flex: 2, render: (o) => <Text numberOfLines={1}>{o.customerName}</Text> },
                      { key: 'items', header: 'Items', flex: 1, render: (o) => <Text color="textMuted">{o.itemCount}</Text> },
                      { key: 'total', header: 'Total', flex: 1, align: 'right', render: (o) => <Text variant="bodyStrong">{formatMoney(o.totalCents)}</Text> },
                      { key: 'status', header: 'Status', flex: 1, render: (o) => <StatusBadge status={o.status} /> },
                      { key: 'time', header: 'When', flex: 1, align: 'right', render: (o) => <Text variant="caption" color="textSubtle">{formatRelativeTime(o.createdAt)}</Text> },
                    ]}
                  />
                </Card>
              </View>
            </View>
          </View>
        ) : null}
      </DataState>
    </View>
  );
}

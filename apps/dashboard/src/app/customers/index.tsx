import type { CustomerSummary } from '@odyssey/api-client';
import { formatMoney, formatRelativeTime } from '@odyssey/shared';
import { Button, Skeleton, Table, Text } from '@odyssey/ui';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { CustomerDialog } from '../../components/CustomerDialog';
import { DataState } from '../../components/DataState';
import { PageHeader } from '../../components/PageHeader';
import { useCustomers } from '../../features/customers';

export default function CustomersScreen() {
  const router = useRouter();
  const query = useCustomers();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <View>
      <PageHeader
        title="CRM"
        subtitle="Customers, order history and spend"
        actions={<Button label="+ Add customer" onPress={() => setDialogOpen(true)} />}
      />

      <DataState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={query.refetch}
        loading={<Skeleton height={280} />}
      >
        <Table<CustomerSummary>
          data={query.data ?? []}
          keyExtractor={(c) => c.id}
          onRowPress={(c) => router.push(`/customers/${c.id}` as never)}
          emptyTitle="No customers yet"
          emptyDescription="Add a customer to start taking orders."
          columns={[
            { key: 'name', header: 'Name', flex: 2, render: (c) => <Text numberOfLines={1}>{c.name}</Text> },
            { key: 'email', header: 'Email', flex: 2, render: (c) => <Text color="textMuted" numberOfLines={1}>{c.email}</Text> },
            { key: 'orders', header: 'Orders', width: 80, align: 'center', render: (c) => <Text>{c.orderCount}</Text> },
            { key: 'spend', header: 'Spend', width: 110, align: 'right', render: (c) => <Text variant="bodyStrong">{formatMoney(c.totalSpentCents)}</Text> },
            {
              key: 'last',
              header: 'Last order',
              width: 110,
              align: 'right',
              render: (c) => (
                <Text variant="caption" color="textSubtle">
                  {c.lastOrderAt ? formatRelativeTime(c.lastOrderAt) : '—'}
                </Text>
              ),
            },
          ]}
        />
      </DataState>

      <CustomerDialog visible={dialogOpen} onClose={() => setDialogOpen(false)} />
    </View>
  );
}

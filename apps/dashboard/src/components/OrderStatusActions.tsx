import { ApiError, type OrderDetailAvailableActionsItem } from '@odyssey/api-client';
import { ORDER_ACTION_LABELS, type OrderAction } from '@odyssey/types';
import { Button, useToast } from '@odyssey/ui';
import React from 'react';
import { View } from 'react-native';
import { useOrderTransition } from '../features/orders';

export function OrderStatusActions({
  orderId,
  actions,
}: {
  orderId: string;
  actions: OrderDetailAvailableActionsItem[];
}) {
  const transition = useOrderTransition();
  const toast = useToast();

  if (actions.length === 0) return null;

  const run = (action: OrderAction) => {
    transition.mutate(
      { id: orderId, data: { action } },
      {
        onSuccess: () => toast.show(`Order ${ORDER_ACTION_LABELS[action].toLowerCase()}`, { variant: 'success' }),
        onError: (err) => {
          const message =
            err instanceof ApiError ? err.body?.error?.message ?? err.message : 'Action failed';
          toast.show(message, { variant: 'error' });
        },
      },
    );
  };

  return (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {actions.map((action) => (
        <Button
          key={action}
          label={ORDER_ACTION_LABELS[action as OrderAction]}
          variant={action === 'cancel' ? 'danger' : 'primary'}
          disabled={transition.isPending}
          onPress={() => run(action as OrderAction)}
        />
      ))}
    </View>
  );
}

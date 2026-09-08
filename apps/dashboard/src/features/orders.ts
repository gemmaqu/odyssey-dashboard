import {
  useGetOrders,
  useGetOrdersId,
  usePostOrders,
  usePostOrdersIdTransitions,
  type GetOrdersParams,
  type OrderDetail,
} from '@odyssey/api-client';
import { useQueryClient } from '@tanstack/react-query';

// The mutator throws on non-2xx, so on success the payload is always the 200
// body; narrow away the error branch of the generated union.

export function useOrders(params?: GetOrdersParams) {
  return useGetOrders(params, { query: { select: (r) => r.data } });
}

export function useOrder(id: string | undefined) {
  return useGetOrdersId(id ?? '', {
    query: { enabled: Boolean(id), select: (r) => r.data as OrderDetail },
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return usePostOrders({ mutation: { onSuccess: () => qc.invalidateQueries() } });
}

export function useOrderTransition() {
  const qc = useQueryClient();
  return usePostOrdersIdTransitions({ mutation: { onSuccess: () => qc.invalidateQueries() } });
}

import {
  useGetCustomers,
  useGetCustomersId,
  usePostCustomers,
  type CustomerDetail,
} from '@odyssey/api-client';
import { useQueryClient } from '@tanstack/react-query';

export function useCustomers() {
  return useGetCustomers({ query: { select: (r) => r.data } });
}

export function useCustomer(id: string | undefined) {
  return useGetCustomersId(id ?? '', {
    query: { enabled: Boolean(id), select: (r) => r.data as CustomerDetail },
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return usePostCustomers({ mutation: { onSuccess: () => qc.invalidateQueries() } });
}

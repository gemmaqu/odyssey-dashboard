import { useGetStatsSummary } from '@odyssey/api-client';

export function useDashboardSummary() {
  return useGetStatsSummary({ query: { select: (r) => r.data } });
}

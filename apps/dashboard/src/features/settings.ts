import { useGetSettings, usePatchSettings } from '@odyssey/api-client';
import { useQueryClient } from '@tanstack/react-query';

export function useSettings() {
  return useGetSettings({ query: { select: (r) => r.data } });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return usePatchSettings({ mutation: { onSuccess: () => qc.invalidateQueries() } });
}

import {
  useGetMenu,
  usePatchMenuItemsId,
  usePostMenuCategories,
  usePostMenuItems,
} from '@odyssey/api-client';
import { useQueryClient } from '@tanstack/react-query';

export function useMenu() {
  return useGetMenu({ query: { select: (r) => r.data } });
}

export function useCreateMenuItem() {
  const qc = useQueryClient();
  return usePostMenuItems({ mutation: { onSuccess: () => qc.invalidateQueries() } });
}

export function useUpdateMenuItem() {
  const qc = useQueryClient();
  return usePatchMenuItemsId({ mutation: { onSuccess: () => qc.invalidateQueries() } });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return usePostMenuCategories({ mutation: { onSuccess: () => qc.invalidateQueries() } });
}

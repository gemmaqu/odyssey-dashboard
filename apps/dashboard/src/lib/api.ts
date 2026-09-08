import { configureApiClient } from '@odyssey/api-client';
import { QueryClient } from '@tanstack/react-query';

/**
 * Base URL for the backend Worker. EXPO_PUBLIC_ vars are inlined by Metro at
 * build time; falls back to the wrangler dev default.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';

// Configure the generated client's fetch mutator once, at module load.
configureApiClient({ baseUrl: API_BASE_URL });

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  },
});

import { ApiError } from '@odyssey/api-client';
import { Button, EmptyState } from '@odyssey/ui';
import React from 'react';

/**
 * Standardizes loading / error rendering for a React Query result. Callers pass
 * the query flags and a `loading` skeleton; children render only when data is
 * ready.
 */
export function DataState({
  isLoading,
  isError,
  error,
  onRetry,
  loading,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
  loading: React.ReactNode;
  children: React.ReactNode;
}) {
  if (isLoading) return <>{loading}</>;

  if (isError) {
    const message =
      error instanceof ApiError
        ? error.body?.error?.message ?? error.message
        : 'Could not load this data. Check that the backend is running.';
    return (
      <EmptyState
        glyph="!"
        tone="danger"
        title="Something went wrong"
        description={message}
        action={onRetry ? <Button label="Retry" variant="outline" onPress={onRetry} /> : undefined}
      />
    );
  }

  return <>{children}</>;
}

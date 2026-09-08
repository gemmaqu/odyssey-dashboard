import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Only the framework-agnostic logic is unit tested here (see src/lib/cart).
    include: ['src/**/*.test.ts'],
  },
});

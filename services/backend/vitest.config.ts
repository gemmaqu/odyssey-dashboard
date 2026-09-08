import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    globalSetup: ['./test/global-setup.ts'],
    // Order-flow tests share one Postgres test database, so run serially.
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    hookTimeout: 60_000,
    testTimeout: 60_000,
  },
});

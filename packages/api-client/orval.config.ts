import { defineConfig } from 'orval';

/**
 * Generates React Query hooks + TS types from the backend's OpenAPI document.
 * The output in src/generated/** is never hand-edited — run `pnpm gen:contract`
 * to refresh it after changing the backend contract.
 */
export default defineConfig({
  odyssey: {
    input: '../../services/backend/openapi.json',
    output: {
      mode: 'tags-split',
      target: './src/generated/endpoints',
      schemas: './src/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: './src/mutator.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          signal: true,
        },
      },
    },
  },
});

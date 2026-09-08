import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const FALLBACK = 'postgres://odyssey:odyssey@localhost:5432/odyssey';

/**
 * Resolve DATABASE_URL for the Node-side scripts (migrate, seed, drizzle-kit).
 * Loads the repo-root `.env` if present, then falls back to the docker-compose
 * credentials so the scripts work out of the box after `pnpm db:up`.
 */
export function getDatabaseUrl(): string {
  if (!process.env.DATABASE_URL) {
    const rootEnv = resolve(process.cwd(), '../../.env');
    if (existsSync(rootEnv) && typeof process.loadEnvFile === 'function') {
      try {
        process.loadEnvFile(rootEnv);
      } catch {
        // ignore — fall through to the default
      }
    }
  }
  return process.env.DATABASE_URL ?? FALLBACK;
}

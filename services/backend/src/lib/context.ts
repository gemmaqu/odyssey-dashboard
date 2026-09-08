import type { Database } from '../db/client.js';
import type postgres from 'postgres';

export interface Bindings {
  /** Cloudflare Hyperdrive binding (see wrangler.jsonc). */
  HYPERDRIVE: Hyperdrive;
  /** Optional override used by tests to point at a Postgres instance directly. */
  DATABASE_URL?: string;
}

export interface Variables {
  db: Database;
  sql: postgres.Sql;
}

export type HonoEnv = { Bindings: Bindings; Variables: Variables };

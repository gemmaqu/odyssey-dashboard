import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export type Database = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Build a Drizzle client over a postgres-js connection.
 *
 * On Cloudflare Workers a connection must be created and used within a single
 * request — I/O objects can't cross request boundaries — so the app creates one
 * per request (see the DB middleware) and closes it after the response. The
 * migrate/seed Node scripts and tests call this directly and close it themselves.
 *
 * `fetch_types: false` is required on Workers (postgres-js otherwise issues a
 * startup catalog query the runtime disallows).
 */
export function createDb(connectionString: string): { db: Database; sql: postgres.Sql } {
  const sql = postgres(connectionString, { max: 5, fetch_types: false });
  const db = drizzle(sql, { schema });
  return { db, sql };
}

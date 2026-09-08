import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { getDatabaseUrl } from '../src/db/env.js';

export const TEST_DB_NAME = 'odyssey_test';

export function toTestUrl(baseUrl: string): string {
  return baseUrl.replace(/\/[^/]+(\?.*)?$/, `/${TEST_DB_NAME}$1`);
}

/**
 * Create a fresh `odyssey_test` database and run migrations against it before
 * the suite. Runs once for the whole test run.
 */
export default async function setup() {
  const baseUrl = getDatabaseUrl();

  const admin = postgres(baseUrl, { max: 1 });
  await admin.unsafe(`DROP DATABASE IF EXISTS ${TEST_DB_NAME} WITH (FORCE)`);
  await admin.unsafe(`CREATE DATABASE ${TEST_DB_NAME}`);
  await admin.end();

  const testUrl = toTestUrl(baseUrl);
  const sql = postgres(testUrl, { max: 1 });
  await migrate(drizzle(sql), { migrationsFolder: './drizzle' });
  await sql.end();
}

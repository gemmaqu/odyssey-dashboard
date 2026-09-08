import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { createDb } from './client.js';
import { getDatabaseUrl } from './env.js';

async function main() {
  const url = getDatabaseUrl();
  const { db, sql } = createDb(url);
  console.log('Running migrations…');
  await migrate(db, { migrationsFolder: './drizzle' });
  await sql.end();
  console.log('Migrations complete.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

import { z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { settings, type Settings } from '../db/schema.js';
import type { SettingsDto, UpdateSettingsSchema } from '../schemas/settings.js';

const SINGLETON_ID = 'default';

const serialize = (row: Settings): SettingsDto => ({
  ...row,
  updatedAt: row.updatedAt.toISOString(),
});

/** Read the singleton settings row, creating it with defaults if missing. */
export async function getSettings(db: Database): Promise<SettingsDto> {
  const existing = await db.query.settings.findFirst({ where: eq(settings.id, SINGLETON_ID) });
  if (existing) return serialize(existing);

  const [created] = await db.insert(settings).values({ id: SINGLETON_ID }).returning();
  return serialize(created!);
}

export async function updateSettings(
  db: Database,
  patch: z.infer<typeof UpdateSettingsSchema>,
): Promise<SettingsDto> {
  await getSettings(db); // ensure the row exists
  const [updated] = await db
    .update(settings)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(settings.id, SINGLETON_ID))
    .returning();
  return serialize(updated!);
}

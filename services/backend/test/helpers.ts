import type { Database } from '../src/db/client.js';
import { getDatabaseUrl } from '../src/db/env.js';
import {
  customers,
  menuCategories,
  menuItems,
  orders,
  settings,
} from '../src/db/schema.js';
import type { HonoEnv } from '../src/lib/context.js';
import { toTestUrl } from './global-setup.js';

export const TEST_URL = toTestUrl(getDatabaseUrl());

/** Env bindings for `app.request(path, init, env)` in tests. */
export function testEnv(): HonoEnv['Bindings'] {
  return { DATABASE_URL: TEST_URL } as unknown as HonoEnv['Bindings'];
}

export interface Fixtures {
  customerId: string;
  categoryId: string;
  burgerId: string; // available, $10.00
  friesId: string; // unavailable
}

/** Wipe ordering tables and insert a small, known fixture set (10% tax). */
export async function resetAndSeed(db: Database): Promise<Fixtures> {
  await db.delete(orders); // cascades to order_items
  await db.delete(menuCategories); // cascades to menu_items
  await db.delete(customers);
  await db.delete(settings);

  await db.insert(settings).values({ id: 'default', taxRateBps: 1000, autoAccept: false });

  const [customer] = await db
    .insert(customers)
    .values({ name: 'Test Diner', email: `diner-${Date.now()}@example.com` })
    .returning();

  const [category] = await db.insert(menuCategories).values({ name: 'Test' }).returning();

  const [burger] = await db
    .insert(menuItems)
    .values({ categoryId: category!.id, name: 'Burger', priceCents: 1000, isAvailable: true })
    .returning();

  const [fries] = await db
    .insert(menuItems)
    .values({ categoryId: category!.id, name: 'Fries', priceCents: 400, isAvailable: false })
    .returning();

  return {
    customerId: customer!.id,
    categoryId: category!.id,
    burgerId: burger!.id,
    friesId: fries!.id,
  };
}

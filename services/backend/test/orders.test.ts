import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createDb } from '../src/db/client.js';
import { AppError } from '../src/lib/errors.js';
import {
  createOrder,
  listOrders,
  priceOrder,
  transitionOrder,
} from '../src/services/orders.service.js';
import { resetAndSeed, TEST_URL, type Fixtures } from './helpers.js';

/**
 * Order-flow tests exercise the service layer directly against a real Postgres
 * test database. The services own the business rules (server-side pricing,
 * availability checks, the status state machine), which is exactly what we want
 * to lock down. HTTP status codes are asserted via the AppError each rule throws.
 */

const { db, sql } = createDb(TEST_URL);
const TAX = { taxRateBps: 1000, autoAccept: false }; // 10%

let fx: Fixtures;

beforeEach(async () => {
  fx = await resetAndSeed(db);
});

afterAll(async () => {
  await sql.end();
});

describe('priceOrder', () => {
  it('sums line items and applies tax', () => {
    expect(priceOrder([{ unitPriceCents: 1000, quantity: 2 }], 1000)).toEqual({
      subtotalCents: 2000,
      taxCents: 200,
      totalCents: 2200,
    });
  });
});

describe('createOrder', () => {
  it('computes totals server-side from live prices', async () => {
    const order = await createOrder(db, { customerId: fx.customerId, items: [{ menuItemId: fx.burgerId, quantity: 2 }] }, TAX);
    expect(order.subtotalCents).toBe(2000);
    expect(order.taxCents).toBe(200);
    expect(order.totalCents).toBe(2200);
    expect(order.status).toBe('pending');
    expect(order.items[0]?.unitPriceCents).toBe(1000);
    expect(order.availableActions).toContain('accept');
  });

  it('auto-accepts when the setting is on', async () => {
    const order = await createOrder(db, { customerId: fx.customerId, items: [{ menuItemId: fx.burgerId, quantity: 1 }] }, { taxRateBps: 0, autoAccept: true });
    expect(order.status).toBe('accepted');
  });

  it('rejects an unavailable menu item (422)', async () => {
    await expect(
      createOrder(db, { customerId: fx.customerId, items: [{ menuItemId: fx.friesId, quantity: 1 }] }, TAX),
    ).rejects.toMatchObject({ status: 422 });
  });

  it('rejects an unknown customer (404)', async () => {
    const err = await createOrder(
      db,
      { customerId: '00000000-0000-0000-0000-000000000000', items: [{ menuItemId: fx.burgerId, quantity: 1 }] },
      TAX,
    ).catch((e) => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err.status).toBe(404);
  });
});

describe('transitionOrder', () => {
  async function newOrder() {
    const order = await createOrder(db, { customerId: fx.customerId, items: [{ menuItemId: fx.burgerId, quantity: 1 }] }, TAX);
    return order.id;
  }

  it('advances through the valid workflow', async () => {
    const id = await newOrder();
    for (const [action, expected] of [
      ['accept', 'accepted'],
      ['start_preparing', 'preparing'],
      ['mark_ready', 'ready'],
      ['complete', 'completed'],
    ] as const) {
      const updated = await transitionOrder(db, id, action);
      expect(updated.status).toBe(expected);
    }
  });

  it('rejects an illegal transition (409)', async () => {
    const id = await newOrder();
    await expect(transitionOrder(db, id, 'complete')).rejects.toMatchObject({ status: 409 });
  });

  it('cannot transition a terminal (completed) order', async () => {
    const id = await newOrder();
    for (const action of ['accept', 'start_preparing', 'mark_ready', 'complete'] as const) {
      await transitionOrder(db, id, action);
    }
    await expect(transitionOrder(db, id, 'cancel')).rejects.toMatchObject({ status: 409 });
  });
});

describe('listOrders', () => {
  it('filters by status and counts totals', async () => {
    const a = await createOrder(db, { customerId: fx.customerId, items: [{ menuItemId: fx.burgerId, quantity: 1 }] }, TAX);
    await transitionOrder(db, a.id, 'accept');
    await createOrder(db, { customerId: fx.customerId, items: [{ menuItemId: fx.burgerId, quantity: 1 }] }, TAX);

    const pending = await listOrders(db, { status: 'pending', limit: 20, offset: 0 });
    expect(pending.total).toBe(1);
    expect(pending.data.every((o) => o.status === 'pending')).toBe(true);
    expect(pending.data[0]?.customerName).toBe('Test Diner');
    expect(pending.data[0]?.itemCount).toBe(1);
  });
});

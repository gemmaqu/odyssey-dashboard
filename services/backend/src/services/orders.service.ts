import { availableActions, resolveTransition, type OrderStatus } from '@odyssey/types';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { customers, orderItems, orders } from '../db/schema.js';
import { conflict, notFound, unprocessable } from '../lib/errors.js';
import type { CreateOrderInput, OrderDetailDto, OrderSummaryDto } from '../schemas/orders.js';

interface OrderListFilters {
  status?: OrderStatus;
  customerId?: string;
  limit: number;
  offset: number;
}

/**
 * Compute order totals from authoritative, server-held prices. The client
 * never sends money — it sends item ids and quantities, and we price them.
 */
export function priceOrder(
  lines: { unitPriceCents: number; quantity: number }[],
  taxRateBps: number,
): { subtotalCents: number; taxCents: number; totalCents: number } {
  const subtotalCents = lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
  const taxCents = Math.round((subtotalCents * taxRateBps) / 10_000);
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

export async function createOrder(
  db: Database,
  input: CreateOrderInput,
  opts: { taxRateBps: number; autoAccept: boolean },
): Promise<OrderDetailDto> {
  const customer = await db.query.customers.findFirst({ where: eq(customers.id, input.customerId) });
  if (!customer) throw notFound('Customer not found.');

  const ids = [...new Set(input.items.map((i) => i.menuItemId))];
  const items = await db.query.menuItems.findMany({
    where: (mi, { inArray }) => inArray(mi.id, ids),
  });
  const itemById = new Map(items.map((i) => [i.id, i]));

  // Reject unknown or unavailable items before touching the database.
  const problems = input.items
    .filter((line) => {
      const item = itemById.get(line.menuItemId);
      return !item || !item.isAvailable;
    })
    .map((line) => {
      const item = itemById.get(line.menuItemId);
      return {
        path: line.menuItemId,
        message: !item ? 'Menu item not found.' : `"${item.name}" is currently unavailable.`,
      };
    });
  if (problems.length > 0) {
    throw unprocessable('One or more items cannot be ordered.', problems);
  }

  const lines = input.items.map((line) => {
    const item = itemById.get(line.menuItemId)!;
    return {
      menuItemId: item.id,
      nameSnapshot: item.name,
      unitPriceCents: item.priceCents,
      quantity: line.quantity,
      lineTotalCents: item.priceCents * line.quantity,
    };
  });

  const totals = priceOrder(lines, opts.taxRateBps);
  const initialStatus: OrderStatus = opts.autoAccept ? 'accepted' : 'pending';

  const orderId = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        customerId: customer.id,
        status: initialStatus,
        subtotalCents: totals.subtotalCents,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
        notes: input.notes ?? null,
      })
      .returning({ id: orders.id });

    await tx.insert(orderItems).values(lines.map((l) => ({ ...l, orderId: order!.id })));
    return order!.id;
  });

  return getOrderDetail(db, orderId);
}

export async function listOrders(
  db: Database,
  filters: OrderListFilters,
): Promise<{ data: OrderSummaryDto[]; total: number }> {
  const conditions = [
    filters.status ? eq(orders.status, filters.status) : undefined,
    filters.customerId ? eq(orders.customerId, filters.customerId) : undefined,
  ].filter(Boolean);
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, totalResult] = await Promise.all([
    db.query.orders.findMany({
      where,
      with: { customer: { columns: { name: true } }, items: { columns: { id: true } } },
      orderBy: desc(orders.createdAt),
      limit: filters.limit,
      offset: filters.offset,
    }),
    db.select({ count: sql<number>`count(*)::int` }).from(orders).where(where),
  ]);

  return {
    data: rows.map((row) => serializeSummary(row, row.customer.name, row.items.length)),
    total: totalResult[0]?.count ?? 0,
  };
}

export async function getOrderDetail(db: Database, id: string): Promise<OrderDetailDto> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { customer: true, items: true },
  });
  if (!order) throw notFound('Order not found.');

  return {
    ...stripDates(order),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    customer: {
      id: order.customer.id,
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
    },
    items: order.items,
    availableActions: availableActions(order.status),
  };
}

export async function transitionOrder(
  db: Database,
  id: string,
  action: Parameters<typeof resolveTransition>[1],
): Promise<OrderDetailDto> {
  const current = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    columns: { status: true },
  });
  if (!current) throw notFound('Order not found.');

  const result = resolveTransition(current.status, action);
  if (!result.ok) throw conflict(result.reason);

  await db
    .update(orders)
    .set({ status: result.to, updatedAt: new Date() })
    .where(eq(orders.id, id));

  return getOrderDetail(db, id);
}

// --- serialization helpers ------------------------------------------------

type OrderRow = typeof orders.$inferSelect;

function stripDates(order: OrderRow) {
  const { createdAt: _c, updatedAt: _u, ...rest } = order;
  return rest;
}

// Built explicitly (not by spreading the relational row) so the summary matches
// the OrderSummary contract exactly and never leaks joined customer/items.
function serializeSummary(order: OrderRow, customerName: string, itemCount: number): OrderSummaryDto {
  return {
    id: order.id,
    customerId: order.customerId,
    status: order.status,
    subtotalCents: order.subtotalCents,
    taxCents: order.taxCents,
    totalCents: order.totalCents,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    customerName,
    itemCount,
  };
}

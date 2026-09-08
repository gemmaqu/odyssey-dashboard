import { desc, eq, sql } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { orderItems, orders } from '../db/schema.js';
import type { DashboardSummaryDto } from '../schemas/stats.js';
import { listOrders } from './orders.service.js';

/**
 * Home KPIs. Revenue and averages count only non-cancelled orders (booked
 * revenue); "active" is any order still moving through the kitchen.
 */
export async function getDashboardSummary(db: Database): Promise<DashboardSummaryDto> {
  const [agg] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      nonCancelled: sql<number>`count(*) filter (where ${orders.status} <> 'cancelled')::int`,
      revenueCents: sql<number>`coalesce(sum(case when ${orders.status} <> 'cancelled' then ${orders.totalCents} else 0 end), 0)::int`,
      pendingOrders: sql<number>`count(*) filter (where ${orders.status} = 'pending')::int`,
      activeOrders: sql<number>`count(*) filter (where ${orders.status} in ('pending','accepted','preparing','ready'))::int`,
      completedOrders: sql<number>`count(*) filter (where ${orders.status} = 'completed')::int`,
    })
    .from(orders);

  const popular = await db
    .select({
      menuItemId: orderItems.menuItemId,
      name: sql<string>`max(${orderItems.nameSnapshot})`,
      quantity: sql<number>`sum(${orderItems.quantity})::int`,
      revenueCents: sql<number>`sum(${orderItems.lineTotalCents})::int`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(sql`${orders.status} <> 'cancelled'`)
    .groupBy(orderItems.menuItemId)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(5);

  const recent = await listOrders(db, { limit: 5, offset: 0 });

  const revenueCents = agg?.revenueCents ?? 0;
  const nonCancelled = agg?.nonCancelled ?? 0;

  return {
    totalOrders: agg?.totalOrders ?? 0,
    revenueCents,
    pendingOrders: agg?.pendingOrders ?? 0,
    activeOrders: agg?.activeOrders ?? 0,
    completedOrders: agg?.completedOrders ?? 0,
    avgOrderValueCents: nonCancelled > 0 ? Math.round(revenueCents / nonCancelled) : 0,
    popularItems: popular,
    recentOrders: recent.data,
  };
}

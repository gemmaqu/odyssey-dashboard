import { z } from '@hono/zod-openapi';
import { desc, eq, sql } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { customers, orders, type Customer } from '../db/schema.js';
import { badRequest, notFound } from '../lib/errors.js';
import type {
  CreateCustomerSchema,
  CustomerDetailDto,
  CustomerSummaryDto,
} from '../schemas/customers.js';
import { listOrders } from './orders.service.js';

// Spend excludes cancelled orders; order count includes every order placed.
const spendExpr = sql<number>`coalesce(sum(case when ${orders.status} <> 'cancelled' then ${orders.totalCents} else 0 end), 0)::int`;
const countExpr = sql<number>`count(${orders.id})::int`;
const lastOrderExpr = sql<string | null>`max(${orders.createdAt})`;

function serialize(row: {
  customer: Customer;
  orderCount: number;
  totalSpentCents: number;
  lastOrderAt: Date | string | null;
}): CustomerSummaryDto {
  return {
    ...row.customer,
    createdAt: row.customer.createdAt.toISOString(),
    orderCount: row.orderCount,
    totalSpentCents: row.totalSpentCents,
    lastOrderAt: row.lastOrderAt ? new Date(row.lastOrderAt).toISOString() : null,
  };
}

export async function listCustomers(db: Database): Promise<CustomerSummaryDto[]> {
  const rows = await db
    .select({
      customer: customers,
      orderCount: countExpr,
      totalSpentCents: spendExpr,
      lastOrderAt: lastOrderExpr,
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .groupBy(customers.id)
    .orderBy(desc(spendExpr));

  return rows.map(serialize);
}

export async function getCustomerDetail(db: Database, id: string): Promise<CustomerDetailDto> {
  const [row] = await db
    .select({
      customer: customers,
      orderCount: countExpr,
      totalSpentCents: spendExpr,
      lastOrderAt: lastOrderExpr,
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .where(eq(customers.id, id))
    .groupBy(customers.id);

  if (!row) throw notFound('Customer not found.');

  const recent = await listOrders(db, { customerId: id, limit: 5, offset: 0 });
  return { ...serialize(row), recentOrders: recent.data };
}

export async function createCustomer(
  db: Database,
  input: z.infer<typeof CreateCustomerSchema>,
): Promise<CustomerSummaryDto> {
  try {
    const [customer] = await db
      .insert(customers)
      .values({ name: input.name, email: input.email, phone: input.phone ?? null })
      .returning();
    return {
      ...customer!,
      createdAt: customer!.createdAt.toISOString(),
      orderCount: 0,
      totalSpentCents: 0,
      lastOrderAt: null,
    };
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      throw badRequest('A customer with this email already exists.');
    }
    throw err;
  }
}

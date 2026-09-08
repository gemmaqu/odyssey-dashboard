import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { customers } from '../db/schema.js';
import { isoDate } from './common.js';
import { OrderSummarySchema } from './orders.js';

const customerSelect = createSelectSchema(customers);

export const CustomerSchema = customerSelect.extend({ createdAt: isoDate }).openapi('Customer');

/** CRM list row: customer plus rolled-up order history. */
export const CustomerSummarySchema = CustomerSchema.extend({
  orderCount: z.number().int(),
  totalSpentCents: z.number().int(),
  lastOrderAt: isoDate.nullable(),
}).openapi('CustomerSummary');

export const CustomerDetailSchema = CustomerSummarySchema.extend({
  recentOrders: z.array(OrderSummarySchema),
}).openapi('CustomerDetail');

export const CreateCustomerSchema = createInsertSchema(customers, {
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('A valid email is required'),
})
  .pick({ name: true, email: true, phone: true })
  .openapi('CreateCustomer');

export type CustomerSummaryDto = z.infer<typeof CustomerSummarySchema>;
export type CustomerDetailDto = z.infer<typeof CustomerDetailSchema>;

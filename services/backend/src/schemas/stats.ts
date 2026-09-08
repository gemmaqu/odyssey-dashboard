import { z } from '@hono/zod-openapi';
import { OrderSummarySchema } from './orders.js';

export const PopularItemSchema = z
  .object({
    menuItemId: z.string().uuid(),
    name: z.string(),
    quantity: z.number().int(),
    revenueCents: z.number().int(),
  })
  .openapi('PopularItem');

export const DashboardSummarySchema = z
  .object({
    totalOrders: z.number().int(),
    revenueCents: z.number().int(),
    pendingOrders: z.number().int(),
    activeOrders: z.number().int(),
    completedOrders: z.number().int(),
    avgOrderValueCents: z.number().int(),
    popularItems: z.array(PopularItemSchema),
    recentOrders: z.array(OrderSummarySchema),
  })
  .openapi('DashboardSummary');

export type DashboardSummaryDto = z.infer<typeof DashboardSummarySchema>;

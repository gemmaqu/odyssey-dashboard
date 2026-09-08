import { z } from '@hono/zod-openapi';
import { ORDER_ACTIONS, ORDER_STATUSES, type OrderAction, type OrderStatus } from '@odyssey/types';
import { createSelectSchema } from 'drizzle-zod';
import { orderItems, orders } from '../db/schema.js';
import { isoDate } from './common.js';

const orderStatusEnum = z.enum(ORDER_STATUSES as unknown as [OrderStatus, ...OrderStatus[]]);
const orderActionEnum = z.enum(ORDER_ACTIONS as unknown as [OrderAction, ...OrderAction[]]);

// --- Order item -----------------------------------------------------------

export const OrderItemSchema = createSelectSchema(orderItems).openapi('OrderItem');

// --- Order summary / detail ----------------------------------------------

const orderSelect = createSelectSchema(orders);

export const OrderSummarySchema = orderSelect
  .extend({
    createdAt: isoDate,
    updatedAt: isoDate,
    customerName: z.string(),
    itemCount: z.number().int(),
  })
  .openapi('OrderSummary');

const OrderCustomerRefSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable(),
  })
  .openapi('OrderCustomerRef');

export const OrderDetailSchema = orderSelect
  .extend({
    createdAt: isoDate,
    updatedAt: isoDate,
    customer: OrderCustomerRefSchema,
    items: z.array(OrderItemSchema),
    /** Actions currently legal for this order's status. */
    availableActions: z.array(orderActionEnum),
  })
  .openapi('OrderDetail');

// --- Requests -------------------------------------------------------------

export const CreateOrderSchema = z
  .object({
    customerId: z.string().uuid(),
    items: z
      .array(
        z.object({
          menuItemId: z.string().uuid(),
          quantity: z.number().int().positive().max(99),
        }),
      )
      .min(1, 'An order must contain at least one item.'),
    notes: z.string().max(500).nullish(),
  })
  .openapi('CreateOrder');

export const OrderTransitionSchema = z
  .object({ action: orderActionEnum })
  .openapi('OrderTransition');

// --- List query / response -----------------------------------------------

export const OrderListQuerySchema = z.object({
  status: orderStatusEnum.optional(),
  customerId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const OrderListResponseSchema = z
  .object({
    data: z.array(OrderSummarySchema),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .openapi('OrderListResponse');

export type OrderSummaryDto = z.infer<typeof OrderSummarySchema>;
export type OrderDetailDto = z.infer<typeof OrderDetailSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

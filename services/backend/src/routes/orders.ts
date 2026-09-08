import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import type { HonoEnv } from '../lib/context.js';
import { ErrorSchema, IdParam } from '../schemas/common.js';
import { getSettings } from '../services/settings.service.js';
import {
  CreateOrderSchema,
  OrderDetailSchema,
  OrderListQuerySchema,
  OrderListResponseSchema,
  OrderTransitionSchema,
} from '../schemas/orders.js';
import {
  createOrder,
  getOrderDetail,
  listOrders,
  transitionOrder,
} from '../services/orders.service.js';

export const orderRoutes = new OpenAPIHono<HonoEnv>();

const json = <T extends z.ZodTypeAny>(schema: T) => ({ content: { 'application/json': { schema } } });
const errorResponse = (description: string) => ({ description, content: { 'application/json': { schema: ErrorSchema } } });

orderRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/orders',
    tags: ['Orders'],
    summary: 'List and filter orders',
    request: { query: OrderListQuerySchema },
    responses: { 200: { description: 'Orders', ...json(OrderListResponseSchema) } },
  }),
  async (c) => {
    const { status, customerId, limit, offset } = c.req.valid('query');
    const { data, total } = await listOrders(c.get('db'), { status, customerId, limit, offset });
    return c.json({ data, total, limit, offset }, 200);
  },
);

orderRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/orders',
    tags: ['Orders'],
    summary: 'Create an order (totals computed server-side)',
    request: { body: json(CreateOrderSchema) },
    responses: {
      201: { description: 'Created', ...json(OrderDetailSchema) },
      404: errorResponse('Customer not found'),
      422: errorResponse('An item is unknown or unavailable'),
    },
  }),
  async (c) => {
    const settings = await getSettings(c.get('db'));
    const order = await createOrder(c.get('db'), c.req.valid('json'), {
      taxRateBps: settings.taxRateBps,
      autoAccept: settings.autoAccept,
    });
    return c.json(order, 201);
  },
);

orderRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/orders/{id}',
    tags: ['Orders'],
    summary: 'Get order detail',
    request: { params: IdParam },
    responses: {
      200: { description: 'Order', ...json(OrderDetailSchema) },
      404: errorResponse('Not found'),
    },
  }),
  async (c) => c.json(await getOrderDetail(c.get('db'), c.req.valid('param').id), 200),
);

orderRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/orders/{id}/transitions',
    tags: ['Orders'],
    summary: 'Advance an order through a valid status transition',
    description:
      'Status changes go through the shared state machine. Illegal transitions are rejected with 409.',
    request: { params: IdParam, body: json(OrderTransitionSchema) },
    responses: {
      200: { description: 'Updated order', ...json(OrderDetailSchema) },
      404: errorResponse('Not found'),
      409: errorResponse('Illegal transition for the current status'),
    },
  }),
  async (c) =>
    c.json(
      await transitionOrder(c.get('db'), c.req.valid('param').id, c.req.valid('json').action),
      200,
    ),
);

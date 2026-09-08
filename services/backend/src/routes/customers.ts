import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import type { HonoEnv } from '../lib/context.js';
import { ErrorSchema, IdParam } from '../schemas/common.js';
import {
  CreateCustomerSchema,
  CustomerDetailSchema,
  CustomerSummarySchema,
} from '../schemas/customers.js';
import {
  createCustomer,
  getCustomerDetail,
  listCustomers,
} from '../services/customers.service.js';

export const customerRoutes = new OpenAPIHono<HonoEnv>();

const json = <T extends z.ZodTypeAny>(schema: T) => ({ content: { 'application/json': { schema } } });

customerRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/customers',
    tags: ['Customers'],
    summary: 'List customers with order count and spend',
    responses: { 200: { description: 'Customers', ...json(z.array(CustomerSummarySchema)) } },
  }),
  async (c) => c.json(await listCustomers(c.get('db')), 200),
);

customerRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/customers',
    tags: ['Customers'],
    summary: 'Create a customer',
    request: { body: json(CreateCustomerSchema) },
    responses: {
      201: { description: 'Created', ...json(CustomerSummarySchema) },
      400: { description: 'Duplicate email', content: { 'application/json': { schema: ErrorSchema } } },
    },
  }),
  async (c) => c.json(await createCustomer(c.get('db'), c.req.valid('json')), 201),
);

customerRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/customers/{id}',
    tags: ['Customers'],
    summary: 'Customer detail with recent orders',
    request: { params: IdParam },
    responses: {
      200: { description: 'Customer', ...json(CustomerDetailSchema) },
      404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
    },
  }),
  async (c) => c.json(await getCustomerDetail(c.get('db'), c.req.valid('param').id), 200),
);

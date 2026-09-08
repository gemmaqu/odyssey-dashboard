import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import type { HonoEnv } from '../lib/context.js';
import { ErrorSchema, IdParam } from '../schemas/common.js';
import {
  CreateMenuCategorySchema,
  CreateMenuItemSchema,
  MenuCategoryWithItemsSchema,
  MenuItemSchema,
  UpdateMenuItemSchema,
} from '../schemas/menu.js';
import {
  createMenuCategory,
  createMenuItem,
  getMenu,
  updateMenuItem,
} from '../services/menu.service.js';

export const menuRoutes = new OpenAPIHono<HonoEnv>();

const jsonBody = <T extends z.ZodTypeAny>(schema: T) => ({
  content: { 'application/json': { schema } },
});

menuRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/menu',
    tags: ['Menu'],
    summary: 'List categories with their items',
    responses: {
      200: { description: 'Menu', content: { 'application/json': { schema: z.array(MenuCategoryWithItemsSchema) } } },
    },
  }),
  async (c) => c.json(await getMenu(c.get('db')), 200),
);

menuRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/menu/categories',
    tags: ['Menu'],
    summary: 'Create a category',
    request: { body: jsonBody(CreateMenuCategorySchema) },
    responses: {
      201: { description: 'Created', content: { 'application/json': { schema: MenuCategoryWithItemsSchema } } },
    },
  }),
  async (c) => c.json(await createMenuCategory(c.get('db'), c.req.valid('json')), 201),
);

menuRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/menu/items',
    tags: ['Menu'],
    summary: 'Create a menu item',
    request: { body: jsonBody(CreateMenuItemSchema) },
    responses: {
      201: { description: 'Created', content: { 'application/json': { schema: MenuItemSchema } } },
      404: { description: 'Category not found', content: { 'application/json': { schema: ErrorSchema } } },
    },
  }),
  async (c) => c.json(await createMenuItem(c.get('db'), c.req.valid('json')), 201),
);

menuRoutes.openapi(
  createRoute({
    method: 'patch',
    path: '/menu/items/{id}',
    tags: ['Menu'],
    summary: 'Update a menu item (price, availability, …)',
    request: { params: IdParam, body: jsonBody(UpdateMenuItemSchema) },
    responses: {
      200: { description: 'Updated', content: { 'application/json': { schema: MenuItemSchema } } },
      404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
    },
  }),
  async (c) => c.json(await updateMenuItem(c.get('db'), c.req.valid('param').id, c.req.valid('json')), 200),
);

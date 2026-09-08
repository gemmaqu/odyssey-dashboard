import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import type { HonoEnv } from '../lib/context.js';
import { SettingsSchema, UpdateSettingsSchema } from '../schemas/settings.js';
import { getSettings, updateSettings } from '../services/settings.service.js';

export const settingsRoutes = new OpenAPIHono<HonoEnv>();

settingsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/settings',
    tags: ['Settings'],
    summary: 'Get ordering settings',
    responses: {
      200: { description: 'Settings', content: { 'application/json': { schema: SettingsSchema } } },
    },
  }),
  async (c) => c.json(await getSettings(c.get('db')), 200),
);

settingsRoutes.openapi(
  createRoute({
    method: 'patch',
    path: '/settings',
    tags: ['Settings'],
    summary: 'Update ordering settings',
    request: { body: { content: { 'application/json': { schema: UpdateSettingsSchema } } } },
    responses: {
      200: { description: 'Updated', content: { 'application/json': { schema: SettingsSchema } } },
    },
  }),
  async (c) => c.json(await updateSettings(c.get('db'), c.req.valid('json')), 200),
);

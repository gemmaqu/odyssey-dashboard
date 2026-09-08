import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import type { HonoEnv } from '../lib/context.js';
import { DashboardSummarySchema } from '../schemas/stats.js';
import { getDashboardSummary } from '../services/stats.service.js';

export const statsRoutes = new OpenAPIHono<HonoEnv>();

statsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/stats/summary',
    tags: ['Stats'],
    summary: 'Home dashboard KPIs',
    responses: {
      200: {
        description: 'Summary',
        content: { 'application/json': { schema: DashboardSummarySchema } },
      },
    },
  }),
  async (c) => c.json(await getDashboardSummary(c.get('db')), 200),
);

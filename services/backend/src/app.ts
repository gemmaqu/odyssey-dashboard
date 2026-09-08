import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { ZodError } from 'zod';
import { createDb } from './db/client.js';
import type { HonoEnv } from './lib/context.js';
import { AppError } from './lib/errors.js';
import { menuRoutes } from './routes/menu.js';
import { orderRoutes } from './routes/orders.js';
import { customerRoutes } from './routes/customers.js';
import { settingsRoutes } from './routes/settings.js';
import { statsRoutes } from './routes/stats.js';

export function createApp() {
  const app = new OpenAPIHono<HonoEnv>({
    // Uniform envelope for request-validation failures across every route.
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            error: {
              code: 'validation_error',
              message: 'Request validation failed.',
              details: result.error.issues.map((i) => ({
                path: i.path.join('.'),
                message: i.message,
              })),
            },
          },
          400,
        );
      }
    },
  });

  app.use('*', cors());

  // Attach a DB client (Hyperdrive in prod / wrangler dev, DATABASE_URL in tests).
  // On Workers, connections can't cross request boundaries, so we open one per
  // request and close it after the response (via waitUntil where available).
  app.use('*', async (c, next) => {
    const connectionString = c.env.HYPERDRIVE?.connectionString ?? c.env.DATABASE_URL;
    if (!connectionString) {
      throw new AppError(500, 'config_error', 'No database connection configured.');
    }
    const { db, sql } = createDb(connectionString);
    c.set('db', db);
    c.set('sql', sql);
    try {
      await next();
    } finally {
      try {
        c.executionCtx.waitUntil(sql.end());
      } catch {
        await sql.end();
      }
    }
  });

  app.get('/health', (c) => c.json({ status: 'ok' }));

  app.route('/', menuRoutes);
  app.route('/', orderRoutes);
  app.route('/', customerRoutes);
  app.route('/', settingsRoutes);
  app.route('/', statsRoutes);

  // OpenAPI document + Swagger UI.
  app.doc31('/openapi.json', {
    openapi: '3.1.0',
    info: { title: 'Odyssey Ordering API', version: '0.1.0' },
  });
  app.get('/docs', swaggerUI({ url: '/openapi.json' }));

  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json(err.toResponse(), err.status as 400);
    }
    if (err instanceof ZodError) {
      return c.json(
        {
          error: {
            code: 'validation_error',
            message: 'Validation failed.',
            details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
          },
        },
        400,
      );
    }
    console.error('Unhandled error:', err);
    return c.json({ error: { code: 'internal_error', message: 'Something went wrong.' } }, 500);
  });

  return app;
}

export type ApiRoutes = ReturnType<typeof createApp>;

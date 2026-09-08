import { z } from '@hono/zod-openapi';

/** Consistent error envelope returned by every failing endpoint. */
export const ErrorSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({ example: 'validation_error' }),
      message: z.string().openapi({ example: 'Order must contain at least one item.' }),
      details: z
        .array(z.object({ path: z.string(), message: z.string() }))
        .optional(),
    }),
  })
  .openapi('Error');

export type ErrorResponse = z.infer<typeof ErrorSchema>;

export const IdParam = z.object({
  id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
});

/** ISO datetime string on the wire (DB stores a timestamptz). */
export const isoDate = z.string().datetime();

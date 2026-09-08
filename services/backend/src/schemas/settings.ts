import { z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import { settings } from '../db/schema.js';
import { isoDate } from './common.js';

export const OpeningHourSchema = z
  .object({
    day: z.number().int().min(0).max(6),
    open: z.string().regex(/^\d{2}:\d{2}$/),
    close: z.string().regex(/^\d{2}:\d{2}$/),
    closed: z.boolean(),
  })
  .openapi('OpeningHour');

const settingsSelect = createSelectSchema(settings);

export const SettingsSchema = settingsSelect
  .extend({
    updatedAt: isoDate,
    openingHours: z.array(OpeningHourSchema),
  })
  .openapi('Settings');

export const UpdateSettingsSchema = z
  .object({
    prepTimeMinutes: z.number().int().min(0).max(240),
    autoAccept: z.boolean(),
    serviceOpen: z.boolean(),
    taxRateBps: z.number().int().min(0).max(10_000),
    currency: z.string().length(3),
    openingHours: z.array(OpeningHourSchema),
  })
  .partial()
  .openapi('UpdateSettings');

export type SettingsDto = z.infer<typeof SettingsSchema>;

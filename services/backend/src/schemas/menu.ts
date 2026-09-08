import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { menuCategories, menuItems } from '../db/schema.js';
import { isoDate } from './common.js';

// --- Menu item ------------------------------------------------------------

const menuItemSelect = createSelectSchema(menuItems);

export const MenuItemSchema = menuItemSelect
  .extend({ createdAt: isoDate })
  .openapi('MenuItem');

export const CreateMenuItemSchema = createInsertSchema(menuItems, {
  name: z.string().min(1, 'Name is required'),
  priceCents: z.number().int().nonnegative('Price cannot be negative'),
  description: z.string().max(500).nullish(),
})
  .pick({
    categoryId: true,
    name: true,
    description: true,
    priceCents: true,
    isAvailable: true,
  })
  .openapi('CreateMenuItem');

export const UpdateMenuItemSchema = CreateMenuItemSchema.partial().openapi('UpdateMenuItem');

// --- Menu category (with nested items) ------------------------------------

const menuCategorySelect = createSelectSchema(menuCategories);

export const MenuCategorySchema = menuCategorySelect
  .extend({ createdAt: isoDate })
  .openapi('MenuCategory');

export const MenuCategoryWithItemsSchema = MenuCategorySchema.extend({
  items: z.array(MenuItemSchema),
}).openapi('MenuCategoryWithItems');

export const CreateMenuCategorySchema = createInsertSchema(menuCategories, {
  name: z.string().min(1, 'Name is required'),
})
  .pick({ name: true, sortOrder: true })
  .openapi('CreateMenuCategory');

export type MenuItemDto = z.infer<typeof MenuItemSchema>;
export type MenuCategoryWithItemsDto = z.infer<typeof MenuCategoryWithItemsSchema>;

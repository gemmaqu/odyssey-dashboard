import { ORDER_STATUSES, type OrderStatus } from '@odyssey/types';
import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * Persisted data truth. Everything downstream — drizzle-zod schemas, the
 * OpenAPI contract, and the generated frontend client — derives from here.
 *
 * Money is stored as integer cents to avoid floating-point drift.
 */

// The order status enum is defined once in @odyssey/types and reused for the
// Postgres enum, so the DB and the app can never disagree on the allowed values.
export const orderStatusEnum = pgEnum(
  'order_status',
  ORDER_STATUSES as unknown as [OrderStatus, ...OrderStatus[]],
);

export const menuCategories = pgTable('menu_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const menuItems = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => menuCategories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  isAvailable: boolean('is_available').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'restrict' }),
  status: orderStatusEnum('status').notNull().default('pending'),
  // Totals are computed and verified server-side; never trusted from the client.
  subtotalCents: integer('subtotal_cents').notNull(),
  taxCents: integer('tax_cents').notNull().default(0),
  totalCents: integer('total_cents').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: uuid('menu_item_id')
    .notNull()
    .references(() => menuItems.id, { onDelete: 'restrict' }),
  // Name and price are snapshotted so historical orders stay stable even if the
  // menu item is later renamed, repriced, or removed.
  nameSnapshot: text('name_snapshot').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  quantity: integer('quantity').notNull(),
  lineTotalCents: integer('line_total_cents').notNull(),
});

export interface OpeningHour {
  /** 0 = Sunday … 6 = Saturday */
  day: number;
  /** "HH:MM" 24h */
  open: string;
  /** "HH:MM" 24h */
  close: string;
  closed: boolean;
}

/** Single-row table holding ordering-related business settings. */
export const settings = pgTable('settings', {
  id: text('id').primaryKey().default('default'),
  prepTimeMinutes: integer('prep_time_minutes').notNull().default(20),
  autoAccept: boolean('auto_accept').notNull().default(false),
  serviceOpen: boolean('service_open').notNull().default(true),
  taxRateBps: integer('tax_rate_bps').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  openingHours: jsonb('opening_hours').$type<OpeningHour[]>().notNull().default([]),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- Relations (used by Drizzle relational queries) -----------------------

export const menuCategoriesRelations = relations(menuCategories, ({ many }) => ({
  items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  menuItem: one(menuItems, { fields: [orderItems.menuItemId], references: [menuItems.id] }),
}));

// --- Inferred row types ---------------------------------------------------

export type MenuCategory = typeof menuCategories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Settings = typeof settings.$inferSelect;

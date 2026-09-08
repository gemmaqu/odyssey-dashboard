import type { OrderStatus } from '@odyssey/types';
import { createDb } from './client.js';
import { getDatabaseUrl } from './env.js';
import {
  customers,
  menuCategories,
  menuItems,
  orderItems,
  orders,
  settings,
} from './schema.js';

/**
 * Deterministic bootstrap data so the dashboard has something real to show and
 * reviewers get identical output. Re-runnable: it clears the ordering tables
 * first. Totals are computed the same way the API computes them.
 */

const TAX_RATE_BPS = 800; // 8%

const CATEGORIES = [
  { name: 'Starters', sortOrder: 0 },
  { name: 'Mains', sortOrder: 1 },
  { name: 'Pizza', sortOrder: 2 },
  { name: 'Desserts', sortOrder: 3 },
  { name: 'Drinks', sortOrder: 4 },
];

const ITEMS: Record<string, { name: string; description: string; priceCents: number; isAvailable?: boolean }[]> = {
  Starters: [
    { name: 'Garlic Bread', description: 'Toasted sourdough, roasted garlic butter', priceCents: 650 },
    { name: 'Calamari', description: 'Crispy squid, lemon aioli', priceCents: 1150 },
    { name: 'Caprese Salad', description: 'Buffalo mozzarella, heirloom tomato, basil', priceCents: 1050 },
  ],
  Mains: [
    { name: 'Ribeye Steak', description: '10oz grass-fed, peppercorn sauce', priceCents: 3200 },
    { name: 'Grilled Salmon', description: 'Atlantic salmon, herb butter, greens', priceCents: 2450 },
    { name: 'Mushroom Risotto', description: 'Arborio rice, wild mushrooms, parmesan', priceCents: 1850 },
    { name: 'Truffle Fries', description: 'Hand-cut, truffle oil, parmesan', priceCents: 900, isAvailable: false },
  ],
  Pizza: [
    { name: 'Margherita', description: 'San Marzano, fior di latte, basil', priceCents: 1400 },
    { name: 'Diavola', description: 'Spicy salami, chilli, mozzarella', priceCents: 1650 },
    { name: 'Quattro Formaggi', description: 'Four-cheese blend, honey drizzle', priceCents: 1700 },
  ],
  Desserts: [
    { name: 'Tiramisu', description: 'Espresso-soaked ladyfingers, mascarpone', priceCents: 850 },
    { name: 'Panna Cotta', description: 'Vanilla bean, berry compote', priceCents: 800 },
  ],
  Drinks: [
    { name: 'Sparkling Water', description: '500ml', priceCents: 350 },
    { name: 'House Red', description: 'Glass, Sangiovese', priceCents: 950 },
    { name: 'Espresso', description: 'Double shot', priceCents: 300 },
  ],
};

const CUSTOMERS = [
  { name: 'Ava Thompson', email: 'ava@example.com', phone: '+1 415 555 0101' },
  { name: 'Liam Chen', email: 'liam@example.com', phone: '+1 415 555 0102' },
  { name: 'Sofia Rossi', email: 'sofia@example.com', phone: '+1 415 555 0103' },
  { name: 'Noah Patel', email: 'noah@example.com', phone: '+1 415 555 0104' },
  { name: 'Emma Davis', email: 'emma@example.com', phone: null },
  { name: 'Mateo García', email: 'mateo@example.com', phone: '+1 415 555 0106' },
  { name: 'Olivia Brown', email: 'olivia@example.com', phone: '+1 415 555 0107' },
  { name: 'Lucas Kim', email: 'lucas@example.com', phone: null },
];

/** Small seeded PRNG so re-seeds are identical. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  const { db, sql } = createDb(getDatabaseUrl());
  console.log('Seeding…');

  await sql`TRUNCATE TABLE order_items, orders, menu_items, menu_categories, customers, settings RESTART IDENTITY CASCADE`;

  await db.insert(settings).values({
    id: 'default',
    prepTimeMinutes: 20,
    autoAccept: false,
    serviceOpen: true,
    taxRateBps: TAX_RATE_BPS,
    currency: 'USD',
    openingHours: [
      { day: 0, open: '11:00', close: '21:00', closed: false },
      { day: 1, open: '11:00', close: '22:00', closed: false },
      { day: 2, open: '11:00', close: '22:00', closed: false },
      { day: 3, open: '11:00', close: '22:00', closed: false },
      { day: 4, open: '11:00', close: '23:00', closed: false },
      { day: 5, open: '11:00', close: '23:00', closed: false },
      { day: 6, open: '10:00', close: '23:00', closed: false },
    ],
  });

  const insertedCategories = await db.insert(menuCategories).values(CATEGORIES).returning();
  const categoryByName = new Map(insertedCategories.map((c) => [c.name, c]));

  const itemRows = Object.entries(ITEMS).flatMap(([categoryName, items]) =>
    items.map((item) => ({
      categoryId: categoryByName.get(categoryName)!.id,
      name: item.name,
      description: item.description,
      priceCents: item.priceCents,
      isAvailable: item.isAvailable ?? true,
    })),
  );
  const insertedItems = await db.insert(menuItems).values(itemRows).returning();
  const availableItems = insertedItems.filter((i) => i.isAvailable);

  const insertedCustomers = await db.insert(customers).values(CUSTOMERS).returning();

  // Generate ~28 orders spread over the last 12 days across the status mix.
  const rand = mulberry32(42);
  const statusPlan: OrderStatus[] = [
    ...Array<OrderStatus>(5).fill('pending'),
    ...Array<OrderStatus>(3).fill('accepted'),
    ...Array<OrderStatus>(3).fill('preparing'),
    ...Array<OrderStatus>(3).fill('ready'),
    ...Array<OrderStatus>(11).fill('completed'),
    ...Array<OrderStatus>(3).fill('cancelled'),
  ];

  for (let i = 0; i < statusPlan.length; i++) {
    const status = statusPlan[i]!;
    const customer = insertedCustomers[Math.floor(rand() * insertedCustomers.length)]!;
    const daysAgo = Math.floor(rand() * 12);
    const createdAt = new Date(Date.now() - daysAgo * 86_400_000 - Math.floor(rand() * 8) * 3_600_000);

    const lineCount = 1 + Math.floor(rand() * 3);
    const chosen = new Set<string>();
    const lines: { item: (typeof availableItems)[number]; quantity: number }[] = [];
    for (let l = 0; l < lineCount; l++) {
      const item = availableItems[Math.floor(rand() * availableItems.length)]!;
      if (chosen.has(item.id)) continue;
      chosen.add(item.id);
      lines.push({ item, quantity: 1 + Math.floor(rand() * 3) });
    }

    const subtotalCents = lines.reduce((sum, l) => sum + l.item.priceCents * l.quantity, 0);
    const taxCents = Math.round((subtotalCents * TAX_RATE_BPS) / 10_000);
    const totalCents = subtotalCents + taxCents;

    const [order] = await db
      .insert(orders)
      .values({
        customerId: customer.id,
        status,
        subtotalCents,
        taxCents,
        totalCents,
        notes: rand() > 0.8 ? 'No onions, please.' : null,
        createdAt,
        updatedAt: createdAt,
      })
      .returning();

    await db.insert(orderItems).values(
      lines.map((l) => ({
        orderId: order!.id,
        menuItemId: l.item.id,
        nameSnapshot: l.item.name,
        unitPriceCents: l.item.priceCents,
        quantity: l.quantity,
        lineTotalCents: l.item.priceCents * l.quantity,
      })),
    );
  }

  await sql.end();
  console.log(
    `Seeded ${insertedCategories.length} categories, ${insertedItems.length} items, ${insertedCustomers.length} customers, ${statusPlan.length} orders.`,
  );
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

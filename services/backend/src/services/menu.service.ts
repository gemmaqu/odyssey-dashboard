import { asc, eq } from 'drizzle-orm';
import { z } from '@hono/zod-openapi';
import type { Database } from '../db/client.js';
import { menuCategories, menuItems, type MenuCategory, type MenuItem } from '../db/schema.js';
import { notFound } from '../lib/errors.js';
import type {
  CreateMenuCategorySchema,
  CreateMenuItemSchema,
  MenuCategoryWithItemsDto,
  MenuItemDto,
  UpdateMenuItemSchema,
} from '../schemas/menu.js';

const serializeItem = (item: MenuItem): MenuItemDto => ({
  ...item,
  createdAt: item.createdAt.toISOString(),
});

const serializeCategory = (
  category: MenuCategory & { items: MenuItem[] },
): MenuCategoryWithItemsDto => ({
  ...category,
  createdAt: category.createdAt.toISOString(),
  items: category.items.map(serializeItem),
});

export async function getMenu(db: Database): Promise<MenuCategoryWithItemsDto[]> {
  const rows = await db.query.menuCategories.findMany({
    with: { items: { orderBy: asc(menuItems.name) } },
    orderBy: asc(menuCategories.sortOrder),
  });
  return rows.map(serializeCategory);
}

export async function createMenuItem(
  db: Database,
  input: z.infer<typeof CreateMenuItemSchema>,
): Promise<MenuItemDto> {
  const category = await db.query.menuCategories.findFirst({
    where: eq(menuCategories.id, input.categoryId),
  });
  if (!category) throw notFound('Category not found.');

  const [item] = await db
    .insert(menuItems)
    .values({
      categoryId: input.categoryId,
      name: input.name,
      description: input.description ?? null,
      priceCents: input.priceCents,
      isAvailable: input.isAvailable ?? true,
    })
    .returning();
  return serializeItem(item!);
}

export async function updateMenuItem(
  db: Database,
  id: string,
  patch: z.infer<typeof UpdateMenuItemSchema>,
): Promise<MenuItemDto> {
  const [item] = await db
    .update(menuItems)
    .set({
      ...(patch.categoryId !== undefined && { categoryId: patch.categoryId }),
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.description !== undefined && { description: patch.description ?? null }),
      ...(patch.priceCents !== undefined && { priceCents: patch.priceCents }),
      ...(patch.isAvailable !== undefined && { isAvailable: patch.isAvailable }),
    })
    .where(eq(menuItems.id, id))
    .returning();
  if (!item) throw notFound('Menu item not found.');
  return serializeItem(item);
}

export async function createMenuCategory(
  db: Database,
  input: z.infer<typeof CreateMenuCategorySchema>,
): Promise<MenuCategoryWithItemsDto> {
  const [category] = await db
    .insert(menuCategories)
    .values({ name: input.name, sortOrder: input.sortOrder ?? 0 })
    .returning();
  return serializeCategory({ ...category!, items: [] });
}

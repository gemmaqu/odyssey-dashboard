/**
 * Pure helpers for the create-order cart. Kept free of React so the pricing and
 * mutation logic can be unit tested directly. The server re-computes and is the
 * source of truth for money; this mirrors it for instant UI feedback.
 */

export interface CartLine {
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export interface MenuItemLike {
  id: string;
  name: string;
  priceCents: number;
}

export function addLine(lines: CartLine[], item: MenuItemLike): CartLine[] {
  const existing = lines.find((l) => l.menuItemId === item.id);
  if (existing) {
    return lines.map((l) =>
      l.menuItemId === item.id ? { ...l, quantity: l.quantity + 1 } : l,
    );
  }
  return [
    ...lines,
    { menuItemId: item.id, name: item.name, unitPriceCents: item.priceCents, quantity: 1 },
  ];
}

export function setQuantity(lines: CartLine[], menuItemId: string, quantity: number): CartLine[] {
  if (quantity <= 0) return removeLine(lines, menuItemId);
  return lines.map((l) => (l.menuItemId === menuItemId ? { ...l, quantity } : l));
}

export function removeLine(lines: CartLine[], menuItemId: string): CartLine[] {
  return lines.filter((l) => l.menuItemId !== menuItemId);
}

export interface CartTotals {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

export function cartTotals(lines: CartLine[], taxRateBps: number): CartTotals {
  const subtotalCents = lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
  const taxCents = Math.round((subtotalCents * taxRateBps) / 10_000);
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

/** Build the API request payload from cart lines. */
export function toCreateOrderItems(lines: CartLine[]): { menuItemId: string; quantity: number }[] {
  return lines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity }));
}

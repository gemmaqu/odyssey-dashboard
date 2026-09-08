import { describe, expect, it } from 'vitest';
import { addLine, cartTotals, removeLine, setQuantity, type CartLine } from './cart';

const burger = { id: 'b', name: 'Burger', priceCents: 1000 };
const fries = { id: 'f', name: 'Fries', priceCents: 400 };

describe('cart', () => {
  it('adds new lines and increments existing ones', () => {
    let lines: CartLine[] = [];
    lines = addLine(lines, burger);
    lines = addLine(lines, burger);
    lines = addLine(lines, fries);
    expect(lines).toHaveLength(2);
    expect(lines.find((l) => l.menuItemId === 'b')?.quantity).toBe(2);
  });

  it('setQuantity to 0 removes the line', () => {
    const lines = setQuantity([{ menuItemId: 'b', name: 'Burger', unitPriceCents: 1000, quantity: 3 }], 'b', 0);
    expect(lines).toHaveLength(0);
  });

  it('removeLine drops the matching item', () => {
    const start = addLine(addLine([], burger), fries);
    expect(removeLine(start, 'b')).toHaveLength(1);
  });

  it('computes subtotal, tax and total (8%)', () => {
    const lines = [
      { menuItemId: 'b', name: 'Burger', unitPriceCents: 1000, quantity: 2 },
      { menuItemId: 'f', name: 'Fries', unitPriceCents: 400, quantity: 1 },
    ];
    // subtotal = 2400, tax = round(2400 * 0.08) = 192, total = 2592
    expect(cartTotals(lines, 800)).toEqual({
      subtotalCents: 2400,
      taxCents: 192,
      totalCents: 2592,
    });
  });
});

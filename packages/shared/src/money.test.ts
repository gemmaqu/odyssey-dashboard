import { describe, expect, it } from 'vitest';
import { formatMoney, parseMoneyToCents } from './money';

describe('money', () => {
  it('formats cents as currency', () => {
    expect(formatMoney(1250)).toBe('$12.50');
    expect(formatMoney(0)).toBe('$0.00');
    expect(formatMoney(199)).toBe('$1.99');
  });

  it('parses decimal strings to cents', () => {
    expect(parseMoneyToCents('12.50')).toBe(1250);
    expect(parseMoneyToCents('$1,000.00')).toBe(100000);
    expect(parseMoneyToCents('3')).toBe(300);
  });

  it('rejects invalid money input', () => {
    expect(parseMoneyToCents('abc')).toBeNull();
    expect(parseMoneyToCents('1.234')).toBeNull();
    expect(parseMoneyToCents('')).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import {
  ORDER_STATUSES,
  availableActions,
  isTerminalStatus,
  resolveTransition,
} from './order-status.js';

describe('order state machine', () => {
  it('walks the happy path pending → completed', () => {
    let status = 'pending' as const;
    const path = ['accept', 'start_preparing', 'mark_ready', 'complete'] as const;
    const seen: string[] = [status];
    for (const action of path) {
      const result = resolveTransition(status as (typeof ORDER_STATUSES)[number], action);
      expect(result.ok).toBe(true);
      if (result.ok) {
        status = result.to as typeof status;
        seen.push(status);
      }
    }
    expect(seen).toEqual(['pending', 'accepted', 'preparing', 'ready', 'completed']);
  });

  it('rejects an illegal transition with an explanation', () => {
    const result = resolveTransition('pending', 'complete');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/cannot "complete"/i);
  });

  it('cannot act on terminal statuses', () => {
    expect(availableActions('completed')).toEqual([]);
    expect(availableActions('cancelled')).toEqual([]);
    expect(isTerminalStatus('completed')).toBe(true);
    expect(isTerminalStatus('pending')).toBe(false);
  });

  it('allows cancel before the order is ready, but not once ready or terminal', () => {
    const cancellable = ORDER_STATUSES.filter((s) => availableActions(s).includes('cancel'));
    expect(cancellable).toEqual(['pending', 'accepted', 'preparing']);
  });
});

/**
 * Order lifecycle — the single source of truth for order status values and the
 * legal transitions between them.
 *
 * Both the backend (Drizzle `pgEnum` + status-change service) and the frontend
 * (badges, action buttons) import from here, so the state machine is defined
 * exactly once. This is what stops status types from being duplicated across
 * the stack.
 */

export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Actions a user can take to move an order between statuses. */
export const ORDER_ACTIONS = [
  'accept',
  'start_preparing',
  'mark_ready',
  'complete',
  'cancel',
] as const;

export type OrderAction = (typeof ORDER_ACTIONS)[number];

/** Statuses from which no further transition is possible. */
export const TERMINAL_ORDER_STATUSES: readonly OrderStatus[] = ['completed', 'cancelled'];

/**
 * Each action declares the statuses it may be applied from and the status it
 * moves the order to. This map is the authoritative definition of the machine.
 */
export const ORDER_TRANSITIONS: Record<OrderAction, { from: readonly OrderStatus[]; to: OrderStatus }> = {
  accept: { from: ['pending'], to: 'accepted' },
  start_preparing: { from: ['accepted'], to: 'preparing' },
  mark_ready: { from: ['preparing'], to: 'ready' },
  complete: { from: ['ready'], to: 'completed' },
  cancel: { from: ['pending', 'accepted', 'preparing'], to: 'cancelled' },
};

/** Human-facing labels, kept next to the enum so UI and API messages agree. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ORDER_ACTION_LABELS: Record<OrderAction, string> = {
  accept: 'Accept',
  start_preparing: 'Start preparing',
  mark_ready: 'Mark ready',
  complete: 'Complete',
  cancel: 'Cancel',
};

export function isTerminalStatus(status: OrderStatus): boolean {
  return TERMINAL_ORDER_STATUSES.includes(status);
}

/** The actions legally available from a given status, in workflow order. */
export function availableActions(status: OrderStatus): OrderAction[] {
  return ORDER_ACTIONS.filter((action) => ORDER_TRANSITIONS[action].from.includes(status));
}

export type TransitionResult =
  | { ok: true; from: OrderStatus; to: OrderStatus }
  | { ok: false; reason: string };

/**
 * Resolve the target status for `action` applied to `current`, or explain why
 * it is illegal. Pure and side-effect free so it can be unit tested directly
 * and reused verbatim on the server.
 */
export function resolveTransition(current: OrderStatus, action: OrderAction): TransitionResult {
  const transition = ORDER_TRANSITIONS[action];
  if (!transition) {
    return { ok: false, reason: `Unknown action "${action}".` };
  }
  if (!transition.from.includes(current)) {
    return {
      ok: false,
      reason: `Cannot "${action}" an order that is "${current}". Allowed from: ${transition.from.join(', ')}.`,
    };
  }
  return { ok: true, from: current, to: transition.to };
}

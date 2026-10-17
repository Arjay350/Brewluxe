export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Out for delivery'
  | 'Completed'
  | 'Cancelled';

export const ALL_ORDER_STATUSES: readonly OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'Out for delivery',
  'Completed',
  'Cancelled',
] as const;

/**
 * Canonical flow:
 * - Pending -> Confirmed, Cancelled
 * - Confirmed -> Preparing, Cancelled
 * - Preparing -> Ready, Cancelled
 * - Ready -> Out for delivery, Completed
 * - Out for delivery -> Completed
 * - Completed / Cancelled are terminal (closed)
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Preparing', 'Cancelled'],
  Preparing: ['Ready', 'Cancelled'],
  Ready: ['Out for delivery', 'Completed'],
  'Out for delivery': ['Completed'],
  Completed: [],
  Cancelled: [],
};

export function getNextOrderStatuses(currentStatus: string): OrderStatus[] {
  const status = currentStatus as OrderStatus;
  const transitions = ORDER_STATUS_TRANSITIONS[status] ?? [];
  return [status, ...transitions];
}

export function isOrderClosed(currentStatus: string): boolean {
  return currentStatus === 'Completed' || currentStatus === 'Cancelled';
}

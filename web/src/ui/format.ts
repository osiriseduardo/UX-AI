import type { ActivityStatus, BehaviorSegment } from '../domain/types';

/**
 * Canonical profile values stay in English (the contract and the model).
 * These are the labels the user sees.
 */
const ACTIVITY_LABELS: Record<ActivityStatus, string> = {
  Active: 'Activo',
  'At Risk': 'En riesgo',
  Dormant: 'Latente',
  Inactive: 'Inactivo',
};

const SEGMENT_LABELS: Record<BehaviorSegment, string> = {
  'Frequent Buyer': 'Compra frecuente',
  'New Buyer': 'Cliente nuevo',
  'Occasional Buyer': 'Compra ocasional',
  'Regular Buyer': 'Compra regular',
};

export function activityLabel(status: ActivityStatus): string {
  return ACTIVITY_LABELS[status] ?? status;
}

export function segmentLabel(segment: BehaviorSegment): string {
  return SEGMENT_LABELS[segment] ?? segment;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);
}

export function finalPrice(price: number, discount: number): number {
  return Math.round(price * (1 - discount / 100));
}

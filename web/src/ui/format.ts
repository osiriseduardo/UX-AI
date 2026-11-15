import type { Category } from '../domain/types';

const HUES: Record<Category, number> = {
  Automotive: 210,
  Beauty: 330,
  Books: 25,
  Electronics: 265,
  Fashion: 350,
  Grocery: 140,
  'Health & Personal Care': 175,
  'Home & Kitchen': 40,
  'Office Supplies': 200,
  'Pet Supplies': 95,
  'Sports & Fitness': 220,
  Toys: 15,
};

export function categoryHue(category: Category): number {
  return HUES[category] ?? 220;
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

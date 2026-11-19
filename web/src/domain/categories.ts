import type { Category } from './types';

export const CATEGORIES: Category[] = [
  'Automotive',
  'Beauty',
  'Books',
  'Electronics',
  'Fashion',
  'Grocery',
  'Health & Personal Care',
  'Home & Kitchen',
  'Office Supplies',
  'Pet Supplies',
  'Sports & Fitness',
  'Toys',
];

/**
 * Canonical values (the contract and the model) stay in English.
 * These are the only labels the user sees.
 */
export const CATEGORY_LABELS: Record<Category, string> = {
  Automotive: 'Automotriz',
  Beauty: 'Belleza',
  Books: 'Libros',
  Electronics: 'Electrónica',
  Fashion: 'Moda',
  Grocery: 'Súper y despensa',
  'Health & Personal Care': 'Salud y cuidado personal',
  'Home & Kitchen': 'Hogar y cocina',
  'Office Supplies': 'Papelería',
  'Pet Supplies': 'Mascotas',
  'Sports & Fitness': 'Deporte y fitness',
  Toys: 'Juguetes',
};

export function categoryLabel(category: Category): string {
  return CATEGORY_LABELS[category] ?? category;
}

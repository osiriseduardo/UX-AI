import type { Category, Product } from '../domain/types';

/** Mock catalog: the dataset has customers and categories, but no products. */
const RAW: Array<[Category, string, number, number, string, boolean?, boolean?]> = [
  // category, name, price, discount %, emoji, bestSeller, previouslyBought
  ['Grocery', 'Café de especialidad 1 kg', 389, 15, '☕', true, true],
  ['Grocery', 'Caja de snacks saludables', 249, 0, '🥜', false, true],
  ['Grocery', 'Aceite de oliva extra virgen', 319, 10, '🫒', false, false],
  ['Books', 'El arte de la IA aplicada', 459, 20, '📘', true, true],
  ['Books', 'Novela: La última frontera', 289, 0, '📖', false, false],
  ['Books', 'Guía práctica de React', 529, 10, '📗', false, false],
  ['Sports & Fitness', 'Proteína whey 2 kg', 899, 25, '💪', true, true],
  ['Sports & Fitness', 'Tapete de yoga antideslizante', 449, 0, '🧘', false, true],
  ['Sports & Fitness', 'Mancuernas ajustables 20 kg', 1299, 15, '🏋️', true, false],
  ['Home & Kitchen', 'Set de sartenes antiadherentes', 1499, 30, '🍳', true, true],
  ['Home & Kitchen', 'Organizador de despensa', 349, 0, '🧺', false, false],
  ['Home & Kitchen', 'Cafetera de goteo', 899, 10, '🫖', false, true],
  ['Fashion', 'Chamarra ligera impermeable', 1099, 20, '🧥', true, false],
  ['Fashion', 'Tenis urbanos edición 2026', 1599, 15, '👟', true, true],
  ['Fashion', 'Mochila antirrobo 20 L', 799, 0, '🎒', false, false],
  ['Electronics', 'Audífonos con cancelación de ruido', 2499, 25, '🎧', true, true],
  ['Electronics', 'Smartwatch deportivo', 3299, 10, '⌚', true, false],
  ['Electronics', 'Cargador GaN 65 W', 599, 0, '🔌', false, false],
  ['Beauty', 'Sérum facial vitamina C', 649, 20, '🧴', true, true],
  ['Beauty', 'Set de brochas profesionales', 499, 0, '🖌️', false, false],
  ['Beauty', 'Protector solar SPF 50', 329, 10, '☀️', false, true],
  ['Health & Personal Care', 'Multivitamínico 90 cápsulas', 399, 15, '💊', true, true],
  ['Health & Personal Care', 'Cepillo eléctrico', 899, 0, '🪥', false, false],
  ['Health & Personal Care', 'Báscula de bioimpedancia', 749, 10, '⚖️', false, false],
  ['Office Supplies', 'Cuaderno inteligente reutilizable', 549, 20, '📓', true, false],
  ['Office Supplies', 'Set de plumas gel 12 pzas', 199, 0, '🖊️', false, true],
  ['Office Supplies', 'Lámpara de escritorio LED', 699, 10, '💡', false, false],
  ['Automotive', 'Kit de herramientas 120 pzas', 1199, 25, '🧰', true, false],
  ['Automotive', 'Aspiradora para auto', 799, 0, '🚗', false, false],
  ['Automotive', 'Cargador inalámbrico para auto', 449, 15, '🔋', false, false],
  ['Pet Supplies', 'Alimento premium para perro 10 kg', 1199, 20, '🐶', true, true],
  ['Pet Supplies', 'Cama ortopédica para mascota', 899, 0, '🐾', false, false],
  ['Pet Supplies', 'Juguete interactivo', 259, 10, '🎾', false, false],
  ['Toys', 'Set de bloques de construcción', 699, 15, '🧱', true, false],
  ['Toys', 'Rompecabezas 3D 1000 pzas', 399, 0, '🧩', false, true],
  ['Toys', 'Dron de práctica para niños', 999, 20, '🚁', false, false],
];

export const products: Product[] = RAW.map(
  ([category, name, price, discount, emoji, bestSeller, previouslyBought], index) => ({
    id: `P-${String(index + 1).padStart(3, '0')}`,
    category,
    name,
    price,
    discount,
    emoji,
    bestSeller,
    previouslyBought,
  }),
);

export function productsByCategory(category: Category): Product[] {
  return products.filter((product) => product.category === category);
}

export function discountedProducts(category: Category): Product[] {
  return productsByCategory(category).filter((product) => product.discount > 0);
}

export function previousPurchases(category: Category): Product[] {
  return productsByCategory(category).filter((product) => product.previouslyBought);
}

export function bestSellers(category: Category): Product[] {
  return productsByCategory(category).filter((product) => product.bestSeller);
}

export function findProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

/** Keeps the preferred products first, then fills with the rest of the category. */
export function fillWithCategory(
  category: Category,
  preferred: Product[],
  limit = 3,
): Product[] {
  const ids = new Set(preferred.map((product) => product.id));
  const rest = productsByCategory(category).filter((product) => !ids.has(product.id));
  return [...preferred, ...rest].slice(0, limit);
}

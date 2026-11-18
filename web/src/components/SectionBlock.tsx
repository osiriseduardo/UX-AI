import type { ProductSectionKind } from '../domain/arrangement';
import type { Category, Product } from '../domain/types';
import { categoryLabel } from '../domain/categories';
import { ProductCard } from './ProductCard';

interface SectionBlockProps {
  kind: ProductSectionKind;
  category: Category;
  products: Product[];
  onAdd: (product: Product) => void;
  onOpenCategory: (category: Category) => void;
}

const HEADINGS: Record<ProductSectionKind, string> = {
  offers: 'Ofertas para ti',
  suggestions: 'Sugerencias',
  keepShopping: 'Sigue comprando',
};

const HINTS: Record<ProductSectionKind, string> = {
  offers: 'Precios rebajados en tu categoría',
  suggestions: 'Lo más vendido de la categoría',
  keepShopping: 'Artículos que ya conoces',
};

export function SectionBlock({
  kind,
  category,
  products,
  onAdd,
  onOpenCategory,
}: SectionBlockProps) {
  return (
    <section className="section-block" aria-labelledby={`section-${kind}`}>
      <header className="section-heading">
        <div>
          <h2 id={`section-${kind}`}>{HEADINGS[kind]}</h2>
          <p>
            {HINTS[kind]} · <strong>{categoryLabel(category)}</strong>
          </p>
        </div>
        <button
          type="button"
          className="link-button"
          onClick={() => onOpenCategory(category)}
        >
          Ver todo →
        </button>
      </header>
      <div className="product-row">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}

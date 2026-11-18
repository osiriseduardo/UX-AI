import type { Category, HeroEmphasis, LayoutVariant, Product } from '../domain/types';
import { categoryLabel } from '../domain/categories';
import { PlusIcon } from '../ui/icons';
import { PriceTag } from './PriceTag';

interface HeroProps {
  variant: LayoutVariant;
  emphasis: HeroEmphasis;
  category: Category;
  products: Product[];
  onAdd: (product: Product) => void;
  onOpenCategory: (category: Category) => void;
}

const TITLE: Record<HeroEmphasis, string> = {
  discounts: 'Las mejores ofertas para ti',
  previousPurchases: '¿Se te está acabando?',
  bestSellers: 'Inspirado en tus gustos',
  globalBestSellers: 'Lo más vendido de la tienda',
};

function subtitleFor(emphasis: HeroEmphasis, category: Category, products: Product[]): string {
  const label = categoryLabel(category);
  switch (emphasis) {
    case 'discounts': {
      // Quote the real best discount on the shelf, never a fixed promise.
      const best = Math.max(0, ...products.map((product) => product.discount));
      return best > 0
        ? `Descuentos de hasta ${best}% en tu categoría favorita: ${label}`
        : `Tu categoría favorita: ${label}`;
    }
    case 'previousPurchases':
      return `Repite tu compra en ${label} y sigue donde lo dejaste`;
    case 'bestSellers':
      return `Los favoritos de todos en ${label}, elegidos para que explores`;
    case 'globalBestSellers':
      return `Sin personalización: lo más vendido en ${label}, la categoría más popular de la tienda`;
  }
}

export function Hero({
  variant,
  emphasis,
  category,
  products,
  onAdd,
  onOpenCategory,
}: HeroProps) {
  return (
    <section
      className="hero"
      aria-labelledby="hero-title"
      data-testid="hero"
      data-variant={variant}
    >
      <div className="hero-copy">
        <h1 id="hero-title">{TITLE[emphasis]}</h1>
        <p className="hero-subtitle">{subtitleFor(emphasis, category, products)}</p>
        <div className="hero-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => onOpenCategory(category)}
          >
            Ver {categoryLabel(category)}
          </button>
        </div>
      </div>

      <ul className="hero-shelf" aria-label={`Productos destacados en ${categoryLabel(category)}`}>
        {products.slice(0, 3).map((product) => (
          <li key={product.id} className="shelf-item">
            <img className="shelf-photo" src={product.image} alt="" loading="lazy" />
            <div className="shelf-info">
              <p className="shelf-name">{product.name}</p>
              <PriceTag price={product.price} discount={product.discount} />
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={() => onAdd(product)}
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <PlusIcon />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

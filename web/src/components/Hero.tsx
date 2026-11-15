import type { Category, HeroEmphasis, LayoutVariant, Product } from '../domain/types';
import { categoryLabel } from '../domain/categories';
import { finalPrice, formatPrice } from '../ui/format';

interface HeroProps {
  variant: LayoutVariant;
  emphasis: HeroEmphasis;
  category: Category;
  products: Product[];
  onAdd: (product: Product) => void;
  onOpenCategory: (category: Category) => void;
}

const SECTION_LABEL: Record<HeroEmphasis, string> = {
  discounts: 'Primero para ti · Ofertas',
  previousPurchases: 'Primero para ti · Recompra',
  bestSellers: 'Primero para ti · Sugerencias',
  globalBestSellers: 'Vista predeterminada · Popular',
};

const TITLE: Record<HeroEmphasis, string> = {
  discounts: 'Las mejores ofertas para ti',
  previousPurchases: '¿Se te está acabando?',
  bestSellers: 'Inspirado en tus gustos',
  globalBestSellers: 'Lo más vendido de la tienda',
};

function subtitleFor(emphasis: HeroEmphasis, category: Category): string {
  const label = categoryLabel(category);
  switch (emphasis) {
    case 'discounts':
      return `Descuentos de hasta 30% en tu categoría favorita: ${label}.`;
    case 'previousPurchases':
      return `Repite tu compra en ${label} y sigue donde lo dejaste.`;
    case 'bestSellers':
      return `Los favoritos de todos en ${label}, elegidos para que explores.`;
    case 'globalBestSellers':
      return 'Sin personalización: los productos favoritos de toda la tienda.';
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
      className={`hero hero-${variant.toLowerCase()}`}
      aria-labelledby="hero-title"
      data-testid="hero"
    >
      <div className="hero-copy">
        <p className="hero-eyebrow">{SECTION_LABEL[emphasis]}</p>
        <h1 id="hero-title">{TITLE[emphasis]}</h1>
        <p className="hero-subtitle">{subtitleFor(emphasis, category)}</p>
        <div className="hero-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => onOpenCategory(category)}
          >
            Ver {categoryLabel(category)}
          </button>
          <span className="hero-chip">Prioridad #1</span>
        </div>
      </div>

      <ul className="hero-products" aria-label={`Productos destacados en ${categoryLabel(category)}`}>
        {products.slice(0, 3).map((product) => (
          <li key={product.id} className="hero-product">
            <img
              className="hero-thumb"
              src={product.image}
              alt=""
              loading="lazy"
            />
            <div>
              <p>{product.name}</p>
              <p className="hero-price">
                {formatPrice(finalPrice(product.price, product.discount))}
              </p>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => onAdd(product)}
              aria-label={`Agregar ${product.name} al carrito`}
            >
              +
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

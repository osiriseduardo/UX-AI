import type { Product } from '../domain/types';
import { categoryLabel } from '../domain/categories';
import { categoryHue, finalPrice, formatPrice } from '../ui/format';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const hue = categoryHue(product.category);
  const price = finalPrice(product.price, product.discount);

  return (
    <article className="product-card">
      <div
        className="product-art"
        style={{
          background: `linear-gradient(140deg, hsl(${hue} 75% 92%), hsl(${hue} 65% 82%))`,
        }}
      >
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.discount > 0 && (
          <span className="discount-tag">-{product.discount}%</span>
        )}
      </div>
      <div className="product-body">
        <p className="product-category">{categoryLabel(product.category)}</p>
        <h3>{product.name}</h3>
        <div className="product-footer">
          <p className="price">
            {formatPrice(price)}
            {product.discount > 0 && <s>{formatPrice(product.price)}</s>}
          </p>
          <button
            type="button"
            className="add-button"
            onClick={() => onAdd(product)}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}

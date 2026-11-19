import type { Product } from '../domain/types';
import { categoryLabel } from '../domain/categories';
import { RepeatIcon } from '../ui/icons';
import { PriceTag } from './PriceTag';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  /** Shows the "bought before" mark; only personal sections may set it. */
  boughtBefore?: boolean;
}

export function ProductCard({ product, onAdd, boughtBefore = false }: ProductCardProps) {
  return (
    <article className={boughtBefore ? 'product-card bought' : 'product-card'}>
      <div className="product-art">
        <img src={product.image} alt={product.name} loading="lazy" />
        {boughtBefore && (
          <p className="bought-mark">
            <RepeatIcon size={14} />
            Ya lo compraste
          </p>
        )}
      </div>
      <div className="product-body">
        <p className="product-category">{categoryLabel(product.category)}</p>
        <h3>{product.name}</h3>
        <div className="product-footer">
          <PriceTag price={product.price} discount={product.discount} />
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

import type { Product } from '../domain/types';
import { categoryLabel } from '../domain/categories';
import { PriceTag } from './PriceTag';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-art">
        <img src={product.image} alt={product.name} loading="lazy" />
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

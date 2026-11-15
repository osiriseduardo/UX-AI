import type { Product } from '../domain/types';
import { finalPrice, formatPrice } from '../ui/format';

export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartPanelProps {
  lines: CartLine[];
  onAdd: (product: Product) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

export function CartPanel({ lines, onAdd, onRemove, onCheckout }: CartPanelProps) {
  const subtotal = lines.reduce(
    (sum, line) => sum + finalPrice(line.product.price, line.product.discount) * line.quantity,
    0,
  );

  return (
    <aside className="cart-panel" aria-labelledby="cart-title">
      <header className="cart-heading">
        <h2 id="cart-title">Tu carrito</h2>
        <span className="cart-count">{lines.reduce((sum, line) => sum + line.quantity, 0)}</span>
      </header>

      {lines.length === 0 ? (
        <p className="cart-empty">Tu carrito está vacío. Agrega productos desde el inicio.</p>
      ) : (
        <>
          <ul className="cart-lines">
            {lines.map(({ product, quantity }) => (
              <li key={product.id}>
                <img
                  className="cart-thumb"
                  src={product.image}
                  alt=""
                  loading="lazy"
                />
                <div className="cart-line-body">
                  <p>{product.name}</p>
                  <small>
                    {quantity} × {formatPrice(finalPrice(product.price, product.discount))}
                  </small>
                </div>
                <div className="cart-line-actions">
                  <button
                    type="button"
                    onClick={() => onAdd(product)}
                    aria-label={`Agregar otra unidad de ${product.name}`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(product.id)}
                    aria-label={`Quitar ${product.name} del carrito`}
                  >
                    −
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-total">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <button type="button" className="primary-button full" onClick={onCheckout}>
            Pagar
          </button>
        </>
      )}
    </aside>
  );
}

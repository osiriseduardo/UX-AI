import { finalPrice, formatPrice } from '../ui/format';

interface PriceTagProps {
  price: number;
  discount: number;
}

/**
 * The shelf tag: the store's one signature detail, used only for prices on
 * the shelf (Hero and product cards). Offers get the yellow tag.
 */
export function PriceTag({ price, discount }: PriceTagProps) {
  const onSale = discount > 0;

  return (
    <p className="price">
      {onSale && (
        <span className="price-was">
          <span className="sr-only">Antes </span>
          <s>{formatPrice(price)}</s> −{discount}%
        </span>
      )}
      <span className={onSale ? 'price-tag on-sale' : 'price-tag'}>
        {formatPrice(finalPrice(price, discount))}
      </span>
    </p>
  );
}

import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { fillWithCategory, previousPurchases, productsByCategory } from '../mocks/products';
import { SectionBlock } from './SectionBlock';

const noop = () => {};

function cardOf(productName: string): HTMLElement {
  const card = screen.getByRole('heading', { name: productName }).closest('article');
  if (!card) throw new Error(`No card for ${productName}`);
  return card;
}

describe('SectionBlock', () => {
  it('marks previously bought products in "Sigue comprando"', () => {
    const products = fillWithCategory('Grocery', previousPurchases('Grocery'));
    render(
      <SectionBlock
        kind="keepShopping"
        category="Grocery"
        products={products}
        onAdd={noop}
        onOpenCategory={noop}
      />,
    );

    expect(within(cardOf('Café de especialidad 1 kg')).getByText('Ya lo compraste')).toBeVisible();
    expect(within(cardOf('Caja de snacks saludables')).getByText('Ya lo compraste')).toBeVisible();
    // Items that only fill the row were never bought, so they carry no mark.
    expect(within(cardOf('Aceite de oliva extra virgen')).queryByText('Ya lo compraste')).toBeNull();
  });

  it('does not mark products outside "Sigue comprando"', () => {
    render(
      <SectionBlock
        kind="offers"
        category="Grocery"
        products={productsByCategory('Grocery')}
        onAdd={noop}
        onOpenCategory={noop}
      />,
    );

    expect(screen.queryByText('Ya lo compraste')).toBeNull();
  });
});

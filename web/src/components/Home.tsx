import { useMemo } from 'react';
import {
  bestSellers,
  discountedProducts,
  fillWithCategory,
  previousPurchases,
  products,
  productsByCategory,
} from '../mocks/products';
import type { HomeArrangement } from '../domain/arrangement';
import type { Category, Product, Profile } from '../domain/types';
import { categoryLabel } from '../domain/categories';
import type { Persona } from '../personas';
import { categoryHue, finalPrice, formatPrice } from '../ui/format';
import { AiNotice } from './AiNotice';
import { CartPanel, type CartLine } from './CartPanel';
import { Hero } from './Hero';
import { ProductCard } from './ProductCard';
import { SectionBlock } from './SectionBlock';

interface HomeProps {
  arrangement: HomeArrangement;
  persona: Persona;
  profile: Profile | null;
  restored: boolean;
  query: string;
  cartLines: CartLine[];
  onAdd: (product: Product) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  onRestore: () => void;
  onUndoRestore: () => void;
  onOpenCategory: (category: Category) => void;
}

export function Home({
  arrangement,
  persona,
  profile,
  restored,
  query,
  cartLines,
  onAdd,
  onRemove,
  onCheckout,
  onRestore,
  onUndoRestore,
  onOpenCategory,
}: HomeProps) {
  const { layout, heroCategory } = arrangement;

  const heroProducts = useMemo(() => {
    switch (layout.heroEmphasis) {
      case 'discounts': {
        const list = discountedProducts(heroCategory);
        return list.length > 0 ? list : productsByCategory(heroCategory);
      }
      case 'previousPurchases': {
        const list = previousPurchases(heroCategory);
        return fillWithCategory(heroCategory, list);
      }
      case 'bestSellers':
      case 'globalBestSellers': {
        // DEFAULT_POPULAR still keeps priority #1 (global) in the Hero (CA-03).
        const list = bestSellers(heroCategory);
        return fillWithCategory(heroCategory, list);
      }
    }
  }, [layout.heroEmphasis, heroCategory]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        categoryLabel(product.category).toLowerCase().includes(term),
    );
  }, [query]);

  const searching = query.trim().length > 0;

  return (
    <div className="page-grid">
      <main className="home">
        {searching ? (
          <section className="search-results" aria-labelledby="results-title">
            <header className="section-heading">
              <h1 id="results-title">Resultados para “{query.trim()}”</h1>
              <p>{results.length} productos encontrados</p>
            </header>
            {results.length === 0 ? (
              <p className="empty-state">
                No encontramos productos con ese término. Prueba con “café”, “yoga” o
                “tecnología”.
              </p>
            ) : (
              <div className="results-grid">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={onAdd} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {layout.isPersonalized || restored ? (
              <AiNotice
                personaName={persona.name}
                restored={restored}
                onRestore={onRestore}
                onUndoRestore={onUndoRestore}
              />
            ) : (
              <p className="default-note">
                Vista predeterminada · categorías y productos por popularidad global
              </p>
            )}

            <Hero
              variant={layout.variant}
              emphasis={layout.heroEmphasis}
              category={heroCategory}
              products={heroProducts}
              onAdd={onAdd}
              onOpenCategory={onOpenCategory}
            />

            {arrangement.sections.map((section) => {
              if (section.kind === 'categories') {
                const popular = section.categories
                  .map((category) => productsByCategory(category)[0])
                  .filter((product): product is Product => Boolean(product));
                return (
                  <ul
                    className="section-block category-strip"
                    key={section.kind}
                    aria-label="Categorías populares"
                  >
                    {popular.map((product) => {
                      const hue = categoryHue(product.category);
                      return (
                        <li key={product.category}>
                          <a
                            className="category-pill"
                            href={`#/categoria/${encodeURIComponent(product.category)}`}
                            style={{
                              background: `linear-gradient(140deg, hsl(${hue} 75% 94%), hsl(${hue} 65% 86%))`,
                            }}
                          >
                            <img
                              className="category-thumb"
                              src={product.image}
                              alt=""
                              loading="lazy"
                            />
                            <strong>{categoryLabel(product.category)}</strong>
                            <small>
                              Desde {formatPrice(finalPrice(product.price, product.discount))}
                            </small>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              const { kind, category } = section;
              const list =
                kind === 'offers'
                  ? discountedProducts(category)
                  : kind === 'keepShopping'
                    ? previousPurchases(category)
                    : bestSellers(category);
              const shown =
                kind === 'offers' && list.length > 0
                  ? list
                  : fillWithCategory(category, list);

              return (
                <SectionBlock
                  key={kind}
                  kind={kind}
                  category={category}
                  products={shown}
                  onAdd={onAdd}
                  onOpenCategory={onOpenCategory}
                />
              );
            })}
          </>
        )}
      </main>

      <div className="aside-column">
        <CartPanel
          lines={cartLines}
          onAdd={onAdd}
          onRemove={onRemove}
          onCheckout={onCheckout}
        />
        <section className="profile-summary" aria-label="Datos del perfil">
          <h2>{persona.name}</h2>
          <p>{persona.tagline}</p>
          <dl>
            <div>
              <dt>Cliente</dt>
              <dd>{profile?.customer_id ?? 'Invitada sin historial'}</dd>
            </div>
            <div>
              <dt>Actividad</dt>
              <dd>{profile?.activity_status ?? '—'}</dd>
            </div>
            <div>
              <dt>Segmento</dt>
              <dd>{profile?.behavior_segment ?? '—'}</dd>
            </div>
            <div>
              <dt>Variante</dt>
              <dd>{layout.variant}</dd>
            </div>
          </dl>
          <a className="link-button" href={`#/perfil/${persona.id}`}>
            Ver perfil completo →
          </a>
        </section>
      </div>
    </div>
  );
}

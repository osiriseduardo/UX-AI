import type { Category, Product } from '../domain/types';
import { CATEGORIES } from '../domain/categories';
import { categoryHue } from '../ui/format';
import { productsByCategory } from '../mocks/products';
import { ProductCard } from './ProductCard';

interface CategoryDetailProps {
  slug: string | undefined;
  onAdd: (product: Product) => void;
}

export function CategoryDetail({ slug, onAdd }: CategoryDetailProps) {
  const category = CATEGORIES.find((item) => item === slug);

  if (!category) {
    return (
      <main className="standalone">
        <h1>Categoría no encontrada</h1>
        <p>La categoría solicitada no existe en el catálogo.</p>
        <a className="primary-button" href="#/">
          Volver al inicio
        </a>
      </main>
    );
  }

  const items = productsByCategory(category as Category);
  const hue = categoryHue(category as Category);

  return (
    <main className="standalone">
      <nav className="breadcrumb" aria-label="Ruta de navegación">
        <a href="#/">Inicio</a>
        <span aria-hidden="true">/</span>
        <span>{category}</span>
      </nav>

      <header
        className="category-header"
        style={{
          background: `linear-gradient(140deg, hsl(${hue} 75% 94%), hsl(${hue} 65% 85%))`,
        }}
      >
        <h1>{category}</h1>
        <p>{items.length} productos de catálogo en esta categoría.</p>
      </header>

      <div className="results-grid">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={onAdd} />
        ))}
      </div>

      <a className="link-button" href="#/">
        ← Volver al dashboard
      </a>
    </main>
  );
}

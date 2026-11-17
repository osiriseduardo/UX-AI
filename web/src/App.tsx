import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Route, Routes } from 'react-router-dom';
import { AiNotice } from './components/AiNotice';
import { CategoryDetail } from './components/CategoryDetail';
import { Header } from './components/Header';
import { Home } from './components/Home';
import type { CartLine } from './components/CartPanel';
import { ProfileView } from './components/ProfileView';
import { loadArtifacts } from './data/artifacts';
import { arrangeHome } from './domain/arrangement';
import type { Artifacts, Product } from './domain/types';
import { findProduct } from './mocks/products';
import { findPersona, personas, profileFor } from './personas';

export default function App() {
  const [artifacts, setArtifacts] = useState<Artifacts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [personaId, setPersonaId] = useState('carlos');
  const [restored, setRestored] = useState(false);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>(() =>
    Object.fromEntries(personas[0].cartItems.map((id) => [id, 1])),
  );
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadArtifacts()
      .then(setArtifacts)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Unknown error'),
      );
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const persona = findPersona(personaId);
  const profile = useMemo(
    () => (artifacts ? profileFor(persona, artifacts.profiles.items) : null),
    [artifacts, persona],
  );
  const arrangement = useMemo(
    () =>
      artifacts
        ? arrangeHome(profile, artifacts.rankings, artifacts.popularity, restored)
        : null,
    [artifacts, profile, restored],
  );
  const missingProfile = persona.expectedVariant !== null && profile === null;

  const cartLines = useMemo<CartLine[]>(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => {
          const product = findProduct(id);
          return product ? { product, quantity } : null;
        })
        .filter((line): line is CartLine => line !== null),
    [cart],
  );

  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  function selectPersona(id: string) {
    const next = findPersona(id);
    setPersonaId(id);
    setRestored(false);
    setQuery('');
    setCart(Object.fromEntries(next.cartItems.map((itemId) => [itemId, 1])));
    navigate('/');
  }

  function addToCart(product: Product) {
    setCart((current) => ({
      ...current,
      [product.id]: (current[product.id] ?? 0) + 1,
    }));
    setToast(`${product.name} agregado al carrito`);
  }

  function removeFromCart(productId: string) {
    setCart((current) => {
      const next = { ...current };
      const quantity = (next[productId] ?? 0) - 1;
      if (quantity <= 0) delete next[productId];
      else next[productId] = quantity;
      return next;
    });
  }

  function openCategory(category: string) {
    navigate(`/categoria/${encodeURIComponent(category)}`);
  }

  if (error) {
    return (
      <main className="standalone">
        <h1>No se pudieron cargar los datos</h1>
        <p>{error}</p>
        <p>Ejecuta `pnpm --dir web dev` desde la raíz del repositorio.</p>
      </main>
    );
  }

  if (!artifacts) {
    return (
      <main className="standalone" aria-busy="true">
        <h1>Cargando la tienda…</h1>
        <p>Leyendo perfiles, rankings y popularidad exportados por el modelo.</p>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <Header
        persona={persona}
        query={query}
        cartCount={cartCount}
        onQuery={(value) => {
          setQuery(value);
          if (value) navigate('/');
        }}
        onSelectPersona={selectPersona}
        onOpenCart={() => {
          navigate('/');
          window.requestAnimationFrame(() =>
            document.querySelector('.cart-panel')?.scrollIntoView({ behavior: 'smooth' }),
          );
        }}
      />

      <Routes>
        <Route
          path="/"
          element={
            <>
              {missingProfile && (
                <p className="profile-error" role="alert">
                  Ningún perfil exportado coincide con la variante{' '}
                  {persona.expectedVariant} de {persona.name}: se muestra la vista
                  de invitada. Vuelve a exportar los artefactos del modelo.
                </p>
              )}
              {arrangement && <Home
                arrangement={arrangement}
                persona={persona}
                profile={profile}
                restored={restored}
                query={query}
                cartLines={cartLines}
                onAdd={addToCart}
                onRemove={removeFromCart}
                onCheckout={() => setToast('Pedido simulado: no se procesa ningún pago real')}
                onRestore={() => setRestored(true)}
                onUndoRestore={() => setRestored(false)}
                onOpenCategory={openCategory}
              />}
            </>
          }
        />
        <Route
          path="/categoria/:slug"
          element={<CategoryRoute onAdd={addToCart} />}
        />
        <Route
          path="/perfil/:personaId"
          element={
            <ProfileView persona={persona} profile={profile} artifacts={artifacts} />
          }
        />
        <Route
          path="*"
          element={
            <main className="standalone">
              <h1>Página no encontrada</h1>
              <AiNotice
                personaName={persona.name}
                restored={restored}
                onRestore={() => setRestored(true)}
                onUndoRestore={() => setRestored(false)}
              />
              <a className="primary-button" href="#/">
                Volver al inicio
              </a>
            </main>
          }
        />
      </Routes>

      {toast && (
        <p className="toast" role="status">
          {toast}
        </p>
      )}
    </div>
  );
}

function CategoryRoute({ onAdd }: { onAdd: (product: Product) => void }) {
  const { slug } = useParams();
  const decoded = slug ? decodeURIComponent(slug) : undefined;
  return <CategoryDetail slug={decoded} onAdd={onAdd} />;
}

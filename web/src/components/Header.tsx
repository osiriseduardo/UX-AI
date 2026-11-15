import { useState } from 'react';
import type { Persona } from '../personas';
import { personas } from '../personas';

interface HeaderProps {
  persona: Persona;
  query: string;
  cartCount: number;
  onQuery: (value: string) => void;
  onSelectPersona: (id: string) => void;
  onOpenCart: () => void;
}

export function Header({
  persona,
  query,
  cartCount,
  onQuery,
  onSelectPersona,
  onOpenCart,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#/">
          <span className="brand-mark" aria-hidden="true">
            U
          </span>
          <span>
            UX<span className="brand-dot">·</span>AI Store
          </span>
        </a>

        <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
          <label className="sr-only" htmlFor="search-input">
            Buscar productos
          </label>
          <span className="search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            id="search-input"
            type="search"
            placeholder="Buscar productos, marcas y categorías"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
          />
        </form>

        <div className="header-actions">
          <div className="persona-menu">
            <button
              type="button"
              className="persona-button"
              aria-expanded={menuOpen}
              aria-haspopup="listbox"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="avatar" aria-hidden="true">
                {persona.initial}
              </span>
              <span className="persona-label">
                <small>Hola,</small> {persona.name}
              </span>
              <span aria-hidden="true">▾</span>
            </button>

            {menuOpen && (
              <ul className="persona-list" role="listbox" aria-label="Cambiar de perfil">
                {personas.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={option.id === persona.id}
                      onClick={() => {
                        onSelectPersona(option.id);
                        setMenuOpen(false);
                      }}
                    >
                      <span className="avatar small" aria-hidden="true">
                        {option.initial}
                      </span>
                      <span>
                        <strong>{option.name}</strong>
                        <small>{option.tagline}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="button" className="cart-button" onClick={onOpenCart}>
            <span aria-hidden="true">🛒</span>
            <span className="cart-label">Carrito</span>
            <span className="cart-badge" aria-label={`${cartCount} productos en el carrito`}>
              {cartCount}
            </span>
          </button>
        </div>
      </div>
      <nav className="category-nav" aria-label="Categorías principales">
        <a href="#/categoria/Grocery">Súper</a>
        <a href="#/categoria/Electronics">Tecnología</a>
        <a href="#/categoria/Fashion">Moda</a>
        <a href="#/categoria/Home%20%26%20Kitchen">Hogar</a>
        <a href="#/categoria/Sports%20%26%20Fitness">Deporte</a>
        <a href="#/categoria/Beauty">Belleza</a>
      </nav>
    </header>
  );
}

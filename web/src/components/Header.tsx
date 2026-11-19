import { useState } from 'react';
import type { Persona } from '../personas';
import { personas } from '../personas';
import { CartIcon, ChevronDownIcon, SearchIcon, TagIcon } from '../ui/icons';

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
          <TagIcon className="brand-mark" size={20} />
          <span>UX·AI Store</span>
        </a>

        <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
          <label className="sr-only" htmlFor="search-input">
            Buscar productos
          </label>
          <SearchIcon className="search-icon" />
          <input
            id="search-input"
            type="search"
            placeholder="Buscar productos"
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
                <small>Perfil</small> {persona.name}
              </span>
              <ChevronDownIcon className="persona-caret" />
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
            <CartIcon />
            <span className="cart-label">Carrito</span>
            <span className="cart-badge" aria-label={`${cartCount} productos en el carrito`}>
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

import { CATEGORIES } from '../domain/categories';
import type { Artifacts, Profile } from '../domain/types';
import { buildLayout } from '../domain/layout';
import type { Persona } from '../personas';

interface ProfileViewProps {
  persona: Persona;
  profile: Profile | null;
  artifacts: Artifacts;
}

export function ProfileView({ persona, profile, artifacts }: ProfileViewProps) {
  const layout = buildLayout(profile);
  const ranking = profile
    ? artifacts.rankings.clusters.find((cluster) => cluster.cluster === profile.cluster)
    : undefined;

  return (
    <main className="standalone">
      <nav className="breadcrumb" aria-label="Ruta de navegación">
        <a href="#/">Inicio</a>
        <span aria-hidden="true">/</span>
        <span>Perfil</span>
      </nav>

      <header className="profile-header">
        <span className="avatar large" aria-hidden="true">
          {persona.initial}
        </span>
        <div>
          <h1>{persona.name}</h1>
          <p>{persona.tagline}</p>
        </div>
      </header>

      <div className="profile-cards">
        <section className="info-card" aria-labelledby="customer-data">
          <h2 id="customer-data">Datos del cliente</h2>
          <dl>
            <div>
              <dt>Identificador</dt>
              <dd>{profile?.customer_id ?? 'Invitada sin historial'}</dd>
            </div>
            <div>
              <dt>Cluster K-Means</dt>
              <dd>{profile ? `#${profile.cluster}` : 'Sin asignar'}</dd>
            </div>
            <div>
              <dt>Estado de actividad</dt>
              <dd>{profile?.activity_status ?? '—'}</dd>
            </div>
            <div>
              <dt>Segmento de comportamiento</dt>
              <dd>{profile?.behavior_segment ?? '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="info-card" aria-labelledby="layout-data">
          <h2 id="layout-data">Diseño asignado</h2>
          <p>
            Variante: <strong>{layout.variant}</strong>
            {layout.isPersonalized ? ' (personalizada)' : ' (predeterminada)'}
          </p>
          <p>Hero: {layout.heroEmphasis}</p>
          <p>Orden secundario: {layout.sections.join(' · ')}</p>
        </section>

        <section className="info-card" aria-labelledby="ranking-data">
          <h2 id="ranking-data">Categorías por prioridad</h2>
          <ol className="ranking-list">
            {(ranking?.categories ?? artifacts.popularity.categories.slice(0, 4)).map(
              (category, index) => (
                <li key={category}>
                  <span className="rank">#{index + 1}</span>
                  <a href={`#/categoria/${encodeURIComponent(category)}`}>{category}</a>
                </li>
              ),
            )}
          </ol>
        </section>
      </div>

      <p className="catalog-note">
        Catálogo de demostración con {CATEGORIES.length} categorías: {CATEGORIES.join(', ')}.
      </p>

      <a className="link-button" href="#/">
        ← Volver al dashboard
      </a>
    </main>
  );
}

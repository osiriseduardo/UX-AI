import { CATEGORIES, categoryLabel } from '../domain/categories';
import type { Artifacts, Profile } from '../domain/types';
import { arrangeHome } from '../domain/arrangement';
import type { Persona } from '../personas';
import { activityLabel, segmentLabel } from '../ui/format';

interface ProfileViewProps {
  persona: Persona;
  profile: Profile | null;
  artifacts: Artifacts;
}

export function ProfileView({ persona, profile, artifacts }: ProfileViewProps) {
  // The profile page reports the design the rules assign, not the restored view.
  const { layout, ranking } = arrangeHome(profile, artifacts.rankings, artifacts.popularity);

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
              <dd className={profile ? 'mono' : undefined}>
                {profile?.customer_id ?? 'Invitada sin historial'}
              </dd>
            </div>
            <div>
              <dt>Cluster K-Means</dt>
              <dd className="mono">{profile ? `#${profile.cluster}` : 'Sin asignar'}</dd>
            </div>
            <div>
              <dt>Estado de actividad</dt>
              <dd>{profile ? activityLabel(profile.activity_status) : '—'}</dd>
            </div>
            <div>
              <dt>Segmento de comportamiento</dt>
              <dd>{profile ? segmentLabel(profile.behavior_segment) : '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="info-card" aria-labelledby="layout-data">
          <h2 id="layout-data">Diseño asignado</h2>
          <dl>
            <div>
              <dt>Variante</dt>
              <dd className="mono">{layout.variant}</dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>{layout.isPersonalized ? 'Personalizada' : 'Predeterminada'}</dd>
            </div>
            <div>
              <dt>Hero</dt>
              <dd className="mono">{layout.heroEmphasis}</dd>
            </div>
            <div>
              <dt>Orden secundario</dt>
              <dd className="mono">{layout.sections.join(' · ')}</dd>
            </div>
          </dl>
        </section>

        <section className="info-card" aria-labelledby="ranking-data">
          <h2 id="ranking-data">Categorías por prioridad</h2>
          <ol className="ranking-list">
            {ranking.slice(0, 4).map((category, index) => (
              <li key={category}>
                <span className="rank">#{index + 1}</span>
                <a href={`#/categoria/${encodeURIComponent(category)}`}>
                  {categoryLabel(category)}
                </a>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <p className="catalog-note">
        Catálogo de demostración con {CATEGORIES.length} categorías:{' '}
        {CATEGORIES.map((category) => categoryLabel(category)).join(', ')}
      </p>

      <a className="link-button" href="#/">
        ← Volver al inicio
      </a>
    </main>
  );
}

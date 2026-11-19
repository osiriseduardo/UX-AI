import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { arrangeHome } from '../src/domain/arrangement';
import { categoryLabel } from '../src/domain/categories';
import type { Artifacts } from '../src/domain/types';
import { personas, profileFor } from '../src/personas';

/**
 * Integration: for every persona the UI shows exactly what the model exported
 * for the profile that persona is assigned: customer, K-Means cluster, Hero
 * category and the 1-4 ranking. Expectations are read from
 * `web/public/data/`, never hard-coded, so a re-export re-runs the same check.
 */
const dataDir = new URL('../public/data/', import.meta.url);

function readData<T>(name: string): T {
  return JSON.parse(readFileSync(fileURLToPath(new URL(name, dataDir)), 'utf8')) as T;
}

const artifacts: Artifacts = {
  profiles: readData('profiles.json'),
  rankings: readData('rankings.json'),
  popularity: readData('popularity.json'),
};

for (const persona of personas) {
  const profile = profileFor(persona, artifacts);
  const { heroCategory, ranking } = arrangeHome(
    profile,
    artifacts.rankings,
    artifacts.popularity,
  );
  const source = profile ? `cluster ${profile.cluster}` : 'global popularity';

  test(`${persona.name} sees the Hero and ranking of ${source}`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /^Perfil / }).click();
    await page.getByRole('option', { name: new RegExp(persona.name) }).click();

    await expect(page.getByTestId('hero')).toContainText(categoryLabel(heroCategory));
    const summary = page.getByRole('region', { name: 'Datos del perfil' });
    await expect(summary).toContainText(profile?.customer_id ?? 'Invitada sin historial');

    await summary.getByRole('link', { name: /Ver perfil completo/ }).click();
    await expect(page.locator('dl > div').filter({ hasText: 'Cluster K-Means' })).toContainText(
      profile ? `#${profile.cluster}` : 'Sin asignar',
    );
    await expect(page.locator('.ranking-list li a')).toHaveText(
      ranking.slice(0, 4).map(categoryLabel),
    );
  });
}

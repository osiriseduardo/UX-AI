import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { categoryLabel } from '../src/domain/categories';
import { resolveVariant } from '../src/domain/layout';
import type { Profile, RankingsArtifact } from '../src/domain/types';

/**
 * CA-03: the priority #1 category must render in the Hero, which must take
 * more than 40% of the usable dashboard width (desktop and mobile).
 *
 * The expected category is derived from the exported artifacts, never
 * hard-coded: Carlos is the first profile the rule table maps to
 * OFERTAS_PRIMERO, and the Hero shows its cluster's top category.
 */
const dataDir = new URL('../public/data/', import.meta.url);

function readData<T>(name: string): T {
  return JSON.parse(readFileSync(fileURLToPath(new URL(name, dataDir)), 'utf8')) as T;
}

function priorityOneLabel(): string {
  const profiles = readData<{ items: Profile[] }>('profiles.json').items;
  const rankings = readData<RankingsArtifact>('rankings.json');

  const carlos = profiles.find((profile) => resolveVariant(profile) === 'OFERTAS_PRIMERO');
  expect(carlos, 'profiles.json has no OFERTAS_PRIMERO profile').toBeDefined();

  const ranking = rankings.clusters.find((entry) => entry.cluster === carlos?.cluster);
  expect(ranking, `rankings.json has no cluster ${carlos?.cluster}`).toBeDefined();

  return categoryLabel(ranking!.categories[0]);
}

const priorityOne = priorityOneLabel();

test('CA-03 hero holds priority #1 and is wider than 40% of the dashboard', async ({
  page,
}) => {
  await page.goto('/');

  const hero = page.getByTestId('hero');
  await expect(hero).toBeVisible();
  await expect(hero.getByRole('heading', { level: 1 })).toContainText('ofertas');
  await expect(hero).toContainText(priorityOne);

  const ratio = await page.evaluate(() => {
    const heroBox = document.querySelector<HTMLElement>('[data-testid="hero"]');
    const dashboard = document.querySelector<HTMLElement>('.home');
    if (!heroBox || !dashboard) return 0;
    return heroBox.getBoundingClientRect().width / dashboard.clientWidth;
  });

  expect(ratio, `hero width ratio was ${ratio}`).toBeGreaterThan(0.4);
});

test('CA-03 keeps the priority #1 category in the Hero on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const hero = page.getByTestId('hero');
  await expect(hero).toBeVisible();
  await expect(hero).toContainText(priorityOne);

  const ratio = await page.evaluate(() => {
    const heroBox = document.querySelector<HTMLElement>('[data-testid="hero"]');
    const dashboard = document.querySelector<HTMLElement>('.home');
    if (!heroBox || !dashboard) return 0;
    return heroBox.getBoundingClientRect().width / dashboard.clientWidth;
  });

  expect(ratio, `mobile hero width ratio was ${ratio}`).toBeGreaterThan(0.4);
});

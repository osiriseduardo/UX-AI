import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { categoryLabel } from '../src/domain/categories';
import { resolveVariant } from '../src/domain/layout';
import type { Artifacts } from '../src/domain/types';
import { findPersona, profileFor } from '../src/personas';

/**
 * CA-03: the priority #1 category must render in the Hero, which must take
 * more than 40% of the usable dashboard width (desktop and mobile).
 *
 * The expected category is derived from the exported artifacts, never
 * hard-coded: Carlos gets the profile `profileFor` assigns him (rule table
 * variant OFERTAS_PRIMERO), and the Hero shows its cluster's top category.
 */
const dataDir = new URL('../public/data/', import.meta.url);

function readData<T>(name: string): T {
  return JSON.parse(readFileSync(fileURLToPath(new URL(name, dataDir)), 'utf8')) as T;
}

function priorityOneLabel(): string {
  const artifacts: Artifacts = {
    profiles: readData('profiles.json'),
    rankings: readData('rankings.json'),
    popularity: readData('popularity.json'),
  };
  const { rankings } = artifacts;

  const carlos = profileFor(findPersona('carlos'), artifacts);
  expect(carlos, 'profiles.json has no OFERTAS_PRIMERO profile').not.toBeNull();
  expect(resolveVariant(carlos)).toBe('OFERTAS_PRIMERO');

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

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { categoryLabel } from '../src/domain/categories';
import type { PopularityArtifact } from '../src/domain/types';

/**
 * CA-05 + layout rules: restoring the default view must show the same page as
 * a customer without history (DEFAULT_POPULAR): global #1 in the Hero and the
 * categories in global popularity order, with no trace of the cluster ranking.
 */
const popularity = JSON.parse(
  readFileSync(fileURLToPath(new URL('../public/data/popularity.json', import.meta.url)), 'utf8'),
) as PopularityArtifact;

const globalFirst = categoryLabel(popularity.categories[0]);
const globalOrder = popularity.categories.map((category) => categoryLabel(category));

async function expectDefaultPopular(page: import('@playwright/test').Page) {
  const hero = page.getByTestId('hero');
  await expect(hero).toContainText('Lo más vendido de la tienda');
  await expect(hero).toContainText(globalFirst);

  const strip = page.getByRole('list', { name: 'Categorías populares' });
  await expect(strip).toBeVisible();
  await expect(strip.getByRole('link')).toHaveText(
    globalOrder.map((label) => new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))),
  );
  await expect(page.getByRole('heading', { level: 2, name: 'Ofertas para ti' })).toHaveCount(0);
}

test('CA-05 restoring the default view drops the cluster ranking', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('region', { name: 'Aviso de personalización automática' })
    .getByRole('button', { name: 'Restaurar vista predeterminada' })
    .click();

  await expectDefaultPopular(page);
});

test('a guest without history gets the same DEFAULT_POPULAR page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Hola, Carlos/ }).click();
  await page.getByRole('option', { name: /Ana/ }).click();

  await expectDefaultPopular(page);
});

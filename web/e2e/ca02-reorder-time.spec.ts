import { expect, test } from '@playwright/test';

/**
 * CA-02: selecting a profile must reorder the interface in under 1.5 s.
 */
test('CA-02 profile switch reorders the home page in under 1.5 s', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Las mejores ofertas para ti' })).toBeVisible();

  const startedAt = Date.now();
  await page.getByRole('button', { name: /Hola, Carlos/ }).click();
  await page.getByRole('option', { name: /Sofía/ }).click();
  await expect(page.getByRole('heading', { name: 'Inspirado en tus gustos' })).toBeVisible();
  const elapsed = Date.now() - startedAt;

  // The copy of the Hero changes with the variant, proving the layout reordered.
  await expect(page.getByText('Primero para ti · Sugerencias')).toBeVisible();
  expect(elapsed, `reorder took ${elapsed} ms`).toBeLessThan(1500);
});

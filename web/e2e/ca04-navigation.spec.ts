import { expect, test } from '@playwright/test';

/**
 * CA-04: round-trip navigation Dashboard ↔ Category detail ↔ Profile.
 */
test('CA-04 dashboard and category detail navigate both ways', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Tecnología', exact: true }).click();
  await expect(page).toHaveURL(/#\/categoria\/Electronics/);
  await expect(page.getByRole('heading', { level: 1, name: 'Electronics' })).toBeVisible();

  await page.getByRole('link', { name: /Volver al dashboard/ }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByTestId('hero')).toBeVisible();

  await page.getByRole('link', { name: /Ver perfil completo/ }).click();
  await expect(page).toHaveURL(/#\/perfil\/carlos/);
  await expect(page.getByRole('heading', { level: 1, name: 'Carlos' })).toBeVisible();

  await page.getByRole('link', { name: /Volver al dashboard/ }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByTestId('hero')).toBeVisible();
});

test('CA-04 has no broken internal navigation targets', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('a[href^="#/"]').evaluateAll((anchors) =>
    [...new Set(anchors.map((anchor) => anchor.getAttribute('href') ?? ''))].filter(Boolean),
  );

  for (const href of hrefs) {
    await page.goto(`/${href}`);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Categoría no encontrada' })).toHaveCount(0);
  }
});

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { personas } from '../src/personas';

/**
 * CA-05: every personalized view shows an AI notice at WCAG AA contrast and
 * offers a control to restore the default view.
 */
test('CA-05 shows the AI notice and restores the default view', async ({ page }) => {
  await page.goto('/');

  const notice = page.getByRole('region', { name: 'Aviso de personalización automática' });
  await expect(notice).toBeVisible();
  await expect(notice).toContainText('ordenada automáticamente para Carlos');
  await expect(notice).toContainText('No es una recomendación humana');

  await notice.getByRole('button', { name: 'Restaurar vista predeterminada' }).click();
  await expect(notice).toContainText('Vista predeterminada activa');
  await expect(notice).toContainText('popularidad global');
  await expect(notice.getByRole('button', { name: 'Volver a mi vista personalizada' })).toBeVisible();

  await notice.getByRole('button', { name: 'Volver a mi vista personalizada' }).click();
  await expect(notice).toContainText('ordenada automáticamente para Carlos');
});

// Each layout variant colours the Home differently, so every persona's view
// gets its own WCAG A/AA check.
for (const persona of personas) {
  test(`CA-05 ${persona.name}'s view passes axe WCAG A/AA checks`, async ({ page }) => {
    // Freeze entrance animations so axe never samples semi-transparent text.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByRole('button', { name: /^Perfil / }).click();
    await page.getByRole('option', { name: new RegExp(persona.name) }).click();
    await expect(page.getByRole('button', { name: `Perfil ${persona.name}` })).toBeVisible();
    await expect(page.getByTestId('hero')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(
      results.violations.map((violation) => `${violation.id}: ${violation.help}`),
      JSON.stringify(results.violations, null, 2),
    ).toEqual([]);
  });
}

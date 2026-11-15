import { expect, test } from '@playwright/test';

/**
 * CA-03: the priority #1 category must render in the Hero, which must take
 * more than 40% of the usable dashboard width (desktop and mobile).
 */
test('CA-03 hero holds priority #1 and is wider than 40% of the dashboard', async ({
  page,
}) => {
  await page.goto('/');

  // Carlos is cluster 2: Books, Grocery, Office Supplies, Health & Personal Care.
  const hero = page.getByTestId('hero');
  await expect(hero).toBeVisible();
  await expect(hero.getByRole('heading', { level: 1 })).toContainText('ofertas');
  await expect(hero).toContainText('Súper y despensa');

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
  await expect(hero).toContainText('Súper y despensa');

  const ratio = await page.evaluate(() => {
    const heroBox = document.querySelector<HTMLElement>('[data-testid="hero"]');
    const dashboard = document.querySelector<HTMLElement>('.home');
    if (!heroBox || !dashboard) return 0;
    return heroBox.getBoundingClientRect().width / dashboard.clientWidth;
  });

  expect(ratio, `mobile hero width ratio was ${ratio}`).toBeGreaterThan(0.4);
});

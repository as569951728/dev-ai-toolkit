import { expect, test } from '@playwright/test';

const pageRoutes = [
  '/',
  '/playground',
  '/runs',
  '/runs/missing-run',
  '/prompts',
  '/prompts/missing-template',
  '/create-template',
  '/prompts/missing-template/edit',
  '/json-tools',
  '/api-builder',
  '/code-viewer',
  '/prompt-diff',
  '/workspace',
  '/missing-page',
];

test('skips navigation and exposes one page heading per route', async ({ page }) => {
  await page.goto('/');

  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  await page.keyboard.press('Tab');

  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();

  for (const route of pageRoutes) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(
      page.getByRole('link', { name: 'Share workflow feedback' }),
    ).toBeVisible();
  }
});

test('keeps focus visible and reduces interface motion when requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');

  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  const styles = await skipLink.evaluate((element) => {
    const computedStyle = window.getComputedStyle(element);
    const transitionDurations = computedStyle.transitionDuration
      .split(',')
      .map((duration) => {
        const value = Number.parseFloat(duration);
        return duration.trim().endsWith('ms') ? value : value * 1_000;
      });

    return {
      maxTransitionDuration: Math.max(...transitionDurations),
      outlineStyle: computedStyle.outlineStyle,
      outlineWidth: computedStyle.outlineWidth,
    };
  });

  expect(styles.outlineStyle).toBe('solid');
  expect(styles.outlineWidth).not.toBe('0px');
  expect(styles.maxTransitionDuration).toBeLessThanOrEqual(1);
});

import { expect, test } from '@playwright/test';

test('keeps the app usable when browser storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Access denied.', 'SecurityError');
      },
    });
  });

  await page.goto('/');

  await expect(
    page.getByRole('alert').filter({ hasText: 'Browser storage is unavailable.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /A local-first workspace for prompt work/i,
    }),
  ).toBeVisible();
});

import { expect, test } from '@playwright/test';

test('keeps the prompt playground inside a tablet viewport', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/playground');

  const documentWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );

  expect(documentWidth).toBeLessThanOrEqual(768);
});

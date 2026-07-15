import { expect, test } from '@playwright/test';

test('keeps the prompt playground inside a tablet viewport', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/playground');

  const documentWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );

  expect(documentWidth).toBeLessThanOrEqual(768);
});

test('keeps workflow feedback available inside a mobile viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/playground');

  const feedbackLink = page.getByRole('link', {
    name: 'Share workflow feedback',
  });

  await expect(feedbackLink).toBeVisible();
  await expect(feedbackLink).toHaveAttribute(
    'href',
    'https://github.com/as569951728/dev-ai-toolkit/issues/new?template=usage_feedback.yml',
  );

  const documentWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );

  expect(documentWidth).toBeLessThanOrEqual(375);
});

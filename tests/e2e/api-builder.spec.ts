import { expect, test } from '@playwright/test';

test('opens generated requests without exposing them in the URL', async ({
  page,
}) => {
  await page.goto('/api-builder');

  await page.getByLabel('Headers value 1').fill('Bearer private-token');
  await page.getByRole('link', { name: 'Open fetch in Code Viewer' }).click();

  await expect(page).toHaveURL(/\/code-viewer$/);
  await expect(page.getByLabel('Left input')).toContainText(
    'Bearer private-token',
  );
  expect(page.url()).not.toContain('private-token');

  await page.reload();

  await expect(page).toHaveURL(/\/code-viewer$/);
  await expect(page.getByLabel('Left input')).toContainText(
    'Bearer private-token',
  );
});

import { expect, test } from '@playwright/test';

const coreRoutes = [
  '/',
  '/playground?templateId=code-review-assistant',
  '/runs',
  '/workspace',
];

test('serves the core demo routes and direct prompt workflow entry', async ({
  page,
}) => {
  for (const route of coreRoutes) {
    const response = await page.goto(route);

    expect(response?.ok()).toBe(true);
    await expect(page.locator('h1')).toHaveCount(1);
  }

  await page.goto('/');
  await page
    .getByRole('link', { name: 'Open Code Review Assistant' })
    .click();

  await expect(page).toHaveURL(
    /\/playground\?templateId=code-review-assistant$/,
  );
  await expect(page.getByLabel('Active template')).toHaveValue(
    'code-review-assistant',
  );

  await page.reload();

  await expect(page.getByLabel('Active template')).toHaveValue(
    'code-review-assistant',
  );
});

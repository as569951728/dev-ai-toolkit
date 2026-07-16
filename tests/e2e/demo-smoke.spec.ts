import { expect, test } from '@playwright/test';

const coreRoutes = [
  '/',
  '/playground?templateId=code-review-assistant',
  '/runs',
  '/workspace',
];

const expectedSecurityHeaders = {
  'content-security-policy':
    "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'",
  'permissions-policy': 'camera=(), geolocation=(), microphone=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
};

test('serves the core demo routes and direct prompt workflow entry', async ({
  page,
}) => {
  for (const route of coreRoutes) {
    const response = await page.goto(route);

    expect(response?.ok()).toBe(true);

    for (const [name, value] of Object.entries(expectedSecurityHeaders)) {
      expect(
        response?.headers()[name],
        `${route} should return the ${name} header`,
      ).toBe(value);
    }

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

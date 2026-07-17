import { expect, test } from '@playwright/test';

const coreRoutes = [
  '/',
  '/playground?templateId=code-review-assistant',
  '/runs',
  '/workspace',
];
const publicDemoUrl = 'https://dev-ai-toolkit.vercel.app';

const expectedSecurityHeaders = {
  'content-security-policy':
    "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'",
  'permissions-policy': 'camera=(), geolocation=(), microphone=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
};

test('serves the core demo routes without runtime console failures', async ({
  page,
}) => {
  const runtimeFailures: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      runtimeFailures.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    runtimeFailures.push(`pageerror: ${error.message}`);
  });

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
  expect(runtimeFailures).toEqual([]);
});

test('serves baseline security headers from the public deployment', async (
  { page },
  testInfo,
) => {
  test.skip(
    testInfo.project.use.baseURL !== publicDemoUrl,
    'Security response headers are applied by the public Vercel deployment.',
  );

  for (const route of coreRoutes) {
    const response = await page.goto(route);

    expect(response?.ok()).toBe(true);

    for (const [name, value] of Object.entries(expectedSecurityHeaders)) {
      expect(
        response?.headers()[name],
        `${route} should return the ${name} header`,
      ).toBe(value);
    }
  }
});

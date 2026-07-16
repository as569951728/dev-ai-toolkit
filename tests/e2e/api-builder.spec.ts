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

test('omits a saved JSON body from generated GET requests', async ({ page }) => {
  await page.goto('/api-builder');

  await page.getByLabel('HTTP method').selectOption('GET');

  await expect(page.getByLabel('JSON body')).not.toHaveValue('');
  await expect(page.getByRole('status')).toContainText(
    'GET requests cannot include a body in browser fetch.',
  );
  await expect(page.getByText('Request body omitted')).toBeVisible();
  await expect(page.getByText(/fetch\('/)).not.toContainText('body:');
  await expect(page.getByText(/curl -X GET/)).not.toContainText('--data-raw');
});

test('keeps query parameters before relative URL fragments', async ({ page }) => {
  await page.goto('/api-builder');

  await page.getByLabel('Base URL').fill('/api/prompts#debug');

  await expect(
    page.getByText('/api/prompts?workspace=dev-ai-toolkit#debug', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText(/fetch\('/)).toContainText(
    "fetch('/api/prompts?workspace=dev-ai-toolkit#debug'",
  );
});

test('warns while keeping malformed JSON fetch code executable', async ({
  page,
}) => {
  await page.goto('/api-builder');

  await page.getByLabel('JSON body').fill('{bad-json');

  await expect(page.getByRole('alert')).toContainText(
    'JSON body is not valid JSON.',
  );
  await expect(page.getByText(/fetch\('/)).toContainText(
    'body: "{bad-json"',
  );
  await expect(page.getByText(/curl -X POST/)).toContainText(
    "--data-raw '{bad-json'",
  );
});

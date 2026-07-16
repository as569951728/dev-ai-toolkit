import { expect, test } from '@playwright/test';

test('invalidates formatted output after the JSON input changes', async ({
  page,
}) => {
  await page.goto('/json-tools');

  const input = page.getByLabel('JSON input');
  const copyButton = page.getByRole('button', { name: 'Copy result' });

  await input.fill('{"value":"first"}');
  await page.getByRole('button', { name: 'Format' }).click();

  await expect(page.locator('.json-output')).toContainText('"value": "first"');
  await expect(copyButton).toBeEnabled();

  await input.fill('{"value":"second"}');

  await expect(page.locator('.json-output')).toHaveText('No output yet.');
  await expect(page.getByText('Not validated')).toBeVisible();
  await expect(
    page.getByRole('status').filter({
      hasText: 'Input changed. Run an action to update the result.',
    }),
  ).toBeVisible();
  await expect(copyButton).toBeDisabled();
});

test('focuses a horizontally scrollable JSON result', async ({ page }) => {
  await page.goto('/json-tools');

  await page
    .getByLabel('JSON input')
    .fill(JSON.stringify({ payload: 'x'.repeat(2_000) }));
  await page.getByRole('button', { name: 'Minify' }).click();

  const output = page.getByLabel('JSON result');
  const dimensions = await output.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);

  await output.focus();
  await expect(output).toBeFocused();
});

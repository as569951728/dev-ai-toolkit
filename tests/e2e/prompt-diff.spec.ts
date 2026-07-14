import { expect, test } from '@playwright/test';

test('clears legacy prompt parameters after loading them', async ({ page }) => {
  await page.goto(
    '/prompt-diff?left=private-legacy-original&right=private-legacy-revised',
  );

  await expect(page).toHaveURL(/\/prompt-diff$/);
  await expect(page.getByLabel('Original prompt')).toHaveValue(
    'private-legacy-original',
  );
  await expect(page.getByLabel('Revised prompt')).toHaveValue(
    'private-legacy-revised',
  );

  await page.reload();

  await expect(page).toHaveURL(/\/prompt-diff$/);
  await expect(page.getByLabel('Original prompt')).toHaveValue(
    'private-legacy-original',
  );
  await expect(page.getByLabel('Revised prompt')).toHaveValue(
    'private-legacy-revised',
  );
});

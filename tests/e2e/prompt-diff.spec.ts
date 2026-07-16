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

test('counts repeated prompt lines as added occurrences', async ({ page }) => {
  await page.goto('/prompt-diff');

  await page.getByLabel('Original prompt').fill('Review carefully.');
  await page
    .getByLabel('Revised prompt')
    .fill('Review carefully.\nReview carefully.');

  const addedLines = page.locator('.prompt-diff-card').filter({
    has: page.getByRole('heading', { name: 'Added lines' }),
  });
  const removedLines = page.locator('.prompt-diff-card').filter({
    has: page.getByRole('heading', { name: 'Removed lines' }),
  });

  await expect(
    addedLines.getByText('Review carefully.', { exact: true }),
  ).toHaveCount(1);
  await expect(addedLines.getByText('No changes detected.')).toHaveCount(0);
  await expect(removedLines.getByText('No changes detected.')).toBeVisible();
});

test('reports reordered prompt lines as removed and added', async ({ page }) => {
  await page.goto('/prompt-diff');

  await page
    .getByLabel('Original prompt')
    .fill('First instruction.\nSecond instruction.');
  await page
    .getByLabel('Revised prompt')
    .fill('Second instruction.\nFirst instruction.');

  const addedLines = page.locator('.prompt-diff-card').filter({
    has: page.getByRole('heading', { name: 'Added lines' }),
  });
  const removedLines = page.locator('.prompt-diff-card').filter({
    has: page.getByRole('heading', { name: 'Removed lines' }),
  });

  await expect(
    addedLines.getByText('First instruction.', { exact: true }),
  ).toBeVisible();
  await expect(
    removedLines.getByText('First instruction.', { exact: true }),
  ).toBeVisible();
});

test('shows added blank and whitespace-only lines in the summary', async ({
  page,
}) => {
  await page.goto('/prompt-diff');

  await page
    .getByLabel('Original prompt')
    .fill('First instruction.\nSecond instruction.');
  await page
    .getByLabel('Revised prompt')
    .fill('First instruction.\n\n   \nSecond instruction.');

  const addedLines = page.locator('.prompt-diff-card').filter({
    has: page.getByRole('heading', { name: 'Added lines' }),
  });

  await expect(addedLines.getByText('(blank line)')).toHaveCount(2);
  await expect(addedLines.getByText('No changes detected.')).toHaveCount(0);
});

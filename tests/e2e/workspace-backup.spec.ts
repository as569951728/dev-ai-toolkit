import { expect, test } from '@playwright/test';

test('exports and restores a local workspace backup', async ({ page }) => {
  const templateName = 'Incident Review Checklist';

  await page.goto('/prompts/new');
  await page.getByLabel('Name').fill(templateName);
  await page
    .getByLabel('Description')
    .fill('Review an incident summary before sharing it.');
  await page
    .getByLabel('System prompt')
    .fill('You are a careful incident review assistant.');
  await page
    .getByLabel('User prompt')
    .fill('Review this incident summary: {{summary}}');
  await page.getByLabel('Tags').fill('incident, review');
  await page.getByRole('button', { name: 'Create template' }).click();

  await expect(
    page.getByRole('heading', { name: templateName, level: 3 }),
  ).toBeVisible();

  await page.goto('/workspace');
  const downloadPromise = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Export workspace JSON' })
    .click();
  const download = await downloadPromise;
  const backupPath = await download.path();

  if (!backupPath) {
    throw new Error('Expected the workspace backup download to have a path.');
  }

  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByLabel('Import workspace JSON').setInputFiles(backupPath);
  await expect(page.getByRole('status')).toContainText(
    'Workspace backup imported.',
  );

  await page.goto('/prompts');
  await expect(
    page.getByRole('heading', { name: templateName, level: 3 }),
  ).toBeVisible();
});

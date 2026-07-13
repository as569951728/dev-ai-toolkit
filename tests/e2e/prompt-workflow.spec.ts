import { expect, test } from '@playwright/test';

test('saves a prompt snapshot and opens it for review', async ({
  context,
  page,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: 'http://127.0.0.1:4173',
  });
  await page.goto('/playground?templateId=code-review-assistant');

  await page.getByLabel('Repository Name').fill('dev-ai-toolkit');
  await page.getByLabel('Change Scope').fill('frontend workflow');
  await page.getByRole('button', { name: 'Save run snapshot' }).click();

  await expect(page.getByRole('status')).toContainText(
    'Saved a run snapshot for Code Review Assistant v1.',
  );

  await page.getByRole('link', { name: 'Open saved run' }).click();

  await expect(page).toHaveURL(/\/runs\/[^/]+$/);
  await expect(
    page.getByRole('heading', { name: 'Code Review Assistant', level: 1 }),
  ).toBeVisible();
  await expect(page.getByText('Saved prompt snapshot', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Saved prompts' })).toBeVisible();

  const repositoryVariable = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'repository_name' }),
  });
  const changeScopeVariable = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'change_scope' }),
  });

  await expect(
    repositoryVariable.getByText('dev-ai-toolkit', { exact: true }),
  ).toBeVisible();
  await expect(
    changeScopeVariable.getByText('frontend workflow', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Reopen in Playground' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Copy full prompt' }).click();

  await expect(page.getByRole('status')).toContainText('Full prompt copied.');
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

  expect(clipboardText).toContain('System prompt');
  expect(clipboardText).toContain('User prompt');
  expect(clipboardText).toContain('dev-ai-toolkit');
  expect(clipboardText).toContain('frontend workflow');
});

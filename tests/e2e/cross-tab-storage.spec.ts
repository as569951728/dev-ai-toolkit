import { expect, test } from '@playwright/test';

test('refreshes prompt templates saved in another tab', async ({
  context,
  page,
}) => {
  const templateName = 'Cross-tab Review Checklist';

  await page.goto('/prompts');

  const editorPage = await context.newPage();
  await editorPage.goto('/create-template');
  await editorPage.getByLabel('Name').fill(templateName);
  await editorPage
    .getByLabel('Description')
    .fill('Verify storage changes from another browser tab.');
  await editorPage
    .getByLabel('System prompt')
    .fill('Review {{change_scope}} with the saved checklist.');
  await editorPage
    .getByLabel('User prompt')
    .fill('Summarize risks for {{change_scope}}.');
  await editorPage.getByRole('button', { name: 'Create template' }).click();

  await expect(editorPage).toHaveURL(/\/prompts$/);
  await expect(
    page.getByRole('heading', { level: 2, name: templateName }),
  ).toBeVisible();

  await editorPage.close();
});

test('restores a run note draft after another tab deletes its snapshot', async ({
  context,
  page,
}) => {
  await page.goto('/playground?templateId=code-review-assistant');
  await page.getByLabel('Repository Name').fill('dev-ai-toolkit');
  await page.getByLabel('Change Scope').fill('cross-tab run recovery');
  await page.getByRole('button', { name: 'Save prompt snapshot' }).click();
  await page.getByRole('link', { name: 'Open saved run' }).click();

  const originalRunUrl = page.url();
  const noteEditor = page.getByRole('textbox', {
    name: 'Note',
    exact: true,
  });

  await noteEditor.fill('Keep this cross-tab note draft.');

  const deletePage = await context.newPage();
  await deletePage.goto(originalRunUrl);
  await deletePage.getByRole('button', { name: 'Delete run' }).click();
  await deletePage.getByRole('button', { name: 'Confirm delete' }).click();

  await expect(deletePage).toHaveURL(/\/runs$/);
  await expect(
    page.getByRole('heading', { name: 'Snapshot deleted in another tab' }),
  ).toBeVisible();
  await expect(noteEditor).toHaveValue('Keep this cross-tab note draft.');
  await expect(page.getByRole('button', { name: 'Save note' })).toBeDisabled();

  await page
    .getByRole('button', { name: 'Restore snapshot and note' })
    .click();

  await expect(page).toHaveURL(/\/runs\/[^/]+$/);
  expect(page.url()).not.toBe(originalRunUrl);
  await expect(page.getByRole('button', { name: 'Save note' })).toBeEnabled();

  await page.reload();

  await expect(page.getByLabel('Note')).toHaveValue(
    'Keep this cross-tab note draft.',
  );
  await deletePage.close();
});

test('restores a template draft after another tab deletes its source', async ({
  context,
  page,
}) => {
  const templateName = 'Cross-tab Template Recovery';
  const recoveredName = 'Recovered Cross-tab Template';

  await page.goto('/create-template');
  await page.getByLabel('Name').fill(templateName);
  await page
    .getByLabel('Description')
    .fill('Exercise template draft recovery across browser tabs.');
  await page
    .getByLabel('System prompt')
    .fill('Review {{change_scope}} before it is merged.');
  await page
    .getByLabel('User prompt')
    .fill('Summarize the risks in {{change_scope}}.');
  await page.getByRole('button', { name: 'Create template' }).click();

  const templateCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: templateName }),
  });

  await templateCard.getByRole('button', { name: 'Edit' }).click();

  const originalEditUrl = page.url();
  const originalDetailUrl = originalEditUrl.replace(/\/edit$/, '');

  await page.getByLabel('Name').fill(recoveredName);

  const deletePage = await context.newPage();
  await deletePage.goto(originalDetailUrl);
  await deletePage.getByRole('button', { name: 'Delete' }).click();
  await deletePage.getByRole('button', { name: 'Confirm delete' }).click();

  await expect(deletePage).toHaveURL(/\/prompts$/);
  await expect(page.getByLabel('Name')).toHaveValue(recoveredName);
  await expect(page.getByRole('status')).toContainText(
    'Saved template was deleted in another tab.',
  );
  await page.getByRole('button', { name: 'Restore as new template' }).click();

  await expect(page).toHaveURL(/\/prompts$/);
  await page.reload();

  const recoveredCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: recoveredName }),
  });

  await expect(recoveredCard).toBeVisible();
  await recoveredCard.getByRole('button', { name: 'Edit' }).click();
  expect(page.url()).not.toBe(originalEditUrl);

  await deletePage.close();
});

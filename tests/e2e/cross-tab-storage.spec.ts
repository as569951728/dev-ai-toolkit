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
    page.getByRole('heading', { level: 3, name: templateName }),
  ).toBeVisible();

  await editorPage.close();
});

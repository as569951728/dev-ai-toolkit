import { expect, test } from '@playwright/test';

test('saves a prompt snapshot and protects its review note draft', async ({
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

  const noteEditor = page.getByRole('textbox', {
    name: 'Note',
    exact: true,
  });

  await noteEditor.fill('Keep this review context.');
  await page.getByRole('link', { name: 'Back to Run History' }).click();

  await expect(
    page.getByRole('heading', { name: 'Discard unsaved note changes?' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Continue editing' }),
  ).toBeFocused();

  await page.getByRole('button', { name: 'Continue editing' }).click();

  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(noteEditor).toHaveValue('Keep this review context.');

  await page.getByRole('link', { name: 'Back to Run History' }).click();
  await page.getByRole('button', { name: 'Discard draft' }).click();

  await expect(page).toHaveURL(/\/runs$/);
  await expect(
    page.getByRole('heading', { name: 'Recent prompt runs' }),
  ).toBeVisible();
});

test('resolves dotted template variables in the Playground', async ({
  page,
}) => {
  const templateName = 'Pull Request Summary';

  await page.goto('/prompts/new');
  await page.getByLabel('Name').fill(templateName);
  await page
    .getByLabel('Description')
    .fill('Turn a pull request title into a review summary.');
  await page
    .getByLabel('System prompt')
    .fill('You summarize pull requests for engineering teams.');
  await page
    .getByLabel('User prompt')
    .fill('Summarize pull request: {{pull_request.title}}');
  await page.getByLabel('Tags').fill('pull-request, summary');
  await page.getByRole('button', { name: 'Create template' }).click();

  const templateCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: templateName }),
  });
  await templateCard
    .getByRole('button', { name: 'Open in Playground' })
    .click();

  await expect(
    page.getByText(/1 template variable is unresolved/),
  ).toContainText('Missing: Pull Request Title.');
  await page
    .getByLabel('Pull Request Title')
    .fill('Keep storage reads resilient');

  await expect(
    page.getByText(/template variable is unresolved/),
  ).toHaveCount(0);

  const userPromptPreview = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'User prompt' }),
  });
  await expect(userPromptPreview).toContainText(
    'Summarize pull request: Keep storage reads resilient',
  );
  await expect(userPromptPreview).not.toContainText('{{pull_request.title}}');
});

test('protects unsaved prompt template changes', async ({ page }) => {
  await page.goto('/prompts/new');
  await page.getByLabel('Name').fill('Work in progress');
  await page.getByRole('button', { name: 'Back to list' }).click();

  await expect(
    page.getByRole('heading', { name: 'Discard unsaved changes?' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Continue editing' }),
  ).toBeFocused();

  await page.getByRole('button', { name: 'Continue editing' }).click();

  await expect(page).toHaveURL(/\/prompts\/new$/);
  await expect(page.getByLabel('Name')).toHaveValue('Work in progress');

  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Discard changes' }).click();

  await expect(page).toHaveURL(/\/prompts$/);
  await expect(
    page.getByRole('heading', { name: 'Manage reusable AI prompts' }),
  ).toBeVisible();
});

test('discloses an unavailable Playground template link', async ({ page }) => {
  await page.goto('/playground?templateId=missing-template');

  await expect(page.getByRole('alert')).toContainText(
    'The requested prompt template is not available in this browser. Showing Code Review Assistant instead.',
  );
  await expect(page.getByLabel('Active template')).toHaveValue(
    'code-review-assistant',
  );
});

test('discloses an unavailable saved-run link', async ({ page }) => {
  await page.goto(
    '/playground?runId=missing-run&templateId=api-design-partner',
  );

  await expect(page.getByRole('alert')).toContainText(
    'The requested prompt snapshot is not available in this browser. Showing API Design Partner instead.',
  );
  await expect(page.getByLabel('Active template')).toHaveValue(
    'api-design-partner',
  );
});

test('explains a missing prompt template detail link', async ({ page }) => {
  await page.goto('/prompts/missing-template');

  await expect(page).toHaveURL(/\/prompts\/missing-template$/);
  await expect(
    page.getByRole('heading', { name: 'Template not found' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Back to Prompt Templates' }),
  ).toHaveAttribute('href', '/prompts');
});

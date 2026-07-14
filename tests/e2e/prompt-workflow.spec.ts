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
  await page.getByRole('button', { name: 'Save prompt snapshot' }).click();

  await expect(page.getByRole('status')).toContainText(
    'Saved a prompt snapshot for Code Review Assistant v1.',
  );

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole('link', { name: 'Open saved run' }).click();

  await expect(page).toHaveURL(/\/runs\/[^/]+$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
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

  await page.getByRole('button', { name: 'Copy full prompt' }).click();

  await expect(page.getByRole('status')).toContainText('Full prompt copied.');
  const historyClipboardText = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );

  expect(historyClipboardText).toContain('dev-ai-toolkit');
  expect(historyClipboardText).toContain('frontend workflow');

  await page.getByLabel('Sort').selectOption('oldest');

  await expect(page).toHaveURL(/\/runs\?order=oldest$/);
  await expect(page.getByLabel('Sort')).toHaveValue('oldest');

  await page.getByLabel('Search runs').fill('frontend workflow');
  await expect(page).toHaveURL(
    /\/runs\?q=frontend\+workflow&order=oldest$/,
  );

  await page.getByRole('link', { name: 'View details' }).click();
  await page.getByRole('link', { name: 'Back to Run History' }).click();

  await expect(page).toHaveURL(
    /\/runs\?q=frontend\+workflow&order=oldest$/,
  );
  await expect(page.getByLabel('Search runs')).toHaveValue('frontend workflow');
  await expect(page.getByLabel('Sort')).toHaveValue('oldest');

  await page.getByRole('link', { name: 'Reopen in Playground' }).click();

  await expect(page).toHaveURL(/\/playground\?.*runId=/);
  await expect(page.getByLabel('Repository Name')).toHaveValue(
    'dev-ai-toolkit',
  );
  await expect(page.getByLabel('Change Scope')).toHaveValue(
    'frontend workflow',
  );
});

test('prefills a new template from a saved prompt snapshot', async ({ page }) => {
  await page.goto('/playground?templateId=code-review-assistant');

  await page.getByLabel('Repository Name').fill('dev-ai-toolkit');
  await page.getByLabel('Change Scope').fill('snapshot reuse');
  await page.getByRole('button', { name: 'Save prompt snapshot' }).click();
  await page.getByRole('link', { name: 'Open saved run' }).click();
  await page
    .getByRole('link', { name: 'Create template from snapshot' })
    .click();

  await expect(page).toHaveURL(/\/create-template\?runId=/);
  await expect(page.getByRole('status')).toContainText(
    'Prefilled from a saved prompt snapshot.',
  );
  await expect(page.getByLabel('Name')).toHaveValue(
    'Code Review Assistant snapshot',
  );
  await expect(page.getByLabel('System prompt')).toContainText(
    'dev-ai-toolkit',
  );
  await expect(page.getByLabel('User prompt')).toContainText('snapshot reuse');
});

test('opens captured run variables in JSON Tools', async ({ page }) => {
  await page.goto('/playground?templateId=code-review-assistant');

  await page.getByLabel('Repository Name').fill('dev-ai-toolkit');
  await page.getByLabel('Change Scope').fill('inspect variables');
  await page.getByRole('button', { name: 'Save prompt snapshot' }).click();
  await page.getByRole('link', { name: 'Open saved run' }).click();
  await page
    .getByRole('link', { name: 'Open variables in JSON Tools' })
    .click();

  await expect(page).toHaveURL(/\/json-tools\?runId=/);
  await expect(page.getByRole('status')).toContainText(
    'Loaded captured variables from Code Review Assistant.',
  );
  await expect(page.getByLabel('JSON input')).toContainText(
    '"repository_name": "dev-ai-toolkit"',
  );
  await expect(page.getByLabel('JSON input')).toContainText(
    '"change_scope": "inspect variables"',
  );

  await page.getByRole('link', { name: 'Back to saved run' }).click();

  await expect(page).toHaveURL(/\/runs\//);
  await expect(
    page.getByRole('heading', { name: 'Code Review Assistant', exact: true }),
  ).toBeVisible();
});

test('compares a saved prompt without exposing prompt text in the URL', async ({
  page,
}) => {
  await page.goto('/playground?templateId=code-review-assistant');

  await page.getByLabel('Repository Name').fill('dev-ai-toolkit');
  await page.getByLabel('Change Scope').fill('private comparison');
  await page.getByRole('button', { name: 'Save prompt snapshot' }).click();
  await page.getByRole('link', { name: 'Open saved run' }).click();
  await page.getByRole('link', { name: 'Compare with source' }).click();

  await expect(page).toHaveURL(/\/prompt-diff\?runId=/);
  const comparisonUrl = new URL(page.url());

  expect(comparisonUrl.searchParams.has('left')).toBe(false);
  expect(comparisonUrl.searchParams.has('right')).toBe(false);
  await expect(page.getByRole('status')).toContainText(
    'Loaded Code Review Assistant v1 from local Run History.',
  );
  await expect(page.getByLabel('Original prompt')).toContainText(
    '{{repository_name}}',
  );
  await expect(page.getByLabel('Revised prompt')).toContainText(
    'dev-ai-toolkit',
  );
});

test('opens a saved prompt in Code Viewer without exposing it in the URL', async ({
  page,
}) => {
  await page.goto('/playground?templateId=code-review-assistant');

  await page.getByLabel('Repository Name').fill('dev-ai-toolkit');
  await page.getByLabel('Change Scope').fill('private saved review');
  await page.getByRole('button', { name: 'Save prompt snapshot' }).click();
  await page.getByRole('link', { name: 'Open saved run' }).click();
  await page
    .getByRole('link', { name: 'Open saved prompts in Code Viewer' })
    .click();

  await expect(page).toHaveURL(/\/code-viewer\?runId=/);
  const codeViewerUrl = new URL(page.url());

  expect(codeViewerUrl.searchParams.has('left')).toBe(false);
  expect(codeViewerUrl.searchParams.has('right')).toBe(false);
  await expect(page.getByRole('status')).toContainText(
    'Loaded saved prompts from Code Review Assistant.',
  );
  await expect(page.getByLabel('Right input')).toContainText(
    'private saved review',
  );
});

test('reviews a composed prompt without exposing prompt text in the URL', async ({
  page,
}) => {
  await page.goto('/playground?templateId=code-review-assistant');

  await page.getByLabel('Repository Name').fill('dev-ai-toolkit');
  await page.getByLabel('Change Scope').fill('private draft comparison');
  await page.getByRole('button', { name: 'Review in Prompt Diff' }).click();

  await expect(page).toHaveURL(/\/prompt-diff$/);
  await expect(page.getByLabel('Original prompt')).toContainText(
    '{{repository_name}}',
  );
  await expect(page.getByLabel('Revised prompt')).toContainText(
    'dev-ai-toolkit',
  );
  await expect(page.getByLabel('Revised prompt')).toContainText(
    'private draft comparison',
  );
});

test('opens a composed prompt in Code Viewer without exposing it in the URL', async ({
  page,
}) => {
  await page.goto('/playground?templateId=code-review-assistant');

  await page.getByLabel('Repository Name').fill('dev-ai-toolkit');
  await page.getByLabel('Change Scope').fill('private code review');
  await page.getByRole('button', { name: 'Open in Code Viewer' }).click();

  await expect(page).toHaveURL(/\/code-viewer$/);
  await expect(page.getByLabel('Left input')).toContainText(
    '{{repository_name}}',
  );
  await expect(page.getByLabel('Right input')).toContainText(
    'dev-ai-toolkit',
  );
  await expect(page.getByLabel('Right input')).toContainText(
    'private code review',
  );
});

test('resolves dotted template variables in the Playground', async ({
  page,
}) => {
  const templateName = 'Pull Request Summary';

  await page.goto('/create-template');
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
  await page.goto('/create-template');
  await page.getByLabel('Name').fill('Work in progress');
  await page.getByRole('button', { name: 'Back to list' }).click();

  await expect(
    page.getByRole('heading', { name: 'Discard unsaved changes?' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Continue editing' }),
  ).toBeFocused();

  await page.getByRole('button', { name: 'Continue editing' }).click();

  await expect(page).toHaveURL(/\/create-template$/);
  await expect(page.getByLabel('Name')).toHaveValue('Work in progress');

  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Discard changes' }).click();

  await expect(page).toHaveURL(/\/prompts$/);
  await expect(
    page.getByRole('heading', { name: 'Manage reusable AI prompts' }),
  ).toBeVisible();
});

test('opens an imported template whose ID is new', async ({ page }) => {
  const templateName = 'Imported New Route Template';

  await page.goto('/prompts');
  await page.getByLabel('Import prompt templates JSON').setInputFiles({
    name: 'new-template.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify([
        {
          id: 'new',
          name: templateName,
          description: 'Verifies the reserved route no longer hides templates.',
          systemPrompt: 'Review the selected change.',
          userPrompt: 'Summarize the result.',
          tags: ['routing'],
        },
      ]),
    ),
  });

  await expect(page.getByRole('status')).toContainText('Imported 1 template');
  const templateCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: templateName }),
  });

  await templateCard.getByRole('button', { name: 'Preview' }).click();

  await expect(page).toHaveURL(/\/prompts\/new$/);
  await expect(
    page.getByRole('heading', { name: templateName, level: 1 }),
  ).toBeVisible();
});

test('preserves template list filters across preview and editing', async ({
  page,
}) => {
  await page.goto('/prompts');
  await page.getByLabel('Search prompt templates').fill('Code Review');
  await page.getByRole('combobox', { name: /^Tag$/ }).selectOption('review');

  await expect(page).toHaveURL(
    /\/prompts\?search=Code\+Review&tag=review$/,
  );

  const templateCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Code Review Assistant' }),
  });

  await templateCard.getByRole('button', { name: 'Preview' }).click();
  await page.getByRole('button', { name: 'Back to list' }).click();

  await expect(page).toHaveURL(
    /\/prompts\?search=Code\+Review&tag=review$/,
  );
  await expect(page.getByLabel('Search prompt templates')).toHaveValue(
    'Code Review',
  );
  await expect(page.getByRole('combobox', { name: /^Tag$/ })).toHaveValue(
    'review',
  );

  await templateCard.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Back to list' }).click();

  await expect(page).toHaveURL(
    /\/prompts\?search=Code\+Review&tag=review$/,
  );
  await expect(page.getByLabel('Search prompt templates')).toHaveValue(
    'Code Review',
  );
  await expect(page.getByRole('combobox', { name: /^Tag$/ })).toHaveValue(
    'review',
  );
});

test('restores a historical template as a new current version', async ({
  page,
}) => {
  await page.goto('/prompts/code-review-assistant/edit');
  await page
    .getByLabel('Description')
    .fill('Updated description for the browser restore flow.');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page).toHaveURL(/\/prompts$/);
  const templateCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Code Review Assistant' }),
  });

  await templateCard.getByRole('button', { name: 'Preview' }).click();

  await expect(page).toHaveURL(/\/prompts\/code-review-assistant$/);
  await expect(page.getByText('Current version v2')).toBeVisible();

  const versionOneCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Version v1' }),
  });

  await versionOneCard
    .getByRole('button', { name: 'Restore as current' })
    .click();

  const restoreDialog = versionOneCard.getByRole('dialog', {
    name: 'Restore version v1?',
  });

  await expect(restoreDialog).toBeVisible();
  await expect(
    restoreDialog.getByRole('button', { name: 'Cancel' }),
  ).toBeFocused();
  await expect(page.getByText('Current version v2')).toBeVisible();

  await restoreDialog
    .getByRole('button', { name: 'Restore version v1' })
    .click();

  await expect(page.getByText('Current version v3')).toBeVisible();
  await expect(
    page.getByText(
      'Review pull request changes with a focus on bugs, risks, and missing test coverage.',
      { exact: true },
    ).first(),
  ).toBeVisible();
});

test('compares a historical template revision with the current version', async ({
  page,
}) => {
  const currentSystemPrompt = 'Current system prompt for browser diff.';

  await page.goto('/prompts/code-review-assistant/edit');
  await page.getByLabel('System prompt').fill(currentSystemPrompt);
  await page.getByRole('button', { name: 'Save changes' }).click();

  const templateCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Code Review Assistant' }),
  });

  await templateCard.getByRole('button', { name: 'Preview' }).click();

  const versionOneCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Version v1' }),
  });

  await versionOneCard
    .getByRole('button', { name: 'Compare version v1 with current' })
    .click();

  await expect(page).toHaveURL(/\/prompt-diff$/);
  await expect(
    page.getByRole('textbox', { name: 'Original prompt' }),
  ).toContainText('Prioritize correctness, regressions, and maintainability.');
  await expect(
    page.getByRole('textbox', { name: 'Revised prompt' }),
  ).toContainText(currentSystemPrompt);
  expect(new URL(page.url()).search).toBe('');
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

test('explains missing prompt template detail and edit links', async ({
  page,
}) => {
  await page.goto('/prompts/missing-template');

  await expect(page).toHaveURL(/\/prompts\/missing-template$/);
  await expect(
    page.getByRole('heading', { name: 'Template not found' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Back to Prompt Templates' }),
  ).toHaveAttribute('href', '/prompts');

  await page.goto('/prompts/missing-template/edit');

  await expect(page).toHaveURL(/\/prompts\/missing-template\/edit$/);
  await expect(
    page.getByRole('heading', { name: 'Template not found' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Back to Prompt Templates' }),
  ).toHaveAttribute('href', '/prompts');
});

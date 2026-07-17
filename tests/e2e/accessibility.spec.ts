import { expect, test } from '@playwright/test';

const pageRoutes = [
  { path: '/', title: 'Overview | dev-ai-toolkit' },
  { path: '/playground', title: 'Prompt Playground | dev-ai-toolkit' },
  { path: '/runs', title: 'Run History | dev-ai-toolkit' },
  { path: '/runs/missing-run', title: 'Prompt Run | dev-ai-toolkit' },
  { path: '/prompts', title: 'Prompt Templates | dev-ai-toolkit' },
  {
    path: '/prompts/missing-template',
    title: 'Prompt Template | dev-ai-toolkit',
  },
  {
    path: '/create-template',
    title: 'Create Prompt Template | dev-ai-toolkit',
  },
  {
    path: '/prompts/missing-template/edit',
    title: 'Edit Prompt Template | dev-ai-toolkit',
  },
  { path: '/json-tools', title: 'JSON Tools | dev-ai-toolkit' },
  { path: '/api-builder', title: 'API Builder | dev-ai-toolkit' },
  { path: '/code-viewer', title: 'Code Viewer | dev-ai-toolkit' },
  { path: '/prompt-diff', title: 'Prompt Diff | dev-ai-toolkit' },
  { path: '/workspace', title: 'Workspace Backup | dev-ai-toolkit' },
  { path: '/missing-page', title: 'Page Not Found | dev-ai-toolkit' },
];

test('labels and skips each application route', async ({ page }) => {
  await page.goto('/');

  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  await page.keyboard.press('Tab');

  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();

  for (const route of pageRoutes) {
    await page.goto(route.path);
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(
      page.getByRole('link', { name: 'Share workflow feedback' }),
    ).toBeVisible();
  }
});

test('loads a lazy route directly without a hydration warning', async ({
  page,
}) => {
  const hydrationWarnings: string[] = [];

  page.on('console', (message) => {
    if (
      message.type() === 'warning' &&
      message.text().includes('No `HydrateFallback` element provided')
    ) {
      hydrationWarnings.push(message.text());
    }
  });

  await page.goto('/runs');

  await expect(page).toHaveTitle('Run History | dev-ai-toolkit');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Review saved prompt snapshots in a local activity history.',
  );
  expect(hydrationWarnings).toEqual([]);
});

test('keeps focus visible and reduces interface motion when requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');

  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  const styles = await skipLink.evaluate((element) => {
    const computedStyle = window.getComputedStyle(element);
    const transitionDurations = computedStyle.transitionDuration
      .split(',')
      .map((duration) => {
        const value = Number.parseFloat(duration);
        return duration.trim().endsWith('ms') ? value : value * 1_000;
      });

    return {
      maxTransitionDuration: Math.max(...transitionDurations),
      outlineStyle: computedStyle.outlineStyle,
      outlineWidth: computedStyle.outlineWidth,
    };
  });

  expect(styles.outlineStyle).toBe('solid');
  expect(styles.outlineWidth).not.toBe('0px');
  expect(styles.maxTransitionDuration).toBeLessThanOrEqual(1);
});

test('keeps prompt template card headings below the page heading', async ({
  page,
}) => {
  await page.goto('/prompts');

  const cards = page.locator('.prompt-card');
  await expect(cards.first()).toBeVisible();
  await expect(cards.getByRole('heading', { level: 2 })).toHaveCount(
    await cards.count(),
  );
  await expect(cards.getByRole('heading', { level: 3 })).toHaveCount(0);
});

test('keeps JSON import actions in the visible keyboard order', async ({
  page,
}) => {
  const routes = [
    { path: '/prompts', importName: 'Import JSON', leadingAction: null },
    { path: '/runs', importName: 'Import run JSON', leadingAction: null },
    {
      path: '/workspace',
      importName: 'Import workspace JSON',
      leadingAction: 'Export workspace JSON',
    },
  ];

  for (const route of routes) {
    await page.goto(route.path);
    await page.getByRole('link', { name: 'Backup' }).focus();
    await page.keyboard.press('Tab');

    if (route.leadingAction) {
      await expect(
        page.getByRole('button', { name: route.leadingAction }),
      ).toBeFocused();
      await page.keyboard.press('Tab');
    }

    const importButton = page.getByRole('button', {
      name: route.importName,
    });

    await expect(importButton).toBeVisible();
    await expect(importButton).toBeFocused();

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.keyboard.press('Enter');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([]);
  }
});

import { expect, test } from '@playwright/test';

const pageRoutes = [
  '/',
  '/playground',
  '/runs',
  '/runs/missing-run',
  '/prompts',
  '/prompts/missing-template',
  '/create-template',
  '/prompts/missing-template/edit',
  '/json-tools',
  '/api-builder',
  '/code-viewer',
  '/prompt-diff',
  '/workspace',
  '/missing-page',
];

test('skips navigation and exposes one page heading per route', async ({ page }) => {
  await page.goto('/');

  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  await page.keyboard.press('Tab');

  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();

  for (const route of pageRoutes) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(
      page.getByRole('link', { name: 'Share workflow feedback' }),
    ).toBeVisible();
  }
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

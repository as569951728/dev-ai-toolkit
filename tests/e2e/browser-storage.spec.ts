import { expect, test } from '@playwright/test';

test('keeps the app usable when browser storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Access denied.', 'SecurityError');
      },
    });
  });

  await page.goto('/');

  await expect(
    page.getByRole('alert').filter({ hasText: 'Browser storage is unavailable.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /A local-first workspace for prompt work/i,
    }),
  ).toBeVisible();
});

test('downloads and resets unreadable local workspace data', async ({ page }) => {
  const storageKey = 'dev-ai-toolkit.prompt-templates';

  await page.goto('/');
  await page.evaluate((key) => {
    window.localStorage.setItem(key, '{not-json');
  }, storageKey);
  await page.reload();

  const recoveryAlert = page.getByRole('alert').filter({
    hasText: 'Some local workspace data could not be read.',
  });

  await expect(recoveryAlert).toBeVisible();
  await expect(recoveryAlert.getByText('Prompt templates')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await recoveryAlert
    .getByRole('button', { name: 'Download unreadable data' })
    .click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(
    /^dev-ai-toolkit-unreadable-local-data-\d{4}-\d{2}-\d{2}\.json$/,
  );

  await recoveryAlert
    .getByRole('button', { name: 'Reset affected data' })
    .click();

  const resetDialog = page.getByRole('dialog', {
    name: 'Reset unreadable local data?',
  });

  await expect(resetDialog).toBeVisible();
  await expect(
    resetDialog.getByRole('button', { name: 'Keep current data' }),
  ).toBeFocused();

  await resetDialog.getByRole('button', { name: 'Reset and reload' }).click();

  await expect(recoveryAlert).not.toBeVisible();
  await expect
    .poll(() => page.evaluate((key) => window.localStorage.getItem(key), storageKey))
    .toBeNull();
});

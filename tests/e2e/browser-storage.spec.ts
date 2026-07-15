import { expect, test } from '@playwright/test';

test('opens legacy local workspace collections without migration', async ({
  page,
}) => {
  const template = {
    id: 'legacy-release-template',
    name: 'Legacy Release Checklist',
    description: 'Verify a release created with the earlier storage format.',
    systemPrompt: 'You are a careful release reviewer.',
    userPrompt: 'Review the release notes for {{version}}.',
    tags: ['release'],
    version: 1,
    revisions: [
      {
        version: 1,
        updatedAt: '2026-05-01T08:00:00.000Z',
        name: 'Legacy Release Checklist',
        description: 'Verify a release created with the earlier storage format.',
        systemPrompt: 'You are a careful release reviewer.',
        userPrompt: 'Review the release notes for {{version}}.',
        tags: ['release'],
      },
    ],
    archivedAt: null,
    updatedAt: '2026-05-01T08:00:00.000Z',
  };
  const run = {
    id: 'legacy-release-run',
    templateId: template.id,
    templateName: template.name,
    templateVersion: 1,
    variables: { version: 'v0.1.0' },
    systemPrompt: template.systemPrompt,
    userPrompt: 'Review the release notes for v0.1.0.',
    createdAt: '2026-05-01T09:00:00.000Z',
  };

  await page.addInitScript(
    ({ legacyRun, legacyTemplate }) => {
      window.localStorage.setItem(
        'dev-ai-toolkit.prompt-templates',
        JSON.stringify([legacyTemplate]),
      );
      window.localStorage.setItem(
        'dev-ai-toolkit.prompt-runs',
        JSON.stringify([legacyRun]),
      );
    },
    { legacyRun: run, legacyTemplate: template },
  );

  await page.goto('/prompts');

  await expect(
    page.getByRole('heading', { level: 3, name: template.name }),
  ).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);

  await page.goto('/runs');

  await expect(
    page.getByRole('heading', { level: 3, name: template.name }),
  ).toBeVisible();
  await expect(page.getByText('version: v0.1.0')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

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

test('rolls back a partial unreadable storage reset', async ({ page }) => {
  const storageValues = {
    'dev-ai-toolkit.prompt-runs': '{broken-runs',
    'dev-ai-toolkit.prompt-templates': '{broken-templates',
  };

  await page.goto('/');
  await page.evaluate((values) => {
    Object.entries(values).forEach(([key, value]) => {
      window.localStorage.setItem(key, value);
    });
  }, storageValues);
  await page.reload();

  const recoveryAlert = page.getByRole('alert').filter({
    hasText: 'Some local workspace data could not be read.',
  });

  await expect(recoveryAlert).toContainText('Prompt templates');
  await expect(recoveryAlert).toContainText('Prompt runs');

  await page.evaluate((affectedKeys) => {
    const removeItem = Storage.prototype.removeItem;
    let affectedRemovalCount = 0;

    Storage.prototype.removeItem = function removeWithSecondFailure(key) {
      if (affectedKeys.includes(key)) {
        affectedRemovalCount += 1;

        if (affectedRemovalCount === 2) {
          throw new DOMException('Storage unavailable', 'SecurityError');
        }
      }

      removeItem.call(this, key);
    };
  }, Object.keys(storageValues));

  await recoveryAlert
    .getByRole('button', { name: 'Reset affected data' })
    .click();
  await page
    .getByRole('dialog', { name: 'Reset unreadable local data?' })
    .getByRole('button', { name: 'Reset and reload' })
    .click();

  await expect(recoveryAlert).toContainText(
    'The unreadable browser data could not be fully reset. It remains available for download in this session.',
  );
  await expect
    .poll(() =>
      page.evaluate((keys) => {
        return Object.fromEntries(
          keys.map((key) => [key, window.localStorage.getItem(key)]),
        );
      }, Object.keys(storageValues)),
    )
    .toEqual(storageValues);
});

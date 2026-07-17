import { expect, test } from '@playwright/test';

test('keeps the first workflow action inside common initial viewports', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 375, height: 812 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const primaryAction = page.getByRole('link', {
      name: 'Open Code Review Assistant',
    });
    const actionBox = await primaryAction.boundingBox();
    const documentWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );

    expect(actionBox).not.toBeNull();
    expect(actionBox!.y + actionBox!.height).toBeLessThanOrEqual(
      viewport.height,
    );
    expect(documentWidth).toBeLessThanOrEqual(viewport.width);
  }
});

test('keeps every navigation destination available from the phone menu', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  const navigation = page.getByRole('navigation', { name: 'Primary' });
  const openButton = page.getByRole('button', { name: 'Open navigation' });

  await expect(navigation).toBeHidden();
  await expect(openButton).toHaveAttribute('aria-expanded', 'false');

  await openButton.focus();
  await page.keyboard.press('Enter');

  await expect(navigation).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Close navigation' }),
  ).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation.getByRole('link')).toHaveCount(9);

  await navigation.getByRole('link', { name: 'Prompt Templates' }).focus();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/prompts$/);
  await expect(navigation).toBeHidden();
  await expect(page.locator('#main-content')).toBeFocused();
  await expect(
    page.getByRole('button', { name: 'Open navigation' }),
  ).toHaveAttribute('aria-expanded', 'false');
});

test('keeps the prompt playground inside a tablet viewport', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/playground');

  const documentWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );

  expect(documentWidth).toBeLessThanOrEqual(768);
});

test('wraps long prompt values without widening the page', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/playground');
  await page.getByLabel('Repository Name').fill('a'.repeat(2000));

  const documentWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );

  expect(documentWidth).toBeLessThanOrEqual(375);
  await expect(page.locator('.prompt-text-output')).toHaveCount(2);
});

test('keeps long saved run content usable at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/playground');
  await page.getByLabel('Repository Name').fill('a'.repeat(2000));
  await page.getByLabel('Change Scope').fill('frontend');
  await page.getByRole('button', { name: 'Save prompt snapshot' }).click();
  await page.getByRole('link', { name: 'Open saved run' }).click();

  const documentWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  const promptBlocks = page.locator('.code-block');

  expect(documentWidth).toBeLessThanOrEqual(375);
  await expect(page.locator('.run-input-value')).toHaveCount(2);
  await expect(promptBlocks).toHaveCount(2);

  for (const promptBlock of await promptBlocks.all()) {
    await promptBlock.focus();
    await expect(promptBlock).toBeFocused();
  }
});

test('keeps workflow feedback available inside a mobile viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/playground');

  const feedbackLink = page.getByRole('link', {
    name: 'Share workflow feedback',
  });

  await expect(feedbackLink).toBeVisible();
  await expect(feedbackLink).toHaveAttribute(
    'href',
    'https://github.com/as569951728/dev-ai-toolkit/issues/new?template=usage_feedback.yml',
  );

  const documentWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );

  expect(documentWidth).toBeLessThanOrEqual(375);
});

test('keeps the saved prompt workflow usable at phone width', async ({
  page,
}) => {
  const expectNoHorizontalOverflow = async () => {
    const documentWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );

    expect(documentWidth).toBeLessThanOrEqual(375);
  };

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/playground?templateId=code-review-assistant');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Turn reusable templates into ready-to-run prompts',
    }),
  ).toBeVisible();
  await expectNoHorizontalOverflow();

  await page.getByLabel('Repository Name').fill('dev-ai-toolkit');
  await page.getByLabel('Change Scope').fill('mobile workflow');
  await page.getByRole('button', { name: 'Save prompt snapshot' }).click();
  await page.getByRole('link', { name: 'Open saved run' }).click();

  await expect(
    page.getByRole('heading', { level: 1, name: 'Code Review Assistant' }),
  ).toBeVisible();
  await expectNoHorizontalOverflow();
  await page.getByRole('link', { name: 'Reopen in Playground' }).click();

  await expect(page.getByLabel('Repository Name')).toHaveValue(
    'dev-ai-toolkit',
  );
  await expect(page.getByLabel('Change Scope')).toHaveValue(
    'mobile workflow',
  );
  await expectNoHorizontalOverflow();
});

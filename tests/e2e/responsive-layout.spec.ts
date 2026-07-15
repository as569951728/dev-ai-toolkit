import { expect, test } from '@playwright/test';

test('keeps the prompt playground inside a tablet viewport', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/playground');

  const documentWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );

  expect(documentWidth).toBeLessThanOrEqual(768);
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

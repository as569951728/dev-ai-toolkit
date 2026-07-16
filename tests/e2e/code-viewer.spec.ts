import { expect, test } from '@playwright/test';

function parseRgb(value: string) {
  const channels = value.match(/\d+(?:\.\d+)?/g)?.map(Number);

  if (!channels || channels.length < 3) {
    throw new Error(`Expected an RGB color, received: ${value}`);
  }

  return channels.slice(0, 3).map((channel) => channel / 255);
}

function getRelativeLuminance(value: string) {
  const [red, green, blue] = parseRgb(value).map((channel) =>
    channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function getContrastRatio(foreground: string, background: string) {
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

test('clears legacy content parameters after loading them', async ({ page }) => {
  await page.goto(
    '/code-viewer?left=private-legacy-left&right=private-legacy-right&mode=compare&language=markdown',
  );

  await expect(page).toHaveURL(/\/code-viewer$/);
  await expect(page.getByLabel('Left input')).toHaveValue(
    'private-legacy-left',
  );
  await expect(page.getByLabel('Right input')).toHaveValue(
    'private-legacy-right',
  );

  await page.reload();

  await expect(page).toHaveURL(/\/code-viewer$/);
  await expect(page.getByLabel('Left input')).toHaveValue(
    'private-legacy-left',
  );
  await expect(page.getByLabel('Right input')).toHaveValue(
    'private-legacy-right',
  );
});

test('keeps line numbers above the minimum text contrast ratio', async ({
  page,
}) => {
  await page.goto('/code-viewer');

  const colors = await page
    .locator('.code-block__line-number')
    .first()
    .evaluate((lineNumber) => {
      const codeBlock = lineNumber.closest('.code-block');

      if (!codeBlock) {
        throw new Error('Expected the line number to be inside a code block.');
      }

      return {
        background: window.getComputedStyle(codeBlock).backgroundColor,
        foreground: window.getComputedStyle(lineNumber).color,
      };
    });

  expect(
    getContrastRatio(colors.foreground, colors.background),
  ).toBeGreaterThanOrEqual(4.5);
});

test('does not render phantom line numbers for empty previews', async ({
  page,
}) => {
  await page.goto('/code-viewer');
  await page.getByRole('button', { name: 'Reset' }).click();

  await expect(page.locator('.code-block__line')).toHaveCount(0);
  await expect(page.getByText('No content yet.')).toHaveCount(2);
  await expect(
    page.locator('.metric-card').filter({ hasText: 'Left pane' }),
  ).toContainText('0 lines');
});

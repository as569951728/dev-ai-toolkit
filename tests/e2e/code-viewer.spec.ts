import { expect, test } from '@playwright/test';

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
});

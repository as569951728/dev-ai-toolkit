import { expect, test } from '@playwright/test';

test('uses Chinese for a first visit from a Chinese browser', async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: 'zh-CN' });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4173/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: '用于 Prompt 工作和小型开发工具的本地优先工作台。',
    }),
  ).toBeVisible();
  await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible();

  await context.close();
});

test('remembers an explicit language choice after reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '中文' }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('link', { name: '管理 Prompt 模板' })).toBeVisible();

  await page.reload();

  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible();
});

test('keeps the Chinese landing page inside a phone viewport', async ({
  browser,
}) => {
  const context = await browser.newContext({
    locale: 'zh-CN',
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4173/');

  const documentWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );

  expect(documentWidth).toBeLessThanOrEqual(375);
  await expect(page.getByRole('button', { name: '打开导航' })).toBeVisible();

  await context.close();
});

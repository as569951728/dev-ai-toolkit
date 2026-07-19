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

test('completes the template-to-snapshot path in Chinese', async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: 'zh-CN' });
  const page = await context.newPage();

  await page.goto(
    'http://127.0.0.1:4173/playground?templateId=code-review-assistant',
  );

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: '把可复用模板组合成可以直接使用的 Prompt',
    }),
  ).toBeVisible();
  await page.getByLabel('Repository Name').fill('dev-ai-toolkit');
  await page.getByLabel('Change Scope').fill('中文界面');
  await page.getByRole('button', { name: '保存 Prompt 快照' }).click();

  await expect(page.getByText(/已保存 Code Review Assistant v\d+ 的 Prompt 快照/)).toBeVisible();
  await expect(
    page.getByRole('link', { name: '打开已保存记录' }),
  ).toBeVisible();
  await page.getByRole('link', { name: '打开已保存记录' }).click();

  await expect(
    page.getByRole('heading', { level: 2, name: '已保存的 Prompt' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: '复盘备注' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: '快照管理' }),
  ).toBeVisible();
  await page.getByRole('link', { name: '返回运行记录' }).click();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: '复盘保存在本地的 Prompt 快照',
    }),
  ).toBeVisible();

  await page.goto('http://127.0.0.1:4173/prompts');
  await expect(
    page.getByRole('heading', { level: 1, name: '管理可复用的 AI Prompt' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: '新建模板' })).toBeVisible();

  await context.close();
});

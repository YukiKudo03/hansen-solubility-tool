/**
 * E2Eテスト: Teasプロットフロー
 */
import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import { launchApp, clickTab } from './helpers';

let app: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  ({ app, page } = await launchApp());
});

test.afterAll(async () => {
  await app.close();
});

test('Teasプロットタブに切り替え', async () => {
  await clickTab(page, 'Teasプロット');
  await page.waitForTimeout(500);
  await expect(page.getByText('Teasプロット')).toBeVisible();
});

test('ビューがエラーなく表示される', async () => {
  const errorElements = page.locator('[role="alert"]');
  const errorCount = await errorElements.count();
  expect(errorCount).toBe(0);
});

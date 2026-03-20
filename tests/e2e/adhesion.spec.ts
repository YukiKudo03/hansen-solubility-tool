/**
 * E2Eテスト: 接着性予測フロー
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

test('接着性予測タブに切り替え', async () => {
  await clickTab(page, '接着性予測');
  await page.waitForTimeout(500);
  await expect(page.getByText('接着性予測')).toBeVisible();
});

test('ビューがエラーなく表示される', async () => {
  // エラーメッセージが表示されていないことを確認
  const errorElements = page.locator('[role="alert"]');
  const errorCount = await errorElements.count();
  expect(errorCount).toBe(0);
});

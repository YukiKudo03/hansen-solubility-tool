/**
 * E2Eテスト: 多目的選定フロー
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

test('多目的選定タブに切り替え', async () => {
  await clickTab(page, '多目的選定');
  await page.waitForTimeout(500);
  await expect(page.getByText('多目的選定')).toBeVisible();
});

test('ビューがエラーなく表示される', async () => {
  const errorElements = page.locator('[role="alert"]');
  const errorCount = await errorElements.count();
  expect(errorCount).toBe(0);
});

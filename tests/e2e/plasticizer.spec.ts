/**
 * E2Eテスト: 可塑剤選定フロー
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

test('可塑剤選定タブに切り替え', async () => {
  await clickTab(page, '可塑剤選定');
  await page.waitForTimeout(500);
});

test('部品グループを選択できる', async () => {
  const select = page.locator('main select').first();
  await select.selectOption({ index: 1 });
  await page.waitForTimeout(500);
});

test('部品を選択できる', async () => {
  // 2番目のselectが部品セレクタ
  const partSelect = page.locator('main select').nth(1);
  await partSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);
});

test('可塑剤スクリーニングを実行できる', async () => {
  await page.locator('main button.bg-blue-600').click();
  await page.waitForTimeout(2000);

  await expect(page.locator('th', { hasText: 'RED' })).toBeVisible({ timeout: 10000 });
});

test('結果テーブルに相溶性バッジが表示される', async () => {
  const badges = page.locator('.rounded-full');
  const badgeCount = await badges.count();
  expect(badgeCount).toBeGreaterThan(0);
});

test('CSV出力ボタンが表示される', async () => {
  await expect(page.locator('main button', { hasText: 'CSV出力' })).toBeVisible();
});

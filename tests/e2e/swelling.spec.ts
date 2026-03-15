/**
 * E2Eテスト: 膨潤度予測フロー
 */
import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import { launchApp } from './helpers';

let app: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  ({ app, page } = await launchApp());
});

test.afterAll(async () => {
  await app.close();
});

test('膨潤度予測タブに切り替え', async () => {
  await page.locator('nav button', { hasText: '膨潤度予測' }).click();
  await page.waitForTimeout(500);
  await expect(page.getByText('部品グループ')).toBeVisible();
});

test('部品グループを選択できる', async () => {
  const select = page.locator('main select').first();
  await select.selectOption({ index: 1 });
  await page.waitForTimeout(500);
});

test('溶媒を検索して選択できる', async () => {
  const input = page.getByPlaceholder(/溶媒名/);
  await input.fill('トルエン');
  await page.waitForTimeout(500);
  await page.getByText('トルエン').first().click();
  await page.waitForTimeout(300);
});

test('膨潤度予測を実行できる', async () => {
  await page.locator('main button.bg-blue-600').click();
  await page.waitForTimeout(2000);

  // 結果テーブルが表示される
  await expect(page.locator('th', { hasText: 'RED' })).toBeVisible({ timeout: 10000 });
});

test('結果テーブルに膨潤度バッジが表示される', async () => {
  const badges = page.locator('.rounded-full');
  const badgeCount = await badges.count();
  expect(badgeCount).toBeGreaterThan(0);
});

test('CSV出力ボタンが表示される', async () => {
  await expect(page.locator('main button', { hasText: 'CSV出力' })).toBeVisible();
});

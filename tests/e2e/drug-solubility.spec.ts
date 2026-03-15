/**
 * E2Eテスト: 薬物溶解性予測フロー
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

test('薬物溶解性タブに切り替え', async () => {
  await page.locator('nav button', { hasText: '薬物溶解性' }).click();
  await page.waitForTimeout(500);
});

test('薬物を選択できる', async () => {
  const select = page.locator('main select').first();
  await select.selectOption({ index: 1 });
  await page.waitForTimeout(500);
});

test('全溶媒スクリーニングを実行できる', async () => {
  await page.locator('main button.bg-blue-600').first().click();
  await page.waitForTimeout(2000);

  // 結果テーブルが表示される
  await expect(page.locator('th', { hasText: 'RED' })).toBeVisible({ timeout: 10000 });
});

test('結果テーブルに溶解性バッジが表示される', async () => {
  const badges = page.locator('.rounded-full');
  const badgeCount = await badges.count();
  expect(badgeCount).toBeGreaterThan(0);
});

test('CSV出力ボタンが表示される', async () => {
  await expect(page.locator('main button', { hasText: 'CSV出力' })).toBeVisible();
});

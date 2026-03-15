/**
 * E2Eテスト: 塗膜耐薬品性予測フロー
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

test('耐薬品性予測タブに切り替え', async () => {
  await clickTab(page, '耐薬品性予測');
  await page.waitForTimeout(500);
  await expect(page.getByText('部品グループ')).toBeVisible();
});

test('コーティンググループを選択できる', async () => {
  // コーティング材料グループを選択
  const select = page.locator('main select').first();
  const options = select.locator('option');
  const count = await options.count();
  // コーティング材料のインデックスを探す
  for (let i = 1; i < count; i++) {
    const text = await options.nth(i).textContent();
    if (text?.includes('コーティング')) {
      await select.selectOption({ index: i });
      break;
    }
  }
  await page.waitForTimeout(500);
});

test('溶媒を選択して耐薬品性予測を実行できる', async () => {
  const input = page.getByPlaceholder(/溶媒名/);
  await input.fill('アセトン');
  await page.waitForTimeout(500);
  await page.getByText('アセトン').first().click();
  await page.waitForTimeout(300);

  await page.locator('main button.bg-blue-600').click();
  await page.waitForTimeout(2000);

  await expect(page.locator('th', { hasText: 'RED' })).toBeVisible({ timeout: 10000 });
});

test('結果テーブルに耐薬品性バッジが表示される', async () => {
  const badges = page.locator('.rounded-full');
  const badgeCount = await badges.count();
  expect(badgeCount).toBeGreaterThan(0);
});

test('CSV出力ボタンが表示される', async () => {
  await expect(page.locator('main button', { hasText: 'CSV出力' })).toBeVisible();
});

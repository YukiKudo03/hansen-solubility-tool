/**
 * E2Eテスト: 溶剤ブレンド最適化フロー
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

test('溶剤ブレンド最適化タブに切り替え', async () => {
  await page.locator('nav button', { hasText: '溶剤ブレンド最適化' }).click();
  await page.waitForTimeout(500);
  await expect(page.getByText('ターゲットHSP')).toBeVisible();
});

test('ターゲットHSP値を入力できる', async () => {
  const inputs = page.locator('main input[type="number"]');
  // δD, δP, δH inputs
  await inputs.nth(0).fill('17.0');
  await inputs.nth(1).fill('5.0');
  await inputs.nth(2).fill('10.0');
  await page.waitForTimeout(300);
});

test('候補溶媒を選択できる', async () => {
  // チェックボックスで溶媒を選択
  const checkboxes = page.locator('main input[type="checkbox"]');
  const count = await checkboxes.count();
  expect(count).toBeGreaterThan(0);

  // 最初の3つを選択
  for (let i = 0; i < Math.min(3, count); i++) {
    await checkboxes.nth(i).check();
  }
});

test('ブレンド最適化を実行できる', async () => {
  await page.locator('main button.bg-blue-600').click();
  await page.waitForTimeout(3000);

  // 結果テーブルが表示される
  await expect(page.locator('th', { hasText: 'Ra' })).toBeVisible({ timeout: 10000 });
});

test('結果テーブルに順位と組成が表示される', async () => {
  // 結果行が存在する
  const rows = page.locator('main table tbody tr');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);
});

test('CSV出力ボタンが表示される', async () => {
  await expect(page.locator('main button', { hasText: 'CSV出力' })).toBeVisible();
});

/**
 * E2Eテスト: 混合溶媒作成
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

test('混合溶媒タブに切り替え', async () => {
  await page.getByText('混合溶媒').click();
  await expect(page.getByText('混合溶媒の作成')).toBeVisible();
});

test('初期状態で2行の成分入力欄がある', async () => {
  const inputs = page.getByPlaceholder('溶媒を検索...');
  await expect(inputs).toHaveCount(2);
});

test('溶媒を検索して選択し計算結果が表示される', async () => {
  const inputs = page.getByPlaceholder('溶媒を検索...');

  // 1行目: トルエン選択
  await inputs.nth(0).fill('トルエン');
  await page.waitForTimeout(500);
  await page.getByText(/^トルエン/).first().click();

  // 2行目: アセトン選択
  await inputs.nth(1).fill('アセトン');
  await page.waitForTimeout(500);
  await page.getByText(/^アセトン/).first().click();

  // 計算結果が表示される
  await expect(page.getByText('混合予測結果')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/δD:/)).toBeVisible();
  await expect(page.getByText(/δP:/)).toBeVisible();
  await expect(page.getByText(/δH:/)).toBeVisible();

  // 組成情報
  await expect(page.getByText(/混合溶媒:/)).toBeVisible();

  // DB登録ボタン
  await expect(page.getByText('データベースに登録')).toBeVisible();
});

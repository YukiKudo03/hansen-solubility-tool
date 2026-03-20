/**
 * E2Eテスト: 族寄与法フロー
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

test('族寄与法タブに切り替え', async () => {
  await clickTab(page, '族寄与法');
  await page.waitForTimeout(500);
  await expect(page.getByText('族寄与法によるHSP推定')).toBeVisible();
});

test('ビューがエラーなく表示される', async () => {
  const errorElements = page.locator('[role="alert"]');
  const errorCount = await errorElements.count();
  expect(errorCount).toBe(0);
});

test('第1次グループが表示される', async () => {
  await expect(page.getByText('第1次グループ')).toBeVisible();
  // グループテーブルが表示される
  const rows = page.locator('main table tbody tr');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);
});

test('+ボタンでグループカウントが増える', async () => {
  // 最初のグループの+ボタンをクリック
  const plusButtons = page.locator('main table button', { hasText: '+' });
  await plusButtons.first().click();
  await page.waitForTimeout(300);

  // 選択中のグループサマリーが表示される
  await expect(page.getByText('選択中のグループ')).toBeVisible();
});

test('HSP推定ボタンが有効になり実行できる', async () => {
  const estimateButton = page.getByRole('button', { name: 'HSP推定' });
  await expect(estimateButton).toBeEnabled();

  await estimateButton.click();
  await page.waitForTimeout(2000);

  // 推定結果が表示される
  await expect(page.getByText('推定結果')).toBeVisible({ timeout: 5000 });
  // δD, δP, δH の値が表示される
  await expect(page.getByText('δD (MPa½)')).toBeVisible();
  await expect(page.getByText('δP (MPa½)')).toBeVisible();
  await expect(page.getByText('δH (MPa½)')).toBeVisible();
});

test('信頼度が表示される', async () => {
  await expect(page.getByText('信頼度')).toBeVisible();
});

test('全解除でカウントがリセットされる', async () => {
  await page.getByRole('button', { name: '全解除' }).click();
  await page.waitForTimeout(300);

  // 選択中のグループサマリーが消える
  await expect(page.getByText('選択中のグループ')).not.toBeVisible();
  // HSP推定ボタンがdisabledに戻る
  await expect(page.getByRole('button', { name: 'HSP推定' })).toBeDisabled();
});

/**
 * E2Eテスト: グリーン溶媒代替フロー
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

test('グリーン溶媒タブに切り替え', async () => {
  await clickTab(page, 'グリーン溶媒');
  await page.waitForTimeout(500);
  await expect(page.getByText('グリーン溶媒代替提案')).toBeVisible();
});

test('ビューがエラーなく表示される', async () => {
  const errorElements = page.locator('[role="alert"]');
  const errorCount = await errorElements.count();
  expect(errorCount).toBe(0);
});

test('溶媒を検索して選択できる', async () => {
  const input = page.getByPlaceholder(/溶媒名/);
  await input.fill('トルエン');
  await page.waitForTimeout(500);
  await page.getByText('トルエン').first().click();
  await expect(page.getByText('変更')).toBeVisible();
});

test('代替溶媒を検索して結果テーブルが表示される', async () => {
  await page.getByText('代替溶媒を検索').click();
  await page.waitForTimeout(2000);

  // 結果テーブルまたは空メッセージが表示される
  const hasResults = await page.locator('main table tbody tr').count() > 0;
  const hasEmpty = await page.getByText('代替候補が見つかりませんでした。').isVisible().catch(() => false);
  expect(hasResults || hasEmpty).toBe(true);
});

test('結果がある場合CSV出力ボタンが表示される', async () => {
  const hasResults = await page.locator('main table tbody tr').count() > 0;
  if (hasResults) {
    await expect(page.getByText('CSV出力')).toBeVisible();
  }
});

test('カラムヘッダクリックでソートが切り替わる', async () => {
  const hasResults = await page.locator('main table tbody tr').count() > 0;
  if (hasResults) {
    // 溶媒名ヘッダをクリック
    await page.getByText('溶媒名').first().click();
    await page.waitForTimeout(300);
    // テーブルが引き続き表示される
    const rowCount = await page.locator('main table tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
  }
});

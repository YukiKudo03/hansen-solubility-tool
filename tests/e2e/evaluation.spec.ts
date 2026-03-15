/**
 * E2Eテスト: 溶解性評価フロー
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

test('アプリが起動しタイトルが表示される', async () => {
  const title = await page.title();
  expect(title).toContain('Hansen');
});

test('「溶解性評価」タブが初期表示', async () => {
  await expect(page.getByText('評価条件')).toBeVisible();
});

test('部品グループをselectで選択できる', async () => {
  const select = page.locator('select');
  await select.selectOption({ index: 1 });
  await expect(page.getByText(/含まれる部品:/)).toBeVisible();
});

test('溶媒を検索して選択できる', async () => {
  const input = page.getByPlaceholder(/溶媒名/);
  await input.fill('トルエン');
  await page.waitForTimeout(500);
  await page.getByText('トルエン').first().click();
  await expect(page.getByText('変更')).toBeVisible();
});

test('評価実行で結果テーブルが表示される', async () => {
  await page.getByText('評価実行').click();
  await expect(page.getByText(/評価結果/)).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/Level \d/).first()).toBeVisible();
});

test('CSV出力ボタンが表示される', async () => {
  await expect(page.getByText('CSV出力')).toBeVisible();
});

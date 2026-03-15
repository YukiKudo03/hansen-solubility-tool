/**
 * E2Eテスト: データベース編集
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

test('データベース編集タブに切り替え', async () => {
  await page.getByText('データベース編集').click();
  await expect(page.getByText('部品グループ')).toBeVisible();
});

test('部品グループ一覧が表示される', async () => {
  await expect(page.getByText('汎用プラスチック')).toBeVisible();
});

test('溶媒タブに切り替えで溶媒テーブルが表示される', async () => {
  await page.locator('button', { hasText: '溶媒' }).click();
  await expect(page.getByText(/件の溶媒/)).toBeVisible();
});

test('溶媒検索が動作する', async () => {
  const searchInput = page.getByPlaceholder('溶媒を検索...');
  await searchInput.fill('トルエン');
  await page.waitForTimeout(500);
  await expect(page.getByText('Toluene')).toBeVisible();
});

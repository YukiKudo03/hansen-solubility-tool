/**
 * E2Eテスト: 設定画面
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

test('設定タブに切り替え', async () => {
  await page.getByText('設定').click();
  await expect(page.getByText('リスク判定閾値設定')).toBeVisible();
});

test('判定基準の図解が表示される', async () => {
  await expect(page.getByText('判定基準の図解')).toBeVisible();
});

test('デフォルトに戻すで値がリセットされる', async () => {
  await page.getByText('デフォルトに戻す').click();
  const inputs = page.locator('input[type="number"]');
  await expect(inputs.nth(0)).toHaveValue('0.5');
  await expect(inputs.nth(1)).toHaveValue('0.8');
  await expect(inputs.nth(2)).toHaveValue('1.2');
  await expect(inputs.nth(3)).toHaveValue('2');
});

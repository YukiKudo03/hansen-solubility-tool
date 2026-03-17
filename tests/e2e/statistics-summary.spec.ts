/**
 * E2Eテスト: 各評価タブの統計サマリーカード検証
 *
 * 評価実行後に表示される統計サマリー（評価数, 最良値, 最適対象）を
 * 各タブで検証する。Contact Angle / Nano Dispersion は既存テストでカバー済み。
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

test.describe('薬物溶解性 — 統計サマリー', () => {
  test('スクリーニング後に統計サマリーが表示される', async () => {
    await clickTab(page, '薬物溶解性');
    await page.waitForTimeout(500);

    // スクリーニングモードに切替
    await page.locator('main button', { hasText: '全溶媒スクリーニング' }).click();
    await page.waitForTimeout(300);

    // 薬物選択
    const drugSelect = page.locator('main select').first();
    await drugSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // 実行（スクリーニングモードのボタンテキストも「全溶媒スクリーニング」）
    await page.locator('main button.bg-blue-600').click();
    await page.waitForTimeout(3000);

    // 統計サマリーカード
    await expect(page.getByText('評価溶媒数')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/最小RED値/)).toBeVisible();
    await expect(page.getByText('最適溶媒')).toBeVisible();
  });
});

test.describe('キャリア選定 — 統計サマリー', () => {
  test('スクリーニング後に統計サマリーが表示される', async () => {
    await clickTab(page, 'キャリア選定');
    await page.waitForTimeout(500);

    // スクリーニングモードに切替
    await page.locator('main button', { hasText: 'グループスクリーニング' }).click();
    await page.waitForTimeout(300);

    // 薬物選択
    const drugSelect = page.locator('main select').first();
    await drugSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // キャリアグループ選択
    const groupSelect = page.locator('main select').nth(1);
    await groupSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // スクリーニング実行
    await page.locator('main button.bg-blue-600').click();
    await page.waitForTimeout(3000);

    // 統計サマリーカード
    await expect(page.getByText('評価キャリア数')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/最小RED値/)).toBeVisible();
    await expect(page.getByText('最適キャリア')).toBeVisible();
  });
});

test.describe('溶解性評価 — 結果テーブルソート', () => {
  test('評価実行後にREDカラムでソートできる', async () => {
    await clickTab(page, '溶解性評価');
    await page.waitForTimeout(500);

    // グループ選択
    const select = page.locator('main select').first();
    await select.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // 溶媒選択
    const input = page.getByPlaceholder(/溶媒名/);
    await input.fill('トルエン');
    await page.waitForTimeout(500);
    await page.getByText('トルエン').first().click();
    await page.waitForTimeout(300);

    // 評価実行
    await page.locator('main button.bg-blue-600').click();
    await page.waitForTimeout(2000);

    // REDカラムでソート
    await page.locator('th', { hasText: 'RED' }).click();
    await page.waitForTimeout(300);

    const sortIndicator = page.locator('th', { hasText: /RED.*[▲▼]/ });
    await expect(sortIndicator).toBeVisible();

    // 逆順ソート
    await page.locator('th', { hasText: 'RED' }).click();
    await page.waitForTimeout(300);
    await expect(sortIndicator).toBeVisible();
  });
});

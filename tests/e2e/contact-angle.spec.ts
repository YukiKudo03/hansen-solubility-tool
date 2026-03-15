/**
 * E2Eテスト: 接触角推定フロー
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

test('接触角推定タブに切り替え', async () => {
  // navバー内のタブボタンを明示的に指定
  await page.locator('nav button', { hasText: '接触角推定' }).click();
  await expect(page.getByText('Nakamoto-Yamamoto式')).toBeVisible();
});

test('グループ評価モードが初期表示される', async () => {
  await expect(page.locator('main button', { hasText: 'グループ評価' })).toBeVisible();
  await expect(page.locator('main button', { hasText: '溶媒スクリーニング' })).toBeVisible();
});

test('部品グループを選択できる', async () => {
  const select = page.locator('main select').first();
  await select.selectOption({ index: 1 });
  await page.waitForTimeout(500);
});

test('溶媒を検索して選択できる', async () => {
  const input = page.getByPlaceholder(/溶媒名/);
  await input.fill('トルエン');
  await page.waitForTimeout(500);
  await page.getByText('トルエン').first().click();
  await page.waitForTimeout(300);
});

test('接触角推定を実行できる', async () => {
  // main内の実行ボタン（タブボタンやh2ではなく）を明示的に指定
  await page.locator('main button.bg-blue-600', { hasText: '接触角推定' }).click();
  await page.waitForTimeout(2000);

  // 統計サマリーが表示される
  await expect(page.getByText('評価数')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/親水性/)).toBeVisible();
  await expect(page.getByText('最小接触角')).toBeVisible();
});

test('結果テーブルに接触角と濡れ性バッジが表示される', async () => {
  // テーブル内に度数表示のセルがある
  await expect(page.locator('td').filter({ hasText: /\d+\.\d°/ }).first()).toBeVisible();

  // 濡れ性バッジ（超親水/親水/濡れ性良好/中間/疎水/超撥水のいずれか）
  const badges = page.locator('.rounded-full');
  const badgeCount = await badges.count();
  expect(badgeCount).toBeGreaterThan(0);
});

test('結果テーブルにγ_LV, γ_SV, γ_SLカラムがある', async () => {
  await expect(page.locator('th', { hasText: 'γ_LV' })).toBeVisible();
  await expect(page.locator('th', { hasText: 'γ_SV' })).toBeVisible();
  await expect(page.locator('th', { hasText: 'γ_SL' })).toBeVisible();
});

test('結果テーブルが接触角でソート可能', async () => {
  await page.locator('th', { hasText: '接触角' }).click();
  await page.waitForTimeout(300);

  const sortIndicator = page.locator('th', { hasText: /接触角.*[▲▼]/ });
  await expect(sortIndicator).toBeVisible();
});

test('溶媒スクリーニングモードに切り替えできる', async () => {
  await page.locator('main button', { hasText: '溶媒スクリーニング' }).click();
  await page.waitForTimeout(500);

  // 部品セレクタのラベルが表示される（「部品」exact match）
  await expect(page.getByText('部品', { exact: true })).toBeVisible();
});

test('溶媒スクリーニングモードで部品を選択できる', async () => {
  // スクリーニングモードでは2番目のselectが部品セレクタ
  const partSelect = page.locator('main select').nth(1);
  await partSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);
});

test('全溶媒スクリーニングを実行できる', async () => {
  await page.locator('main button.bg-blue-600', { hasText: '全溶媒スクリーニング' }).click();
  await page.waitForTimeout(3000);

  // 統計サマリーが表示される
  await expect(page.getByText('評価数')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('最小接触角')).toBeVisible();
  await expect(page.getByText(/最も濡れやすい溶媒/)).toBeVisible();
});

test('スクリーニング結果にCSV出力ボタンが表示される', async () => {
  await expect(page.locator('main button', { hasText: 'CSV出力' })).toBeVisible();
});

test('グループ評価モードに戻せる', async () => {
  await page.locator('main button', { hasText: 'グループ評価' }).click();
  await page.waitForTimeout(500);

  // グループ評価モードでは実行ボタンが「接触角推定」になる（「全溶媒スクリーニング」ではなく）
  await expect(page.locator('main button.bg-blue-600', { hasText: '接触角推定' })).toBeVisible();
});

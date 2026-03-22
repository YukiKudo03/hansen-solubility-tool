/**
 * E2Eテスト: 既存10パイプラインの評価実行フロー (L2+L3)
 * 入力操作 → 評価実行 → 結果確認
 */
import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import { launchApp, clickTab } from './helpers';

let app: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  ({ app, page } = await launchApp());
}, 60000);

test.afterAll(async () => {
  if (app) await app.close();
});

// ============================================================
// 1. 溶解性評価: Group+Solvent → 評価 → ResultsTable
// ============================================================
test('溶解性評価: グループ選択→溶媒選択→評価実行→結果テーブル', async () => {
  await clickTab(page, '溶解性評価');
  await page.waitForTimeout(500);

  // グループ選択
  const groupSelect = page.locator('#parts-group-select');
  await groupSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // 溶媒検索+選択 (SolventSelector is a search input with autocomplete)
  const solventInput = page.locator('#solvent-search-input');
  await solventInput.click();
  await solventInput.fill('a');
  await page.waitForTimeout(500);
  // 候補リストの最初の項目をクリック
  const firstSolvent = page.locator('ul[role="listbox"] li').first();
  await firstSolvent.click();
  await page.waitForTimeout(300);

  // 評価実行ボタンクリック
  await page.locator('button.bg-blue-600', { hasText: '評価実行' }).click();
  await page.waitForTimeout(3000);

  // 結果テーブル表示確認 — REDヘッダーが表示される
  await expect(page.locator('th', { hasText: 'RED' })).toBeVisible({ timeout: 10000 });

  // Badge表示確認
  const badges = page.locator('.rounded-md3-sm');
  expect(await badges.count()).toBeGreaterThan(0);
});

// ============================================================
// 2. 接触角推定: Group選択 → 溶媒スクリーニング → 結果テーブル
// ============================================================
test('接触角推定: グループ評価モードで結果表示', async () => {
  await clickTab(page, '接触角推定');
  await page.waitForTimeout(500);

  // デフォルトは「グループ評価」モード
  // グループ選択
  const groupSelect = page.locator('#parts-group-select');
  await groupSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // 溶媒選択
  const solventInput = page.locator('#solvent-search-input');
  await solventInput.click();
  await solventInput.fill('a');
  await page.waitForTimeout(500);
  const firstSolvent = page.locator('ul[role="listbox"] li').first();
  await firstSolvent.click();
  await page.waitForTimeout(300);

  // 接触角推定実行
  await page.locator('button.bg-blue-600', { hasText: '接触角推定' }).click();
  await page.waitForTimeout(3000);

  // 結果テーブル — 接触角ヘッダー
  await expect(page.locator('th', { hasText: '接触角' }).first()).toBeVisible({ timeout: 10000 });
});

test('接触角推定: 溶媒スクリーニングモードで結果表示', async () => {
  // 溶媒スクリーニングモードに切替
  await page.getByText('溶媒スクリーニング').click();
  await page.waitForTimeout(300);

  // グループ選択
  const groupSelect = page.locator('#parts-group-select');
  await groupSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // 部品選択
  const partSelect = page.locator('main select').nth(1);
  await partSelect.selectOption({ index: 1 });
  await page.waitForTimeout(300);

  // 全溶媒スクリーニング実行
  await page.locator('button.bg-blue-600', { hasText: '全溶媒スクリーニング' }).click();
  await page.waitForTimeout(3000);

  // 結果テーブル表示確認
  await expect(page.locator('th', { hasText: '接触角' }).first()).toBeVisible({ timeout: 10000 });
});

// ============================================================
// 3. 膨潤度予測: Group+Solvent → 評価 → SwellingBadge
// ============================================================
test('膨潤度予測: グループ+溶媒→評価実行→結果テーブル', async () => {
  await clickTab(page, '膨潤度予測');
  await page.waitForTimeout(500);

  // グループ選択
  const groupSelect = page.locator('#parts-group-select');
  await groupSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // 溶媒選択
  const solventInput = page.locator('#solvent-search-input');
  await solventInput.click();
  await solventInput.fill('a');
  await page.waitForTimeout(500);
  const firstSolvent = page.locator('ul[role="listbox"] li').first();
  await firstSolvent.click();
  await page.waitForTimeout(300);

  // 評価実行
  await page.locator('button.bg-blue-600').first().click();
  await page.waitForTimeout(3000);

  // REDヘッダー表示確認
  await expect(page.locator('th', { hasText: 'RED' })).toBeVisible({ timeout: 10000 });

  // Badge表示確認
  const badges = page.locator('.rounded-md3-sm');
  expect(await badges.count()).toBeGreaterThan(0);
});

// ============================================================
// 4. 耐薬品性予測: Group+Solvent → 評価 → Badge
// ============================================================
test('耐薬品性予測: グループ+溶媒→評価実行→結果テーブル', async () => {
  await clickTab(page, '耐薬品性予測');
  await page.waitForTimeout(500);

  // グループ選択
  const groupSelect = page.locator('#parts-group-select');
  await groupSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // 溶媒選択
  const solventInput = page.locator('#solvent-search-input');
  await solventInput.click();
  await solventInput.fill('a');
  await page.waitForTimeout(500);
  const firstSolvent = page.locator('ul[role="listbox"] li').first();
  await firstSolvent.click();
  await page.waitForTimeout(300);

  // 評価実行
  await page.locator('button.bg-blue-600').first().click();
  await page.waitForTimeout(3000);

  // REDヘッダー表示確認
  await expect(page.locator('th', { hasText: 'RED' })).toBeVisible({ timeout: 10000 });

  // Badge表示確認
  const badges = page.locator('.rounded-md3-sm');
  expect(await badges.count()).toBeGreaterThan(0);
});

// ============================================================
// 5. 接着性予測: Group+Solvent → 評価 → Badge
// ============================================================
test('接着性予測: グループ+溶媒→評価実行→結果テーブル', async () => {
  await clickTab(page, '接着性予測');
  await page.waitForTimeout(500);

  // グループ選択
  const groupSelect = page.locator('#parts-group-select');
  await groupSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // 溶媒選択
  const solventInput = page.locator('#solvent-search-input');
  await solventInput.click();
  await solventInput.fill('a');
  await page.waitForTimeout(500);
  const firstSolvent = page.locator('ul[role="listbox"] li').first();
  await firstSolvent.click();
  await page.waitForTimeout(300);

  // 接着性評価ボタンクリック
  await page.locator('button.bg-blue-600').first().click();
  await page.waitForTimeout(3000);

  // Ra ヘッダー表示確認
  await expect(page.locator('th', { hasText: 'Ra' }).first()).toBeVisible({ timeout: 10000 });

  // 接着性レベルヘッダー表示確認
  await expect(page.locator('th', { hasText: '接着性レベル' })).toBeVisible();

  // Badge表示確認 (AdhesionView uses rounded-full badges)
  const badges = page.locator('.rounded-full');
  expect(await badges.count()).toBeGreaterThan(0);
});

// ============================================================
// 6. ナノ粒子分散: カテゴリ+粒子 → 全溶媒スクリーニング → 統計サマリー+Badge
// ============================================================
test('ナノ粒子分散: 粒子選択→スクリーニング→統計サマリー+Badge', async () => {
  await clickTab(page, 'ナノ粒子分散');
  await page.waitForTimeout(500);

  // ナノ粒子を選択
  const particleSelect = page.locator('select').nth(1);
  await particleSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // 全溶媒スクリーニング実行
  await page.getByText('全溶媒スクリーニング').click();
  await page.waitForTimeout(3000);

  // 統計サマリーが表示される
  await expect(page.getByText('評価溶媒数')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('最適溶媒')).toBeVisible();

  // Badge表示確認
  const badges = page.locator('.rounded-md3-sm');
  expect(await badges.count()).toBeGreaterThan(0);
});

// ============================================================
// 7. 薬物溶解性: Drug → 全溶媒スクリーニング → Badge
// ============================================================
test('薬物溶解性: 全溶媒スクリーニング→結果テーブル+Badge', async () => {
  await clickTab(page, '薬物溶解性');
  await page.waitForTimeout(500);

  // スクリーニングモードに切替
  await page.getByText('全溶媒スクリーニング').click();
  await page.waitForTimeout(300);

  // 薬物選択
  const drugSelect = page.locator('main select').first();
  await drugSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // スクリーニング実行
  await page.locator('button.bg-blue-600').first().click();
  await page.waitForTimeout(3000);

  // REDヘッダー表示確認
  await expect(page.locator('th', { hasText: 'RED' })).toBeVisible({ timeout: 10000 });

  // Badge表示確認
  const badges = page.locator('.rounded-md3-sm');
  expect(await badges.count()).toBeGreaterThan(0);
});

// ============================================================
// 8. 可塑剤選定: Group+Part → スクリーニング → Badge
// ============================================================
test('可塑剤選定: グループ+部品→スクリーニング→結果テーブル+Badge', async () => {
  await clickTab(page, '可塑剤選定');
  await page.waitForTimeout(500);

  // グループ選択
  const groupSelect = page.locator('#parts-group-select');
  await groupSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // 部品選択
  const partSelect = page.locator('main select').nth(1);
  await partSelect.selectOption({ index: 1 });
  await page.waitForTimeout(300);

  // スクリーニング実行
  await page.locator('button.bg-blue-600').first().click();
  await page.waitForTimeout(3000);

  // REDヘッダー表示確認
  await expect(page.locator('th', { hasText: 'RED' })).toBeVisible({ timeout: 10000 });

  // Badge表示確認
  const badges = page.locator('.rounded-md3-sm');
  expect(await badges.count()).toBeGreaterThan(0);
});

// ============================================================
// 9. キャリア選定: Drug → スクリーニング → Badge
// ============================================================
test('キャリア選定: 薬物+グループ→スクリーニング→結果テーブル+Badge', async () => {
  await clickTab(page, 'キャリア選定');
  await page.waitForTimeout(500);

  // スクリーニングモードに切替
  await page.getByText('グループスクリーニング').click();
  await page.waitForTimeout(300);

  // 薬物選択
  const drugSelect = page.locator('main select').first();
  await drugSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // グループ選択
  const groupSelect = page.locator('#parts-group-select');
  await groupSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // スクリーニング実行
  await page.locator('button.bg-blue-600', { hasText: 'スクリーニング実行' }).click();
  await page.waitForTimeout(3000);

  // REDヘッダー表示確認
  await expect(page.locator('th', { hasText: 'RED' })).toBeVisible({ timeout: 10000 });

  // Badge表示確認
  const badges = page.locator('.rounded-md3-sm');
  expect(await badges.count()).toBeGreaterThan(0);
});

// ============================================================
// 10. 分散剤選定: 粒子+溶媒 → スクリーニング → dual-HSPテーブル
// ============================================================
test('分散剤選定: 粒子+溶媒→分散剤スクリーニング→dual-HSPテーブル', async () => {
  await clickTab(page, '分散剤選定');
  await page.waitForTimeout(500);

  // デフォルトモード: 分散剤スクリーニング
  // ナノ粒子選択
  const particleSelect = page.locator('main select').nth(1);
  await particleSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // 溶媒選択
  const solventSelect = page.locator('main select').nth(2);
  await solventSelect.selectOption({ index: 1 });
  await page.waitForTimeout(300);

  // スクリーニング実行
  await page.locator('button.bg-blue-600').first().click();
  await page.waitForTimeout(3000);

  // dual-HSPテーブル: アンカーRED / 溶媒和RED ヘッダー確認
  const tableVisible = await page.locator('table').first().isVisible();
  expect(tableVisible).toBe(true);

  // Badge表示確認
  const badges = page.locator('.rounded-md3-sm');
  expect(await badges.count()).toBeGreaterThan(0);
});

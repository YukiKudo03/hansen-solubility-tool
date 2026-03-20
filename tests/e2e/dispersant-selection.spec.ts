/**
 * E2Eテスト: 分散剤選定フロー
 *
 * 3つのモードをテスト:
 * - 分散剤スクリーニング（粒子+溶媒 → 分散剤ランキング）
 * - 溶媒スクリーニング（粒子+分散剤 → 溶媒ランキング）
 * - 簡易評価（粒子のみ → 全体HSPベース）
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

test('分散剤選定タブに切り替え', async () => {
  await clickTab(page, '分散剤選定');
  await expect(page.getByText('分散剤選定')).toBeVisible();
});

test('3つのモード切替ボタンが表示される', async () => {
  await expect(page.locator('main button', { hasText: '分散剤スクリーニング' })).toBeVisible();
  await expect(page.locator('main button', { hasText: '溶媒スクリーニング' })).toBeVisible();
  await expect(page.locator('main button', { hasText: '簡易評価（全体HSP）' })).toBeVisible();
});

test('カテゴリフィルタとナノ粒子セレクタが表示される', async () => {
  const categorySelect = page.locator('main select').first();
  await expect(categorySelect).toBeVisible();

  const particleSelect = page.locator('main select').nth(1);
  const options = particleSelect.locator('option');
  const count = await options.count();
  // シードデータ18件 + placeholder
  expect(count).toBeGreaterThan(10);
});

test('カテゴリでナノ粒子をフィルタリングできる', async () => {
  const categorySelect = page.locator('main select').first();
  await categorySelect.selectOption('carbon');
  await page.waitForTimeout(500);

  const particleSelect = page.locator('main select').nth(1);
  const options = particleSelect.locator('option');
  const count = await options.count();
  expect(count).toBeGreaterThan(2);
  expect(count).toBeLessThan(10);

  // リセット
  await categorySelect.selectOption('');
  await page.waitForTimeout(500);
});

test('ナノ粒子を選択すると情報カードが表示される', async () => {
  const particleSelect = page.locator('main select').nth(1);
  await particleSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // HSP情報カード
  await expect(page.getByText('δD:')).toBeVisible();
  await expect(page.getByText('δP:')).toBeVisible();
  await expect(page.getByText('δH:')).toBeVisible();
  await expect(page.getByText('R₀:')).toBeVisible();
});

test('分散剤スクリーニングモードで溶媒セレクタが表示される', async () => {
  // デフォルトモードは分散剤スクリーニング
  await expect(page.getByText('溶媒（分散媒）')).toBeVisible();
  const solventSelect = page.locator('main select').nth(2);
  const options = solventSelect.locator('option');
  const count = await options.count();
  // シードデータの溶媒 + placeholder
  expect(count).toBeGreaterThan(50);
});

test('分散剤スクリーニングを実行できる', async () => {
  // 溶媒を選択
  const solventSelect = page.locator('main select').nth(2);
  await solventSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // 実行
  await page.locator('main button.bg-blue-600').click();
  await page.waitForTimeout(3000);

  // 統計サマリーが表示される
  await expect(page.getByText('評価数')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('推奨候補')).toBeVisible();
  await expect(page.getByText('最小スコア')).toBeVisible();
  await expect(page.getByText('最適候補')).toBeVisible();
});

test('結果テーブルにアンカー基・溶媒和鎖のヘッダーが表示される', async () => {
  await expect(page.locator('th', { hasText: 'アンカー基' })).toBeVisible();
  await expect(page.locator('th', { hasText: '溶媒和鎖' })).toBeVisible();
  await expect(page.locator('th', { hasText: '総合' })).toBeVisible();
});

test('結果テーブルに分散剤親和性バッジが表示される', async () => {
  const badges = page.locator('.rounded-md3-sm');
  const count = await badges.count();
  // 各行にアンカー基・溶媒和鎖・総合の3バッジ
  expect(count).toBeGreaterThan(0);
});

test('精度警告が表示される', async () => {
  await expect(page.getByText('アンカー基・溶媒和鎖の分離HSP値には推定値が含まれます')).toBeVisible();
});

test('結果テーブルがスコアでソート可能', async () => {
  await page.getByText('スコア').first().click();
  await page.waitForTimeout(300);

  const header = page.getByText(/スコア.*[▲▼]/);
  await expect(header).toBeVisible();
});

test('溶媒スクリーニングモードに切り替えできる', async () => {
  await page.locator('main button', { hasText: '溶媒スクリーニング' }).click();
  await page.waitForTimeout(500);

  // 溶媒セレクタが消え、分散剤セレクタが表示される
  await expect(page.locator('label', { hasText: '分散剤' })).toBeVisible();
});

test('溶媒スクリーニングで分散剤を選択して実行できる', async () => {
  // 粒子は既に選択済み
  // 分散剤を選択
  const dispersantSelect = page.locator('main select').nth(2);
  await dispersantSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // 実行
  await page.locator('main button.bg-blue-600').click();
  await page.waitForTimeout(3000);

  // 結果が表示される
  await expect(page.getByText('評価数')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('最適候補')).toBeVisible();
});

test('簡易評価モードに切り替えて実行できる', async () => {
  await page.locator('main button', { hasText: '簡易評価（全体HSP）' }).click();
  await page.waitForTimeout(500);

  // 粒子は既に選択済み、追加選択不要
  await page.locator('main button.bg-blue-600').click();
  await page.waitForTimeout(3000);

  // フォールバック結果テーブルが表示される
  await expect(page.getByText('簡易評価結果（全体HSPのみ）')).toBeVisible({ timeout: 10000 });
});

test('簡易評価結果テーブルにRa・RED・判定が表示される', async () => {
  // フォールバックテーブルのヘッダー
  const headers = page.locator('th');
  await expect(headers.filter({ hasText: 'Ra' }).first()).toBeVisible();
  await expect(headers.filter({ hasText: 'RED' }).first()).toBeVisible();
  await expect(headers.filter({ hasText: '判定' }).first()).toBeVisible();

  // バッジが表示される
  const badges = page.locator('.rounded-md3-sm');
  const count = await badges.count();
  expect(count).toBeGreaterThan(0);
});

test('モード切替で結果がクリアされる', async () => {
  // 簡易評価結果が表示されている状態で分散剤モードに切替
  await page.locator('main button', { hasText: '分散剤スクリーニング' }).click();
  await page.waitForTimeout(500);

  // 結果テーブルが消える
  await expect(page.getByText('簡易評価結果（全体HSPのみ）')).not.toBeVisible();
});

test('実行ボタンが未選択時に無効化される', async () => {
  // 粒子選択をクリア
  const particleSelect = page.locator('main select').nth(1);
  await particleSelect.selectOption('');
  await page.waitForTimeout(300);

  const executeButton = page.locator('main button.bg-blue-600');
  await expect(executeButton).toBeDisabled();
});

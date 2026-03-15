/**
 * E2Eテスト: ナノ粒子分散評価フロー
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

test('ナノ粒子分散タブに切り替え', async () => {
  await clickTab(page, 'ナノ粒子分散');
  await expect(page.getByText('ナノ粒子分散評価')).toBeVisible();
});

test('カテゴリフィルタが表示される', async () => {
  await expect(page.getByText('カテゴリ')).toBeVisible();
  const categorySelect = page.locator('select').first();
  await expect(categorySelect).toBeVisible();
});

test('ナノ粒子セレクタにシードデータが表示される', async () => {
  // 「すべて」カテゴリで全粒子が表示される
  const particleSelect = page.locator('select').nth(1);
  const options = particleSelect.locator('option');
  // シードデータ18件 + placeholder 1件
  const count = await options.count();
  expect(count).toBeGreaterThan(10);
});

test('カテゴリでフィルタリングできる', async () => {
  const categorySelect = page.locator('select').first();

  // カーボン系でフィルタ
  await categorySelect.selectOption('carbon');
  await page.waitForTimeout(500);

  const particleSelect = page.locator('select').nth(1);
  const options = particleSelect.locator('option');
  const count = await options.count();
  // カーボン系は5件 + placeholder
  expect(count).toBeGreaterThan(2);
  expect(count).toBeLessThan(10);

  // すべてに戻す
  await categorySelect.selectOption('');
  await page.waitForTimeout(500);
});

test('ナノ粒子を選択すると情報カードが表示される', async () => {
  const particleSelect = page.locator('select').nth(1);
  await particleSelect.selectOption({ index: 1 }); // 最初のナノ粒子
  await page.waitForTimeout(500);

  // 情報カード（青背景）が表示される
  await expect(page.getByText('母材:')).toBeVisible();
  await expect(page.getByText('表面修飾:')).toBeVisible();
  await expect(page.getByText('R₀:')).toBeVisible();
  await expect(page.getByText('δD:')).toBeVisible();
});

test('全溶媒スクリーニングを実行できる', async () => {
  // ナノ粒子が選択済みの状態
  await page.getByText('全溶媒スクリーニング').click();
  await page.waitForTimeout(3000);

  // 統計サマリーが表示される
  await expect(page.getByText('評価溶媒数')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/分散可能/)).toBeVisible();
  await expect(page.getByText('最小RED値')).toBeVisible();
  await expect(page.getByText('最適溶媒')).toBeVisible();
});

test('結果テーブルに分散性バッジが表示される', async () => {
  // 分散性バッジ（優秀/良好/可能/不良/不可のいずれか）が表示
  const badges = page.locator('.rounded-md3-sm');
  const count = await badges.count();
  expect(count).toBeGreaterThan(0);
});

test('結果テーブルがREDでソート可能', async () => {
  // REDヘッダーをクリックでソート切替
  await page.getByText('RED').first().click();
  await page.waitForTimeout(300);

  // ソートインジケータが表示される
  const redHeader = page.getByText(/RED.*[▲▼]/);
  await expect(redHeader).toBeVisible();
});

test('物性制約フィルタのチェックボックスを切り替えできる', async () => {
  // 有効化
  await page.getByText('物性制約フィルタを使用').click();
  await page.waitForTimeout(300);
  await expect(page.getByText('最高沸点')).toBeVisible();

  // 無効化
  await page.getByText('物性制約フィルタを使用').click();
  await page.waitForTimeout(300);
});

test('CSV出力ボタンが表示される', async () => {
  await expect(page.getByText('CSV出力')).toBeVisible();
});

test('別のカテゴリの粒子に切り替えて再評価できる', async () => {
  // カテゴリを金属酸化物に変更
  const categorySelect = page.locator('select').first();
  await categorySelect.selectOption('metal_oxide');
  await page.waitForTimeout(500);

  // 粒子を選択
  const particleSelect = page.locator('select').nth(1);
  await particleSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // スクリーニング実行
  await page.getByText('全溶媒スクリーニング').click();
  await page.waitForTimeout(3000);

  // 新しい結果が表示される
  await expect(page.getByText('評価溶媒数')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('最適溶媒')).toBeVisible();
});

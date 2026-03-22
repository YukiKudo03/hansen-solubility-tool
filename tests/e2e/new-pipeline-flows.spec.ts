/**
 * E2Eテスト: 新パイプラインの代表的な評価実行フロー (L2+L3)
 * UIパターンごとに代表1-2件をテスト
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
// screening型: Group → 全溶媒スクリーニング
// ============================================================

test('ESCリスク評価: グループ選択→ESCリスク評価→結果テーブル', async () => {
  await clickTab(page, '環境応力亀裂(ESC)');
  await page.waitForTimeout(500);

  // グループ選択
  const groupSelect = page.locator('#parts-group-select');
  await groupSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // ESCリスク評価実行
  await page.locator('button.bg-blue-600', { hasText: 'ESCリスク評価' }).click();
  await page.waitForTimeout(3000);

  // 結果テーブル表示確認
  await expect(page.locator('th', { hasText: 'RED' })).toBeVisible({ timeout: 10000 });

  // Badge表示確認
  const badges = page.locator('.rounded-md3-sm');
  expect(await badges.count()).toBeGreaterThan(0);
});

test('添加剤移行: グループ+部品→スクリーニング→結果テーブル', async () => {
  await clickTab(page, '添加剤移行');
  await page.waitForTimeout(500);

  // グループ選択
  const groupSelect = page.locator('#parts-group-select');
  await groupSelect.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // 部品選択（グループ選択後に表示される2番目のselect）
  const partSelect = page.locator('main select').nth(1);
  await partSelect.selectOption({ index: 1 });
  await page.waitForTimeout(300);

  // スクリーニング実行
  await page.locator('button.bg-blue-600', { hasText: '添加剤移行スクリーニング' }).click();
  await page.waitForTimeout(3000);

  // 結果テーブル表示確認
  await expect(page.locator('th', { hasText: 'RED' })).toBeVisible({ timeout: 10000 });

  // Badge表示確認
  const badges = page.locator('.rounded-md3-sm');
  expect(await badges.count()).toBeGreaterThan(0);
});

test('繊維染色性: HSP入力→スクリーニング→エラーまたは結果表示', async () => {
  await clickTab(page, '繊維染色性');
  await page.waitForTimeout(500);

  // デフォルトのHSP値でそのまま実行（染料リスト空のため、エラーが返る）
  await page.locator('button.bg-blue-600', { hasText: 'スクリーニング' }).click();
  await page.waitForTimeout(3000);

  // エラーメッセージまたは結果のいずれかが表示される
  const errorOrResult = page.locator('.text-red-600, pre');
  await expect(errorOrResult.first()).toBeVisible({ timeout: 10000 });
});

// ============================================================
// pairwise型: HSP手動入力
// ============================================================

test('ブレンド相溶性: グループ×2→相溶性評価→結果テーブル', async () => {
  await clickTab(page, 'ブレンド相溶性');
  await page.waitForTimeout(500);

  // ポリマー1 グループ選択
  const groupSelects = page.locator('#parts-group-select');
  const group1 = groupSelects.first();
  await group1.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // ポリマー2 グループ選択 (2番目のPartsGroupSelector)
  const group2 = groupSelects.nth(1);
  await group2.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // 相溶性評価実行
  await page.locator('button.bg-blue-600', { hasText: '相溶性評価' }).click();
  await page.waitForTimeout(3000);

  // 結果テーブル表示確認
  await expect(page.locator('table').first()).toBeVisible({ timeout: 10000 });

  // MiscibilityBadge表示確認
  const badges = page.locator('.rounded-md3-sm');
  expect(await badges.count()).toBeGreaterThan(0);
});

test('インク-基材密着: 6つのHSP入力→評価→Wa表示', async () => {
  await clickTab(page, 'インク-基材密着');
  await page.waitForTimeout(500);

  // デフォルトのHSP値がすでに入力済み
  // 密着性評価実行
  await page.locator('button.bg-blue-600', { hasText: '密着性評価' }).click();
  await page.waitForTimeout(3000);

  // 結果: 接着仕事 Wa が表示される
  await expect(page.getByText('接着仕事 Wa')).toBeVisible({ timeout: 10000 });
  // Ra値が表示される
  await expect(page.getByText('HSP距離 Ra')).toBeVisible();
  // 密着レベルBadge
  await expect(page.getByText('密着レベル')).toBeVisible();
});

test('構造接着設計: 9つのHSP入力→評価→2界面Wa', async () => {
  await clickTab(page, '構造接着設計');
  await page.waitForTimeout(500);

  // デフォルトのHSP値がすでに入力済み
  // 構造接着評価実行
  await page.locator('button.bg-blue-600', { hasText: '構造接着評価' }).click();
  await page.waitForTimeout(3000);

  // 評価結果が表示される
  await expect(page.getByText('評価結果')).toBeVisible({ timeout: 10000 });
  // 2つの界面（被着体1、被着体2）
  await expect(page.getByText('接着剤 - 被着体1')).toBeVisible();
  await expect(page.getByText('接着剤 - 被着体2')).toBeVisible();
  // ボトルネック表示
  await expect(page.getByText('ボトルネック', { exact: true })).toBeVisible();
});

// ============================================================
// optimization型
// ============================================================

test('超臨界CO2: デフォルト値→評価→結果テーブル', async () => {
  await clickTab(page, '超臨界CO2');
  await page.waitForTimeout(500);

  // デフォルト値で評価実行（共溶媒のチェックボックスがデフォルトで2つ選択済み）
  await page.locator('button.bg-blue-600', { hasText: '超臨界CO2評価' }).click();
  await page.waitForTimeout(3000);

  // scCO2条件のメタデータが表示される
  await expect(page.getByText('scCO2 条件')).toBeVisible({ timeout: 10000 });
  // 結果テーブルが表示される（共溶媒ヘッダー）
  await expect(page.locator('th', { hasText: '共溶媒' })).toBeVisible();
  // REDヘッダー
  await expect(page.locator('th', { hasText: 'RED' })).toBeVisible();
});

// ============================================================
// analysis/tool型
// ============================================================

test('温度HSP補正: HSP+温度入力→計算→結果カード', async () => {
  await clickTab(page, '温度HSP補正');
  await page.waitForTimeout(500);

  // デフォルトのHSP/温度値で実行
  await page.locator('button.bg-blue-600', { hasText: '温度補正を実行' }).click();
  await page.waitForTimeout(2000);

  // 元のHSP結果カードが表示される
  await expect(page.getByText('元のHSP')).toBeVisible({ timeout: 10000 });
  // 補正後HSP結果カードが表示される
  await expect(page.getByText('補正後HSP')).toBeVisible();
});

test('族寄与法: 断片選択→HSP推定→結果表示', async () => {
  await clickTab(page, '族寄与法');
  await page.waitForTimeout(1000);

  // グループ定義が読み込まれるのを待つ (h4要素で特定)
  await expect(page.locator('h4', { hasText: '第1次グループ' })).toBeVisible({ timeout: 10000 });

  // テーブル内の「+」ボタンをクリックして断片を追加 (bg-blue-100のボタン)
  const incrementButtons = page.locator('button.bg-blue-100');
  // 最初のグループの「+」ボタンをクリック
  await incrementButtons.first().click();
  await page.waitForTimeout(300);

  // 2番目のグループも追加
  await incrementButtons.nth(1).click();
  await page.waitForTimeout(300);

  // HSP推定実行
  await page.locator('button.bg-blue-600', { hasText: 'HSP推定' }).click();
  await page.waitForTimeout(2000);

  // 推定結果が表示される
  await expect(page.getByText('推定結果')).toBeVisible({ timeout: 10000 });
  // δD表示確認 (using locator to find specific text in result card)
  await expect(page.locator('.bg-blue-50', { hasText: 'δD' }).first()).toBeVisible();
  // 信頼度表示確認
  await expect(page.getByText('信頼度')).toBeVisible();
});

test('HSP推算(QSPR): 記述子入力→推定→HSP表示', async () => {
  await clickTab(page, 'HSP推算(QSPR)');
  await page.waitForTimeout(500);

  // デフォルトの記述子値で推定実行
  await page.locator('button.bg-blue-600', { hasText: 'HSP推定' }).click();
  await page.waitForTimeout(2000);

  // 推定結果が表示される
  await expect(page.getByText('推定結果')).toBeVisible({ timeout: 10000 });
  // deltaD 表示確認
  await expect(page.getByText('deltaD')).toBeVisible();
  // 信頼度表示確認
  await expect(page.getByText('信頼度')).toBeVisible();
});

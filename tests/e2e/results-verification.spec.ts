/**
 * E2E L4テスト: 結果検証 — 各機能の結果表示を詳細検証
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

// ============================================================
// テスト1: ナノ粒子分散 — Badge + ソート + CSV
// ============================================================
test.describe('ナノ粒子分散 — Badge + ソート + CSV', () => {
  test('カテゴリ選択 → 粒子選択 → スクリーニング実行', async () => {
    await clickTab(page, 'ナノ粒子分散');
    await expect(page.locator('main').getByText('ナノ粒子分散評価')).toBeVisible();

    // カテゴリをcarbon(カーボン系)に
    const categorySelect = page.locator('main select').first();
    await categorySelect.selectOption('carbon');
    await page.waitForTimeout(500);

    // 粒子を選択
    const particleSelect = page.locator('main select').nth(1);
    await particleSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // 全溶媒スクリーニング実行
    await page.locator('main button', { hasText: '全溶媒スクリーニング' }).click();
    await page.waitForTimeout(3000);
  });

  test('統計サマリー表示確認', async () => {
    await expect(page.locator('main').getByText('評価溶媒数')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('main').getByText(/分散可能/)).toBeVisible();
    await expect(page.locator('main').getByText('最小RED値')).toBeVisible();
    await expect(page.locator('main').getByText('最適溶媒')).toBeVisible();
  });

  test('Badgeが1つ以上表示される', async () => {
    const badges = page.locator('main .rounded-md3-sm');
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('REDヘッダークリックでソートインジケータ表示', async () => {
    await page.locator('main').getByText('RED').first().click();
    await page.waitForTimeout(300);
    const redHeader = page.locator('main').getByText(/RED.*[▲▼]/);
    await expect(redHeader).toBeVisible();
  });

  test('CSV出力ボタン表示確認', async () => {
    await expect(page.locator('main').getByText('CSV出力')).toBeVisible();
  });
});

// ============================================================
// テスト2: 接触角推定 — モード切替 + 結果
// ============================================================
test.describe('接触角推定 — モード切替 + 結果', () => {
  test('溶媒スクリーニングモードに切替', async () => {
    await clickTab(page, '接触角推定');
    await expect(page.locator('main').getByText('Nakamoto-Yamamoto式')).toBeVisible();

    // 溶媒スクリーニングモードに切替 (main内のボタンを指定)
    await page.locator('main button', { hasText: '溶媒スクリーニング' }).click();
    await page.waitForTimeout(300);

    // 部品ラベルが表示される
    await expect(page.locator('main').getByText('部品', { exact: true })).toBeVisible();
  });

  test('Group選択 → 部品選択 → スクリーニング実行', async () => {
    // Group選択
    const groupSelect = page.locator('main select').first();
    await groupSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // 部品を選択 (screeningモードでは2番目のselect)
    const partSelect = page.locator('main select').nth(1);
    await partSelect.selectOption({ index: 1 });
    await page.waitForTimeout(300);

    // スクリーニング実行
    await page.locator('main button.bg-blue-600', { hasText: '全溶媒スクリーニング' }).click();
    await page.waitForTimeout(3000);
  });

  test('結果テーブルにθ値表示確認', async () => {
    // 統計サマリー
    await expect(page.locator('main').getByText('評価数')).toBeVisible({ timeout: 10000 });
    // 接触角の値 (度数表示のセル)
    await expect(page.locator('main td').filter({ hasText: /\d+\.\d°/ }).first()).toBeVisible();
  });

  test('WettabilityBadge表示', async () => {
    const badges = page.locator('main .rounded-md3-sm');
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('グループ評価モードに切替 → UI変更確認', async () => {
    await page.locator('main button', { hasText: 'グループ評価' }).click();
    await page.waitForTimeout(300);

    // グループ評価モードでは実行ボタンが「接触角推定」
    await expect(page.locator('main button.bg-blue-600', { hasText: '接触角推定' })).toBeVisible();
  });
});

// ============================================================
// テスト3: 分散剤選定 — 3モード切替 + dual-HSPテーブル
// ============================================================
test.describe('分散剤選定 — 3モード切替 + dual-HSPテーブル', () => {
  test('分散剤選定タブ表示', async () => {
    await clickTab(page, '分散剤選定');
    await page.waitForTimeout(500);
    await expect(page.locator('main h2', { hasText: '分散剤選定' })).toBeVisible();
  });

  test('分散剤スクリーニングモード確認', async () => {
    await expect(page.locator('main button', { hasText: '分散剤スクリーニング' })).toBeVisible();
  });

  test('カテゴリ+粒子+溶媒選択', async () => {
    // カテゴリ選択 (carbon)
    const categorySelect = page.locator('main select').first();
    await categorySelect.selectOption('carbon');
    await page.waitForTimeout(500);

    // 粒子選択
    const particleSelect = page.locator('main select').nth(1);
    await particleSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // 溶媒選択
    const solventSelect = page.locator('main select').nth(2);
    await solventSelect.selectOption({ index: 1 });
    await page.waitForTimeout(300);
  });

  test('スクリーニング実行 → ヘッダー確認', async () => {
    await page.locator('main button.bg-blue-600').click();
    await page.waitForTimeout(3000);

    // アンカー基/溶媒和鎖/総合ヘッダー確認
    await expect(page.locator('main th', { hasText: 'アンカー基' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('main th', { hasText: '溶媒和鎖' })).toBeVisible();
    await expect(page.locator('main th', { hasText: '総合' })).toBeVisible();
  });

  test('溶媒スクリーニングモード切替 → UI変更確認', async () => {
    await page.locator('main button', { hasText: '溶媒スクリーニング' }).click();
    await page.waitForTimeout(300);

    // 分散剤ラベルが表示される
    await expect(page.locator('main label', { hasText: '分散剤' })).toBeVisible();
  });

  test('簡易評価モード切替 → 簡易テーブル表示確認', async () => {
    await page.locator('main button', { hasText: '簡易評価（全体HSP）' }).click();
    await page.waitForTimeout(300);

    // 簡易モードでは実行ボタンが表示される
    await expect(page.locator('main button.bg-blue-600')).toBeVisible();
  });
});

// ============================================================
// テスト4: ブレンド最適化 — 候補選択 + ブレンド結果
// ============================================================
test.describe('ブレンド最適化 — 候補選択 + ブレンド結果', () => {
  test('ブレンド最適化タブ表示', async () => {
    await clickTab(page, 'ブレンド最適化');
    await expect(page.locator('main').getByText('溶剤ブレンド最適化')).toBeVisible();
  });

  test('ターゲットHSP手入力', async () => {
    // δD入力
    const deltaD = page.locator('main input[placeholder="例: 18.0"]');
    await deltaD.fill('18.5');

    // δP入力
    const deltaP = page.locator('main input[placeholder="例: 10.0"]');
    await deltaP.fill('4.5');

    // δH入力
    const deltaH = page.locator('main input[placeholder="例: 12.0"]');
    await deltaH.fill('2.9');

    await page.waitForTimeout(300);
  });

  test('候補溶媒チェックボックス選択 (全選択)', async () => {
    // 全選択ボタン
    await page.locator('main button', { hasText: '全選択' }).click();
    await page.waitForTimeout(500);

    // 選択数の確認
    await expect(page.locator('main').getByText(/\d+ \/ \d+ 選択中/)).toBeVisible();
  });

  test('最適化実行 → 結果テーブルに組成比+Ra表示', async () => {
    await page.locator('main button', { hasText: 'ブレンド最適化実行' }).click();

    // 結果テーブル表示確認 (長い待機が必要)
    await expect(page.locator('main').getByText('最適化結果')).toBeVisible({ timeout: 60000 });

    // 組成比 (体積分率) が表示される
    await expect(page.locator('main').getByText(/%\)/).first()).toBeVisible();

    // Ra列ヘッダー
    await expect(page.locator('main th', { hasText: 'Ra' })).toBeVisible();

    // 順位列
    await expect(page.locator('main th', { hasText: '順位' })).toBeVisible();
  });
});

// ============================================================
// テスト5: 設定 — テーマ切替
// ============================================================
test.describe('設定 — テーマ切替', () => {
  test('設定タブ表示 + テーマボタン3つ', async () => {
    await clickTab(page, '設定');
    await expect(page.locator('main').getByText('テーマ設定')).toBeVisible();

    await expect(page.locator('main button', { hasText: 'ライト' })).toBeVisible();
    await expect(page.locator('main button', { hasText: 'ダーク' })).toBeVisible();
    await expect(page.locator('main button', { hasText: 'システム' })).toBeVisible();
  });

  test('ダークモード切替 → darkクラス確認', async () => {
    await page.locator('main button', { hasText: 'ダーク' }).click();
    await page.waitForTimeout(500);

    // html要素にdarkクラスが付与される
    const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDark).toBe(true);
  });

  test('ライトモード切替 → darkクラス除去確認', async () => {
    await page.locator('main button', { hasText: 'ライト' }).click();
    await page.waitForTimeout(500);

    const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDark).toBe(false);
  });
});

// ============================================================
// テスト6: データベース編集 — CRUD確認
// ============================================================
test.describe('データベース編集 — CRUD確認', () => {
  test('データベース編集タブ → テーブル表示確認', async () => {
    await clickTab(page, 'データベース編集');
    await expect(page.locator('main').getByText('部品グループ')).toBeVisible();
  });

  test('溶媒タブへ切替 → 溶媒一覧表示', async () => {
    await page.locator('main').getByRole('button', { name: '溶媒', exact: true }).click();
    await expect(page.locator('main').getByText(/件の溶媒/)).toBeVisible();
  });

  test('検索機能確認', async () => {
    const searchInput = page.locator('main').getByPlaceholder('溶媒を検索...');
    await searchInput.fill('トルエン');
    await page.waitForTimeout(500);
    await expect(page.locator('main').getByText('Toluene')).toBeVisible();

    // 検索クリア
    await searchInput.fill('');
    await page.waitForTimeout(300);
  });
});

// ============================================================
// テスト7: 3D可視化 — Plotly表示
// ============================================================
test.describe('3D可視化 — Plotly表示', () => {
  test('3D可視化タブ表示', async () => {
    await clickTab(page, '3D可視化');
    await page.waitForTimeout(1000);
  });

  test('Group選択', async () => {
    const groupSelect = page.locator('main #parts-group-select');
    await groupSelect.selectOption({ index: 1 });
    await page.waitForTimeout(1000);
  });

  test('Plotlyチャートが表示される', async () => {
    const plotly = page.locator('main .js-plotly-plot');
    await expect(plotly).toBeVisible({ timeout: 15000 });
  });
});

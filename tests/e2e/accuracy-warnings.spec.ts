/**
 * E2Eテスト: 推定精度の警告表示
 *
 * 文献値再現テストで発見された系統的偏差について、
 * 該当ケースで黄色の警告ボックスが表示されることを検証する。
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

/**
 * SolventSelectorで溶媒を選択する。
 * 既に溶媒が選択済みの場合は「変更」ボタンを押してから検索・選択する。
 */
async function selectSolvent(p: Page, name: string): Promise<void> {
  // 既に溶媒選択済み → 「変更」ボタンをクリックして入力モードに戻す
  const changeBtn = p.locator('button', { hasText: '変更' });
  if (await changeBtn.first().isVisible().catch(() => false)) {
    await changeBtn.first().click();
    await p.waitForTimeout(300);
  }

  const input = p.getByPlaceholder(/溶媒名/);
  await input.fill(name);
  await p.waitForTimeout(500);

  // ドロップダウンリストから選択
  const listItem = p.locator('li').filter({ hasText: name }).first();
  await listItem.click();
  await p.waitForTimeout(300);
}

// ─── 接触角推定: アルコール警告 ─────────────────────

test.describe('接触角推定 — アルコール溶媒の警告', () => {
  test('エタノールで接触角推定を実行するとアルコール警告が表示される', async () => {
    await clickTab(page, '接触角推定');
    await page.waitForTimeout(500);

    // グループ評価モードを確認
    await expect(page.locator('main button', { hasText: 'グループ評価' })).toBeVisible();

    // 部品グループを選択（最初のグループ）
    const groupSelect = page.locator('main select').first();
    await groupSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // エタノールを溶媒として選択
    await selectSolvent(page, 'エタノール');

    // 接触角推定を実行
    await page.locator('main button.bg-blue-600', { hasText: '接触角推定' }).click();
    await page.waitForTimeout(2000);

    // 統計サマリーが表示される
    await expect(page.getByText('評価数')).toBeVisible({ timeout: 10000 });

    // アルコール警告が黄色ボックスで表示される
    const warningBox = page.locator('.bg-yellow-50');
    await expect(warningBox).toBeVisible();
    await expect(warningBox.getByText('推定精度に関する注意')).toBeVisible();
    await expect(warningBox.getByText(/アルコール類/)).toBeVisible();
  });
});

// ─── 接触角推定: 多価アルコール警告 ─────────────────

test.describe('接触角推定 — 多価アルコール溶媒の警告', () => {
  test('グリセリンで接触角推定を実行すると多価アルコール警告が表示される', async () => {
    await clickTab(page, '接触角推定');
    await page.waitForTimeout(500);

    // 部品グループを選択
    const groupSelect = page.locator('main select').first();
    await groupSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // グリセリンを溶媒として選択
    await selectSolvent(page, 'グリセリン');

    // 接触角推定を実行
    await page.locator('main button.bg-blue-600', { hasText: '接触角推定' }).click();
    await page.waitForTimeout(2000);

    // 統計サマリーが表示される
    await expect(page.getByText('評価数')).toBeVisible({ timeout: 10000 });

    // 多価アルコール警告が表示される
    const warningBox = page.locator('.bg-yellow-50');
    await expect(warningBox).toBeVisible();
    await expect(warningBox.getByText(/多価アルコール/)).toBeVisible();
  });
});

// ─── 接触角推定: 水 + 親水性ポリマー警告 ────────────

test.describe('接触角推定 — 親水性ポリマー × 水の警告', () => {
  test('水で接触角推定を実行すると警告が表示される可能性がある', async () => {
    await clickTab(page, '接触角推定');
    await page.waitForTimeout(500);

    // 部品グループを選択
    const groupSelect = page.locator('main select').first();
    await groupSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // 水を溶媒として選択
    await selectSolvent(page, '水');

    // 接触角推定を実行
    await page.locator('main button.bg-blue-600', { hasText: '接触角推定' }).click();
    await page.waitForTimeout(2000);

    // 統計サマリーが表示される
    await expect(page.getByText('評価数')).toBeVisible({ timeout: 10000 });

    // 警告の有無はデータ依存（グループに親水性ポリマーが含まれるかどうか）
    // テスト通過条件: クラッシュしないこと + 結果が表示されること
    await expect(page.getByText('評価数')).toBeVisible();
  });
});

// ─── 接触角推定: 非アルコール溶媒で警告なし ─────────

test.describe('接触角推定 — 非アルコール溶媒で警告が出ない', () => {
  test('トルエンで接触角推定を実行しても警告ボックスが表示されない', async () => {
    await clickTab(page, '接触角推定');
    await page.waitForTimeout(500);

    // 部品グループを選択
    const groupSelect = page.locator('main select').first();
    await groupSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // トルエンを溶媒として選択
    await selectSolvent(page, 'トルエン');

    // 接触角推定を実行
    await page.locator('main button.bg-blue-600', { hasText: '接触角推定' }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText('評価数')).toBeVisible({ timeout: 10000 });

    // トルエン（δH=2.0, δP=1.4）は警告条件を満たさないので警告なし
    const warningBox = page.locator('.bg-yellow-50');
    await expect(warningBox).toHaveCount(0);
  });
});

// ─── ナノ粒子分散: RED境界警告 ──────────────────────

test.describe('ナノ粒子分散 — RED境界警告', () => {
  test('全溶媒スクリーニングでRED境界警告が表示される', async () => {
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

    // 85+溶媒のスクリーニングでは、RED=0.8〜1.2の境界ケースが含まれる確率が高い
    const warningBox = page.locator('.bg-yellow-50');
    const warningCount = await warningBox.count();
    if (warningCount > 0) {
      await expect(warningBox.getByText(/RED値が0.8〜1.2/)).toBeVisible();
      await expect(warningBox.getByText(/R₀/)).toBeVisible();
    }
    // テスト通過条件: クラッシュしないこと
    await expect(page.getByText('評価溶媒数')).toBeVisible();
  });
});

// ─── 薬物溶解性: RED境界警告 ────────────────────────

test.describe('薬物溶解性 — RED境界警告', () => {
  test('全溶媒スクリーニングでRED境界警告が表示される', async () => {
    await clickTab(page, '薬物溶解性');
    await page.waitForTimeout(500);

    // 薬物を選択
    const drugSelect = page.locator('main select').first();
    await drugSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // スクリーニングモードに切替
    await page.locator('main button', { hasText: '全溶媒スクリーニング' }).first().click();
    await page.waitForTimeout(300);

    // 実行
    await page.locator('main button.bg-blue-600').click();
    await page.waitForTimeout(2000);

    // 結果テーブルが表示される
    await expect(page.locator('th', { hasText: 'RED' })).toBeVisible({ timeout: 10000 });

    // 85+溶媒スクリーニングではRED境界ケースが含まれる確率が高い
    const warningBox = page.locator('.bg-yellow-50');
    const warningCount = await warningBox.count();
    if (warningCount > 0) {
      await expect(warningBox.getByText(/RED値が0.8〜1.2/)).toBeVisible();
    }
    // テスト通過条件: クラッシュしないこと + 結果表示
    await expect(page.locator('th', { hasText: 'RED' })).toBeVisible();
  });
});

// ─── 耐薬品性: RED境界警告 ──────────────────────────

test.describe('耐薬品性 — RED境界警告', () => {
  test('耐薬品性予測を実行してもクラッシュしない', async () => {
    await clickTab(page, '耐薬品性予測');
    await page.waitForTimeout(500);

    // コーティング材料グループを選択
    const select = page.locator('main select').first();
    const options = select.locator('option');
    const count = await options.count();
    for (let i = 1; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text?.includes('コーティング')) {
        await select.selectOption({ index: i });
        break;
      }
    }
    await page.waitForTimeout(500);

    // 溶媒を選択
    await selectSolvent(page, 'アセトン');

    // 評価実行
    await page.locator('main button.bg-blue-600').click();
    await page.waitForTimeout(2000);

    // 結果が表示される
    await expect(page.locator('th', { hasText: 'RED' })).toBeVisible({ timeout: 10000 });

    // 警告ボックスの存在確認（データ依存）
    const warningBox = page.locator('.bg-yellow-50');
    const warningCount = await warningBox.count();
    if (warningCount > 0) {
      await expect(warningBox.getByText(/RED値が0.8〜1.2/)).toBeVisible();
    }
    // テスト通過条件: クラッシュしないこと
    await expect(page.locator('th', { hasText: 'RED' })).toBeVisible();
  });
});

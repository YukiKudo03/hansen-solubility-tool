/**
 * E2Eテスト: クロスタブナビゲーション
 *
 * 複数のタブ間を切り替えてもアプリがクラッシュしないこと、
 * 各タブが正しくレンダリングされることを検証する。
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

test('全タブを順番に切り替えてクラッシュしない', async () => {
  const tabs = [
    { name: '溶解性評価', heading: '評価条件' },
    { name: '接触角推定', heading: '接触角推定' },
    { name: '膨潤度予測', heading: '膨潤度予測' },
    { name: '耐薬品性予測', heading: '耐薬品性予測' },
    { name: '可塑剤選定', heading: '可塑剤選定' },
    { name: 'ナノ粒子分散', heading: 'ナノ粒子分散評価' },
    { name: '薬物溶解性', heading: '薬物溶解性評価' },
    { name: 'キャリア選定', heading: 'キャリア選定' },
    { name: '混合溶媒', heading: '混合溶媒' },
    { name: 'ブレンド最適化', heading: '溶剤ブレンド最適化' },
    { name: 'データベース編集', heading: '部品グループ' },
    { name: '設定', heading: 'リスク判定閾値設定' },
  ];

  for (const tab of tabs) {
    await clickTab(page, tab.name);
    await page.waitForTimeout(500);
    await expect(page.locator('main').getByText(tab.heading).first()).toBeVisible({ timeout: 5000 });
  }
});

test('タブ間を高速で切り替えてもクラッシュしない', async () => {
  const quickTabs = ['溶解性評価', '接触角推定', 'ナノ粒子分散', '混合溶媒', '設定'];

  for (const tab of quickTabs) {
    await clickTab(page, tab);
    await page.waitForTimeout(200); // 高速切り替え
  }

  // 最終タブがちゃんと表示されている
  await expect(page.locator('main').getByText('リスク判定閾値設定').first()).toBeVisible();
});

test('評価実行後に別タブに遷移して戻ってもアプリが安定', async () => {
  // 1. 溶解性評価で評価を実行
  await clickTab(page, '溶解性評価');
  await page.waitForTimeout(500);

  const select = page.locator('main select').first();
  await select.selectOption({ index: 1 });
  await page.waitForTimeout(500);

  const input = page.getByPlaceholder(/溶媒名/);
  await input.fill('トルエン');
  await page.waitForTimeout(500);
  await page.getByText('トルエン').first().click();
  await page.waitForTimeout(300);

  await page.locator('main button.bg-blue-600').click();
  await page.waitForTimeout(2000);

  await expect(page.getByText(/評価結果/)).toBeVisible({ timeout: 10000 });

  // 2. 別のタブに遷移
  await clickTab(page, '設定');
  await page.waitForTimeout(500);
  await expect(page.getByText('リスク判定閾値設定')).toBeVisible();

  // 3. ナノ粒子分散に遷移
  await clickTab(page, 'ナノ粒子分散');
  await page.waitForTimeout(500);
  await expect(page.getByText('ナノ粒子分散評価')).toBeVisible();

  // 4. 溶解性評価に戻る
  await clickTab(page, '溶解性評価');
  await page.waitForTimeout(500);
  await expect(page.getByText('評価条件')).toBeVisible();
});

test('NavigationDrawerのカテゴリ展開・折りたたみが動作する', async () => {
  const drawer = page.locator('[data-testid="navigation-drawer"]');

  // カテゴリボタンが存在する
  const categories = drawer.locator('button[data-nav-type="category"]');
  const categoryCount = await categories.count();
  expect(categoryCount).toBeGreaterThan(0);

  // 最初のカテゴリをクリックして展開/折りたたみ
  await categories.first().click();
  await page.waitForTimeout(300);

  // サブ項目が表示される
  const items = drawer.locator('button[data-nav-type="item"]');
  const itemCount = await items.count();
  expect(itemCount).toBeGreaterThan(0);
});

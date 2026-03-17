/**
 * E2Eテスト: ブレンド最適化 ターゲットHSP材料参照機能
 *
 * 最新機能: ポリマー材料・ナノ粒子・薬物からHSPを自動入力する
 */
import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import { launchApp, clickTab } from './helpers';

let app: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  ({ app, page } = await launchApp());
  await clickTab(page, 'ブレンド最適化');
  await page.waitForTimeout(500);
});

test.afterAll(async () => {
  await app.close();
});

test('材料から参照セクションが表示される', async () => {
  await expect(page.getByText('材料から参照')).toBeVisible();
  await expect(page.getByLabel('参照元')).toBeVisible();
});

test('参照元のドロップダウンに選択肢がある', async () => {
  const refSelect = page.getByLabel('参照元');
  await expect(refSelect).toBeVisible();

  // 「-- 手入力 --」がデフォルト
  await expect(refSelect).toHaveValue('');

  // 選択肢を確認
  const options = refSelect.locator('option');
  const count = await options.count();
  expect(count).toBe(4); // 手入力, ポリマー材料, ナノ粒子, 薬物
});

test('ポリマー材料を参照元に選択するとグループセレクタが表示される', async () => {
  const refSelect = page.getByLabel('参照元');
  await refSelect.selectOption('part');
  await page.waitForTimeout(500);

  // グループセレクタが表示される
  await expect(page.getByLabel('グループ')).toBeVisible();
});

test('グループを選択すると材料セレクタが表示される', async () => {
  const groupSelect = page.getByLabel('グループ');
  await groupSelect.selectOption({ index: 1 }); // 最初のグループを選択
  await page.waitForTimeout(500);

  // 材料セレクタが表示される
  await expect(page.getByLabel('材料')).toBeVisible();
});

test('材料を選択するとターゲットHSPが自動入力される', async () => {
  const materialSelect = page.getByLabel('材料');
  await materialSelect.selectOption({ index: 1 }); // 最初の材料を選択
  await page.waitForTimeout(500);

  // δD, δP, δH入力欄に値が入っている（空ではない）
  const inputs = page.locator('main').getByRole('spinbutton');
  const deltaD = await inputs.nth(0).inputValue();
  const deltaP = await inputs.nth(1).inputValue();
  const deltaH = await inputs.nth(2).inputValue();

  expect(deltaD).not.toBe('');
  expect(deltaP).not.toBe('');
  expect(deltaH).not.toBe('');

  // 値が数値であることを確認
  expect(parseFloat(deltaD)).toBeGreaterThan(0);
  expect(parseFloat(deltaP)).toBeGreaterThanOrEqual(0);
  expect(parseFloat(deltaH)).toBeGreaterThanOrEqual(0);
});

test('薬物を参照元に切り替えると薬物セレクタが表示される', async () => {
  const refSelect = page.getByLabel('参照元');
  await refSelect.selectOption('drug');
  await page.waitForTimeout(500);

  // 薬物セレクタが表示される
  await expect(page.getByLabel('薬物')).toBeVisible();

  // グループ・材料セレクタは非表示
  await expect(page.getByLabel('グループ')).not.toBeVisible();
});

test('薬物を選択するとターゲットHSPが自動入力される', async () => {
  const drugSelect = page.getByLabel('薬物');
  await drugSelect.selectOption({ index: 1 }); // 最初の薬物を選択
  await page.waitForTimeout(500);

  const inputs = page.locator('main').getByRole('spinbutton');
  const deltaD = await inputs.nth(0).inputValue();
  expect(parseFloat(deltaD)).toBeGreaterThan(0);
});

test('ナノ粒子を参照元に切り替えるとナノ粒子セレクタが表示される', async () => {
  const refSelect = page.getByLabel('参照元');
  await refSelect.selectOption('nanoparticle');
  await page.waitForTimeout(1000); // ナノ粒子データのロード待ち

  // ナノ粒子セレクタが表示される
  await expect(page.getByLabel('ナノ粒子')).toBeVisible();

  // 薬物セレクタは非表示
  await expect(page.getByLabel('薬物')).not.toBeVisible();
});

test('ナノ粒子を選択するとターゲットHSPが自動入力される', async () => {
  const nanoSelect = page.getByLabel('ナノ粒子');
  await nanoSelect.selectOption({ index: 1 }); // 最初のナノ粒子を選択
  await page.waitForTimeout(500);

  const inputs = page.locator('main').getByRole('spinbutton');
  const deltaD = await inputs.nth(0).inputValue();
  expect(parseFloat(deltaD)).toBeGreaterThan(0);
});

test('手入力に戻すと参照セレクタが非表示になる', async () => {
  const refSelect = page.getByLabel('参照元');
  await refSelect.selectOption('');
  await page.waitForTimeout(300);

  // 追加のセレクタが非表示
  await expect(page.getByLabel('ナノ粒子')).not.toBeVisible();
  await expect(page.getByLabel('薬物')).not.toBeVisible();
  await expect(page.getByLabel('グループ')).not.toBeVisible();
});

test('材料参照後にブレンド最適化を実行できる', async () => {
  // ポリマー材料からHSPを参照
  const refSelect = page.getByLabel('参照元');
  await refSelect.selectOption('part');
  await page.waitForTimeout(500);
  await page.getByLabel('グループ').selectOption({ index: 1 });
  await page.waitForTimeout(500);
  await page.getByLabel('材料').selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // 候補溶媒を選択
  const checkboxes = page.locator('main').getByRole('checkbox');
  const count = await checkboxes.count();
  for (let i = 0; i < Math.min(3, count); i++) {
    await checkboxes.nth(i).check();
  }

  // 最適化実行
  await page.locator('main button.bg-blue-600').click();
  await page.waitForTimeout(3000);

  // 結果テーブルが表示される
  await expect(page.locator('th', { hasText: 'Ra' })).toBeVisible({ timeout: 10000 });
  const rows = page.locator('main table tbody tr');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);
});

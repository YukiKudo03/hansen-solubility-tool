/**
 * E2E テストヘルパー
 */
import { _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import path from 'path';

const ELECTRON_PATH = require('electron') as unknown as string;

/**
 * ナビゲーションからタブを選択する（MD3 NavigationDrawer対応）
 * サイドバー内のサブ項目を探し、必要ならカテゴリを展開してからクリック
 */
export async function clickTab(page: Page, tabText: string): Promise<void> {
  const drawer = page.locator('[data-testid="navigation-drawer"]');

  // サブ項目（data-nav-type="item"）を優先検索
  const subItem = drawer.locator('button[data-nav-type="item"]', { hasText: tabText });
  if (await subItem.first().isVisible().catch(() => false)) {
    await subItem.first().click();
    return;
  }

  // 見えない場合、カテゴリヘッダーを展開してからサブ項目を探す
  const categoryButtons = drawer.locator('button[data-nav-type="category"]');
  const buttonCount = await categoryButtons.count();
  for (let i = 0; i < buttonCount; i++) {
    const btn = categoryButtons.nth(i);
    await btn.click();
    await page.waitForTimeout(200);
    const item = drawer.locator('button[data-nav-type="item"]', { hasText: tabText });
    if (await item.first().isVisible().catch(() => false)) {
      await item.first().click();
      return;
    }
  }

  // フォールバック: drawerスコープ内でサブ項目を直接検索
  await drawer.locator('button[data-nav-type="item"]').getByText(tabText, { exact: true }).first().click();
}

export async function launchApp(): Promise<{ app: ElectronApplication; page: Page }> {
  const app = await electron.launch({
    executablePath: ELECTRON_PATH,
    args: [path.join(__dirname, '../../.')],
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });
  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000); // DB初期化+シードデータ投入を待つ
  return { app, page };
}

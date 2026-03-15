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

  // まずサイドバー内に直接テキストが見えるか確認
  const directItem = drawer.locator('button', { hasText: tabText });
  if (await directItem.first().isVisible().catch(() => false)) {
    await directItem.first().click();
    return;
  }

  // 見えない場合、各カテゴリヘッダーをクリックして展開
  const categoryHeaders = drawer.locator('button').filter({ has: page.locator('span.text-lg') });
  const count = await categoryHeaders.count();
  for (let i = 0; i < count; i++) {
    await categoryHeaders.nth(i).click();
    await page.waitForTimeout(200);
    const item = drawer.locator('button', { hasText: tabText });
    if (await item.first().isVisible().catch(() => false)) {
      await item.first().click();
      return;
    }
  }

  // フォールバック: getByTextで直接検索
  await page.getByText(tabText, { exact: true }).first().click();
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

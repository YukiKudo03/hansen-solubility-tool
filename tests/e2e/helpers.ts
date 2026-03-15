/**
 * E2E テストヘルパー
 */
import { _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import path from 'path';

const ELECTRON_PATH = require('electron') as unknown as string;

/**
 * タブをクリックする（スクロールして可視化してからクリック）
 */
export async function clickTab(page: Page, tabText: string): Promise<void> {
  const tab = page.locator('nav button', { hasText: tabText });
  await tab.scrollIntoViewIfNeeded();
  await tab.click();
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

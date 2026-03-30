/**
 * 全機能画面キャプチャスクリプト
 * Playwright Electron APIで全タブを巡回し、計算前/後のスクリーンショットを撮影
 */
import { _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import path from 'path';

const ELECTRON_PATH = require('electron') as unknown as string;
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');

async function clickTab(page: Page, tabText: string): Promise<boolean> {
  const drawer = page.locator('[data-testid="navigation-drawer"]');

  // Try direct sub-item first
  const subItem = drawer.locator('button[data-nav-type="item"]', { hasText: tabText });
  if (await subItem.first().isVisible().catch(() => false)) {
    await subItem.first().click();
    return true;
  }

  // Expand categories
  const categoryButtons = drawer.locator('button[data-nav-type="category"]');
  const count = await categoryButtons.count();
  for (let i = 0; i < count; i++) {
    await categoryButtons.nth(i).click();
    await page.waitForTimeout(200);
    const item = drawer.locator('button[data-nav-type="item"]', { hasText: tabText });
    if (await item.first().isVisible().catch(() => false)) {
      await item.first().click();
      return true;
    }
  }
  return false;
}

async function tryExecute(page: Page): Promise<boolean> {
  // Try clicking various execute buttons
  const buttons = [
    page.locator('main button.bg-blue-600').first(),
    page.locator('main button', { hasText: '実行' }).first(),
    page.locator('main button', { hasText: 'スクリーニング' }).first(),
    page.locator('main button', { hasText: '評価' }).first(),
    page.locator('main button', { hasText: '推定' }).first(),
    page.locator('main button', { hasText: '計算' }).first(),
  ];

  for (const btn of buttons) {
    try {
      if (await btn.isVisible({ timeout: 500 }) && await btn.isEnabled({ timeout: 500 })) {
        await btn.click();
        await page.waitForTimeout(2000);
        return true;
      }
    } catch { /* continue */ }
  }
  return false;
}

async function selectFirstOption(page: Page): Promise<void> {
  // Select first available option in each select dropdown
  const selects = page.locator('main select');
  const count = await selects.count();
  for (let i = 0; i < count; i++) {
    try {
      const sel = selects.nth(i);
      if (await sel.isVisible({ timeout: 300 })) {
        await sel.selectOption({ index: 1 });
        await page.waitForTimeout(300);
      }
    } catch { /* skip */ }
  }
}

async function main() {
  console.log('Launching Electron app...');
  const app = await electron.launch({
    executablePath: ELECTRON_PATH,
    args: [path.join(__dirname, '..')],
    env: { ...process.env, NODE_ENV: 'test' },
  });

  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000); // DB init + seed

  // Get all tabs from navigation
  const tabs: string[] = [
    // 評価
    '溶解性評価', '接触角推定', '膨潤度予測', '耐薬品性予測', '接着性予測',
    '環境応力亀裂', 'ブレンド相溶性', 'リサイクル相溶性',
    '添加剤移行', 'フレーバースカルピング', '包装材溶出', 'リポソーム透過性',
    '残留溶媒', 'コーティング欠陥', 'レジスト現像', '吸入薬適合性',
    'タンパク質凝集', 'ガス透過性', '膜分離選択性',
    'インク-基材密着', '多層コーティング密着', '粘着テープ剥離強度',
    '構造接着設計', 'バイオ燃料適合', '結晶溶解温度', 'ハイドロゲル膨潤',
    'ゴム配合', '繊維染色性', '印刷電子濡れ性', '封止材適合', '多形リスク',
    // 選定
    'ナノ粒子分散', '分散剤選定', '可塑剤選定', 'キャリア選定',
    '共結晶スクリーニング', '3D印刷平滑化', '誘電体膜品質', '賦形剤適合性',
    '相溶化剤選定', '香料カプセル化', '経皮吸収促進剤',
    'CO2吸収材', '水素貯蔵材料', '顔料分散', 'CNT/グラフェン分散',
    'MXene分散', 'NP薬物ローディング', 'UVフィルター適合',
    'バイオ製剤バッファー', '硬化剤選定', 'QDリガンド交換', 'PCMカプセル化',
    '天然色素抽出', '精油抽出', '土壌汚染抽出',
    // 最適化
    'ブレンド最適化', '薬物溶解性', '比較レポート', 'HSP球算出',
    'グリーン溶媒', '多目的選定', 'ペロブスカイト溶媒', '有機半導体膜',
    'UV硬化インク', '超臨界CO2', '多成分最適化', 'LiB電解液',
    '溶媒代替', 'エマルション安定性', '洗浄剤配合', '防落書き', 'プライマーレス接着',
    // データ
    'データベース編集', '混合溶媒', '履歴',
    // 分析
    '3D可視化', 'Teasプロット', 'Bagleyプロット', '2D射影', '族寄与法',
    'コポリマーHSP推定', '温度HSP補正', '圧力HSP補正',
    '逆HSP推定', 'HSP不確かさ', '表面HSP決定', 'IL/DES HSP',
    'HSP推算(QSPR)', 'MD結果インポート', '族寄与法(拡張)', '表面処理効果',
    // 設定
    '設定',
  ];

  let captured = 0;
  let failed: string[] = [];
  let issues: string[] = [];

  for (const tab of tabs) {
    const slug = tab.replace(/[\/\s]/g, '_').replace(/[()]/g, '');
    console.log(`[${captured + 1}/${tabs.length}] ${tab}...`);

    const found = await clickTab(page, tab);
    if (!found) {
      console.log(`  ⚠ Tab not found: ${tab}`);
      failed.push(tab);
      continue;
    }
    await page.waitForTimeout(500);

    // Screenshot: before execution
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${String(captured + 1).padStart(2, '0')}_${slug}_before.png`), fullPage: false });

    // Try to select options and execute
    await selectFirstOption(page);
    await page.waitForTimeout(300);
    const executed = await tryExecute(page);

    if (executed) {
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${String(captured + 1).padStart(2, '0')}_${slug}_after.png`), fullPage: false });
    }

    // Check for visible errors
    const errorAlert = page.locator('[role="alert"]');
    if (await errorAlert.isVisible().catch(() => false)) {
      const errorText = await errorAlert.textContent().catch(() => '');
      issues.push(`${tab}: Error alert visible - "${errorText?.slice(0, 80)}"`);
    }

    // Check if main content area is empty (potential rendering issue)
    const mainContent = page.locator('main');
    const mainText = await mainContent.textContent().catch(() => '');
    if (mainText && mainText.trim().length < 10) {
      issues.push(`${tab}: Main content appears empty`);
    }

    captured++;
  }

  console.log(`\n=== Capture Complete ===`);
  console.log(`Captured: ${captured}/${tabs.length}`);
  console.log(`Failed to find: ${failed.length}`);
  if (failed.length > 0) console.log(`  ${failed.join(', ')}`);
  console.log(`Issues found: ${issues.length}`);
  issues.forEach(i => console.log(`  - ${i}`));

  await app.close();
}

main().catch(e => { console.error(e); process.exit(1); });

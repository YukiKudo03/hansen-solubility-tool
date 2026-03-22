/**
 * E2Eテスト: 全93タブナビゲーション検証
 * 全タブに遷移し、エラーなしでレンダリングされることを確認
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

// 全タブ定義（navigation.tsと一致）
const ALL_TABS = [
  // 評価カテゴリ
  '溶解性評価', '接触角推定', '膨潤度予測', '耐薬品性予測', '接着性予測',
  '環境応力亀裂(ESC)', 'ブレンド相溶性', 'リサイクル相溶性',
  '添加剤移行', 'フレーバースカルピング', '包装材溶出',
  'リポソーム透過性', '残留溶媒', 'コーティング欠陥', 'レジスト現像',
  '吸入薬適合性', 'タンパク質凝集', 'ガス透過性', '膜分離選択性',
  'インク-基材密着', '多層コーティング密着', '粘着テープ剥離強度',
  '構造接着設計', 'バイオ燃料適合', '結晶溶解温度', 'ハイドロゲル膨潤',
  'ゴム配合', '繊維染色性', '印刷電子濡れ性', '封止材適合', '多形リスク',
  // 選定カテゴリ
  'ナノ粒子分散', '分散剤選定', '可塑剤選定', 'キャリア選定',
  '共結晶スクリーニング', '3D印刷平滑化', '誘電体膜品質', '賦形剤適合性',
  '相溶化剤選定', '香料カプセル化', '経皮吸収促進剤',
  'CO2吸収材', '水素貯蔵材料', '顔料分散', 'CNT/グラフェン分散',
  'MXene分散', 'NP薬物ローディング', 'UVフィルター適合',
  'バイオ製剤バッファー', '硬化剤選定', 'QDリガンド交換', 'PCMカプセル化',
  '天然色素抽出', '精油抽出', '土壌汚染抽出',
  // 最適化カテゴリ
  'ブレンド最適化', '薬物溶解性', '比較レポート', 'HSP球算出',
  'グリーン溶媒', '多目的選定', 'ペロブスカイト溶媒', '有機半導体膜',
  'UV硬化インク', '超臨界CO2', '多成分最適化', 'LiB電解液',
  '溶媒代替', 'エマルション安定性', '洗浄剤配合', '防落書き', 'プライマーレス接着',
  // データカテゴリ
  'データベース編集', '混合溶媒', '履歴',
  // 分析カテゴリ
  '3D可視化', 'Teasプロット', 'Bagleyプロット', '2D射影', '族寄与法',
  'コポリマーHSP推定', '温度HSP補正', '圧力HSP補正',
  '逆HSP推定', 'HSP不確かさ', '表面HSP決定', 'IL/DES HSP',
  'HSP推算(QSPR)', 'MD結果インポート', '族寄与法(拡張)', '表面処理効果',
  // 設定
  '設定',
];

for (const tab of ALL_TABS) {
  test(`タブ "${tab}" が正常にレンダリングされる`, async () => {
    await clickTab(page, tab);
    await page.waitForTimeout(300);

    // エラーバウンダリが表示されていないことを確認
    const errorBoundary = page.locator('text=エラーが発生しました');
    const hasError = await errorBoundary.isVisible().catch(() => false);
    expect(hasError, `タブ "${tab}" でエラーが発生`).toBe(false);

    // メインコンテンツエリアにコンテンツが存在することを確認
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
}

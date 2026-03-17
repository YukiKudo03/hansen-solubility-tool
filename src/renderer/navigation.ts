/**
 * ナビゲーション定義 — タブID・ラベル・カテゴリのマスターデータ
 */

export type Tab =
  | 'report' | 'contactAngle' | 'swelling' | 'chemicalResistance'
  | 'nanoDispersion' | 'plasticizer' | 'carrierSelection'
  | 'blendOptimizer' | 'drugSolubility'
  | 'database' | 'mixture'
  | 'history' | 'comparison' | 'hspVisualization'
  | 'settings';

export interface NavItem {
  id: Tab;
  label: string;
}

export interface NavCategory {
  id: string;
  label: string;
  icon: string;
  items: NavItem[];
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'evaluation',
    label: '評価',
    icon: '📊',
    items: [
      { id: 'report', label: '溶解性評価' },
      { id: 'contactAngle', label: '接触角推定' },
      { id: 'swelling', label: '膨潤度予測' },
      { id: 'chemicalResistance', label: '耐薬品性予測' },
    ],
  },
  {
    id: 'selection',
    label: '選定',
    icon: '🔍',
    items: [
      { id: 'nanoDispersion', label: 'ナノ粒子分散' },
      { id: 'plasticizer', label: '可塑剤選定' },
      { id: 'carrierSelection', label: 'キャリア選定' },
    ],
  },
  {
    id: 'optimization',
    label: '最適化',
    icon: '⚡',
    items: [
      { id: 'blendOptimizer', label: 'ブレンド最適化' },
      { id: 'drugSolubility', label: '薬物溶解性' },
      { id: 'comparison', label: '比較レポート' },
      { id: 'hspVisualization', label: '3D可視化' },
    ],
  },
  {
    id: 'data',
    label: 'データ',
    icon: '💾',
    items: [
      { id: 'database', label: 'データベース編集' },
      { id: 'mixture', label: '混合溶媒' },
      { id: 'history', label: '履歴' },
    ],
  },
  {
    id: 'config',
    label: '設定',
    icon: '⚙️',
    items: [
      { id: 'settings', label: '設定' },
    ],
  },
];

export const ALL_TABS: NavItem[] = NAV_CATEGORIES.flatMap((c) => c.items);

export function getCategoryForTab(tabId: Tab): NavCategory | undefined {
  return NAV_CATEGORIES.find((c) => c.items.some((item) => item.id === tabId));
}

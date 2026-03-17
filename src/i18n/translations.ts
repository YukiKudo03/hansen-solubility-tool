/**
 * 多言語翻訳キー定義
 */

export const SUPPORTED_LANGUAGES = ['ja', 'en'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const jaTranslations: Record<string, string> = {
  // アプリ
  'app.title': 'Hansen溶解度パラメータ 溶解性評価ツール',

  // ナビゲーション
  'nav.evaluation': '評価',
  'nav.selection': '選定',
  'nav.optimization': '最適化',
  'nav.data': 'データ',
  'nav.settings': '設定',
  'nav.solubility': '溶解性評価',
  'nav.contactAngle': '接触角推定',
  'nav.swelling': '膨潤度予測',
  'nav.chemicalResistance': '耐薬品性予測',
  'nav.nanoDispersion': 'ナノ粒子分散',
  'nav.plasticizer': '可塑剤選定',
  'nav.carrierSelection': 'キャリア選定',
  'nav.blendOptimizer': 'ブレンド最適化',
  'nav.drugSolubility': '薬物溶解性',
  'nav.comparison': '比較レポート',
  'nav.hspVisualization': '3D可視化',
  'nav.database': 'データベース編集',
  'nav.mixture': '混合溶媒',
  'nav.history': '履歴',

  // 共通
  'common.save': '保存',
  'common.cancel': 'キャンセル',
  'common.delete': '削除',
  'common.csvExport': 'CSV出力',
  'common.evaluate': '評価実行',
  'common.loading': '読み込み中...',
  'common.noData': 'データがありません',
  'common.selectGroup': '部品グループを選択',
  'common.selectSolvent': '溶媒を選択',
  'common.searchSolvent': '溶媒名・英語名・CAS番号で検索...',

  // 設定
  'settings.theme': 'テーマ設定',
  'settings.thresholds': 'リスク判定閾値設定',
  'settings.themeLight': 'ライト',
  'settings.themeDark': 'ダーク',
  'settings.themeSystem': 'システム',
  'settings.save': '保存',
  'settings.saved': '保存しました',
  'settings.resetDefaults': 'デフォルトに戻す',

  // 評価
  'evaluation.results': '評価結果',
  'evaluation.evaluating': '評価中...',
  'evaluation.partName': '部品名',
  'evaluation.materialType': '材料種別',
  'evaluation.ra': 'Ra',
  'evaluation.red': 'RED',
  'evaluation.riskLevel': 'リスクレベル',

  // 履歴
  'history.title': '評価履歴',
  'history.empty': '履歴がありません',
  'history.all': 'すべて',

  // ブックマーク
  'bookmark.save': '☆ 保存',
  'bookmark.nameLabel': 'ブックマーク名',
  'bookmark.namePlaceholder': 'ブックマーク名を入力...',
};

export const enTranslations: Record<string, string> = {
  // App
  'app.title': 'Hansen Solubility Parameter Evaluation Tool',

  // Navigation
  'nav.evaluation': 'Evaluation',
  'nav.selection': 'Selection',
  'nav.optimization': 'Optimization',
  'nav.data': 'Data',
  'nav.settings': 'Settings',
  'nav.solubility': 'Solubility',
  'nav.contactAngle': 'Contact Angle',
  'nav.swelling': 'Swelling',
  'nav.chemicalResistance': 'Chemical Resistance',
  'nav.nanoDispersion': 'Nanoparticle Dispersion',
  'nav.plasticizer': 'Plasticizer',
  'nav.carrierSelection': 'Carrier Selection',
  'nav.blendOptimizer': 'Blend Optimizer',
  'nav.drugSolubility': 'Drug Solubility',
  'nav.comparison': 'Comparison Report',
  'nav.hspVisualization': '3D Visualization',
  'nav.database': 'Database Editor',
  'nav.mixture': 'Mixture Lab',
  'nav.history': 'History',

  // Common
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.csvExport': 'Export CSV',
  'common.evaluate': 'Evaluate',
  'common.loading': 'Loading...',
  'common.noData': 'No data',
  'common.selectGroup': 'Select Parts Group',
  'common.selectSolvent': 'Select Solvent',
  'common.searchSolvent': 'Search by name, English name, or CAS number...',

  // Settings
  'settings.theme': 'Theme',
  'settings.thresholds': 'Risk Threshold Settings',
  'settings.themeLight': 'Light',
  'settings.themeDark': 'Dark',
  'settings.themeSystem': 'System',
  'settings.save': 'Save',
  'settings.saved': 'Saved',
  'settings.resetDefaults': 'Reset to Defaults',

  // Evaluation
  'evaluation.results': 'Results',
  'evaluation.evaluating': 'Evaluating...',
  'evaluation.partName': 'Part Name',
  'evaluation.materialType': 'Material Type',
  'evaluation.ra': 'Ra',
  'evaluation.red': 'RED',
  'evaluation.riskLevel': 'Risk Level',

  // History
  'history.title': 'Evaluation History',
  'history.empty': 'No history',
  'history.all': 'All',

  // Bookmark
  'bookmark.save': '☆ Save',
  'bookmark.nameLabel': 'Bookmark Name',
  'bookmark.namePlaceholder': 'Enter bookmark name...',
};

/**
 * ナビゲーション定義 — タブID・ラベル・カテゴリのマスターデータ
 */

export type Tab =
  | 'report' | 'contactAngle' | 'swelling' | 'chemicalResistance'
  | 'nanoDispersion' | 'plasticizer' | 'carrierSelection' | 'dispersantSelection'
  | 'blendOptimizer' | 'drugSolubility'
  | 'adhesion' | 'teasPlot' | 'bagleyPlot' | 'projection2d'
  | 'sphereFitting' | 'greenSolvent' | 'multiObjective' | 'groupContribution'
  | 'database' | 'mixture'
  | 'history' | 'comparison' | 'hspVisualization'
  | 'escPipeline' | 'cocrystalScreening' | 'printing3dSmoothing' | 'dielectricFilm' | 'excipientCompatibility'
  | 'polymerBlendMiscibility' | 'polymerRecyclingCompatibility' | 'compatibilizerSelection' | 'copolymerHspEstimation'
  | 'additiveMigration' | 'flavorScalping' | 'foodPackagingMigration'
  | 'fragranceEncapsulation' | 'transdermalEnhancer' | 'liposomePermeability'
  | 'inkSubstrateAdhesion' | 'multilayerCoatingAdhesion' | 'psaPeelStrength'
  | 'structuralAdhesiveJoint' | 'surfaceTreatmentQuantification'
  | 'pigmentDispersion' | 'cntGrapheneDispersion' | 'mxeneDispersion' | 'nanoparticleDrugLoading'
  | 'gasPermeability' | 'membraneSeparation' | 'co2Absorbent' | 'hydrogenStorage'
  | 'sunscreenUVFilter' | 'inhalationDrug' | 'proteinAggregation' | 'biologicBuffer'
  | 'cleaningFormulation' | 'naturalDyeExtraction' | 'essentialOilExtraction'
  | 'soilRemediation' | 'residualSolvent'
  | 'temperatureHspCorrection' | 'pressureHspCorrection' | 'supercriticalCO2'
  | 'coatingDefect' | 'photoresistDeveloper' | 'perovskiteSolvent' | 'organicSemiconductorFilm' | 'uvCurableInk'
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
      { id: 'adhesion', label: '接着性予測' },
      { id: 'escPipeline', label: '環境応力亀裂(ESC)' },
      { id: 'polymerBlendMiscibility', label: 'ブレンド相溶性' },
      { id: 'polymerRecyclingCompatibility', label: 'リサイクル相溶性' },
      { id: 'additiveMigration', label: '添加剤移行' },
      { id: 'flavorScalping', label: 'フレーバースカルピング' },
      { id: 'foodPackagingMigration', label: '包装材溶出' },
      { id: 'liposomePermeability', label: 'リポソーム透過性' },
      { id: 'inkSubstrateAdhesion', label: 'インク-基材密着' },
      { id: 'multilayerCoatingAdhesion', label: '多層コーティング密着' },
      { id: 'psaPeelStrength', label: '粘着テープ剥離強度' },
      { id: 'structuralAdhesiveJoint', label: '構造接着設計' },
      { id: 'gasPermeability', label: 'ガス透過性' },
      { id: 'membraneSeparation', label: '膜分離選択性' },
      { id: 'inhalationDrug', label: '吸入薬適合性' },
      { id: 'proteinAggregation', label: 'タンパク質凝集' },
      { id: 'residualSolvent', label: '残留溶媒' },
      { id: 'coatingDefect', label: 'コーティング欠陥' },
      { id: 'photoresistDeveloper', label: 'レジスト現像' },
    ],
  },
  {
    id: 'selection',
    label: '選定',
    icon: '🔍',
    items: [
      { id: 'nanoDispersion', label: 'ナノ粒子分散' },
      { id: 'dispersantSelection', label: '分散剤選定' },
      { id: 'plasticizer', label: '可塑剤選定' },
      { id: 'carrierSelection', label: 'キャリア選定' },
      { id: 'cocrystalScreening', label: '共結晶スクリーニング' },
      { id: 'printing3dSmoothing', label: '3D印刷平滑化' },
      { id: 'dielectricFilm', label: '誘電体膜品質' },
      { id: 'excipientCompatibility', label: '賦形剤適合性' },
      { id: 'compatibilizerSelection', label: '相溶化剤選定' },
      { id: 'fragranceEncapsulation', label: '香料カプセル化' },
      { id: 'transdermalEnhancer', label: '経皮吸収促進剤' },
      { id: 'pigmentDispersion', label: '顔料分散' },
      { id: 'cntGrapheneDispersion', label: 'CNT/グラフェン分散' },
      { id: 'mxeneDispersion', label: 'MXene分散' },
      { id: 'nanoparticleDrugLoading', label: 'NP薬物ローディング' },
      { id: 'co2Absorbent', label: 'CO2吸収材' },
      { id: 'hydrogenStorage', label: '水素貯蔵材料' },
      { id: 'sunscreenUVFilter', label: 'UVフィルター適合' },
      { id: 'biologicBuffer', label: 'バイオ製剤バッファー' },
      { id: 'naturalDyeExtraction', label: '天然色素抽出' },
      { id: 'essentialOilExtraction', label: '精油抽出' },
      { id: 'soilRemediation', label: '土壌汚染抽出' },
    ],
  },
  {
    id: 'optimization',
    label: '最適化',
    icon: '⚡',
    items: [
      { id: 'blendOptimizer', label: 'ブレンド最適化' },
      { id: 'supercriticalCO2', label: '超臨界CO2' },
      { id: 'cleaningFormulation', label: '洗浄剤配合' },
      { id: 'drugSolubility', label: '薬物溶解性' },
      { id: 'comparison', label: '比較レポート' },
      { id: 'sphereFitting', label: 'HSP球算出' },
      { id: 'greenSolvent', label: 'グリーン溶媒' },
      { id: 'multiObjective', label: '多目的選定' },
      { id: 'perovskiteSolvent', label: 'ペロブスカイト溶媒' },
      { id: 'organicSemiconductorFilm', label: '有機半導体膜' },
      { id: 'uvCurableInk', label: 'UV硬化インク' },
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
    id: 'analysis',
    label: '分析',
    icon: '📈',
    items: [
      { id: 'hspVisualization', label: '3D可視化' },
      { id: 'teasPlot', label: 'Teasプロット' },
      { id: 'bagleyPlot', label: 'Bagleyプロット' },
      { id: 'projection2d', label: '2D射影' },
      { id: 'groupContribution', label: '族寄与法' },
      { id: 'copolymerHspEstimation', label: 'コポリマーHSP推定' },
      { id: 'surfaceTreatmentQuantification', label: '表面処理効果' },
      { id: 'temperatureHspCorrection', label: '温度HSP補正' },
      { id: 'pressureHspCorrection', label: '圧力HSP補正' },
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

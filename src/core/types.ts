/**
 * Hansen溶解度パラメータ ドメイン型定義
 */

/** HSP三成分値 (単位: MPa^(1/2)) */
export interface HSPValues {
  deltaD: number; // 分散力項
  deltaP: number; // 極性項
  deltaH: number; // 水素結合項
}

/** 部品（ポリマー材料） */
export interface Part {
  id: number;
  groupId: number;
  name: string;
  materialType: string | null;
  hsp: HSPValues;
  r0: number; // 相互作用半径
  notes: string | null;
}

/** 部品グループ */
export interface PartsGroup {
  id: number;
  name: string;
  description: string | null;
  parts: Part[];
}

/** 溶媒 */
export interface Solvent {
  id: number;
  name: string;
  nameEn: string | null;
  casNumber: string | null;
  hsp: HSPValues;
  molarVolume: number | null;    // cm³/mol
  molWeight: number | null;      // g/mol
  boilingPoint: number | null;   // 沸点 (°C)
  viscosity: number | null;      // 粘度 (mPa·s, 25°C)
  specificGravity: number | null; // 比重 (25°C, 水=1)
  surfaceTension: number | null; // 表面張力 (mN/m, 25°C)
  notes: string | null;
}

/** 混合溶媒の成分 */
export interface MixtureComponent {
  solvent: Solvent;
  volumeRatio: number; // 体積比（正の数値）
}

/** 混合溶媒の計算結果 */
export interface MixtureSolventResult {
  name: string;
  hsp: HSPValues;
  molarVolume: number | null;
  molWeight: number | null;
  boilingPoint: number | null;
  viscosity: number | null;
  specificGravity: number | null;
  surfaceTension: number | null;
  compositionNote: string; // 組成情報テキスト（DB保存用）
}

/** リスクレベル (1=最も危険, 5=安全) */
export enum RiskLevel {
  Dangerous = 1, // 危険（間違いなく溶解する）
  Warning = 2,   // 要警戒（おそらく溶解する）
  Caution = 3,   // 要注意（溶解の危険がある）
  Hold = 4,      // 保留（長期間の使用で膨潤の危険）
  Safe = 5,      // 安全（おそらく溶解しない）
}

/** RED値の5段階閾値設定 */
export interface RiskThresholds {
  dangerousMax: number; // default: 0.5
  warningMax: number;   // default: 0.8
  cautionMax: number;   // default: 1.2
  holdMax: number;      // default: 2.0
}

/** 個別部品の評価結果 */
export interface PartEvaluationResult {
  part: Part;
  solvent: Solvent;
  ra: number;
  red: number;
  riskLevel: RiskLevel;
}

/** グループ全体の評価結果 */
export interface GroupEvaluationResult {
  partsGroup: PartsGroup;
  solvent: Solvent;
  results: PartEvaluationResult[];
  evaluatedAt: Date;
  thresholdsUsed: RiskThresholds;
}

// ─── ナノ粒子分散系 ───────────────────────────

/** ナノ粒子カテゴリ */
export type NanoParticleCategory =
  | 'carbon'       // カーボン系（CNT, グラフェン, フラーレン）
  | 'metal'        // 金属（Ag, Au, Cu）
  | 'metal_oxide'  // 金属酸化物（TiO₂, ZnO, SiO₂, ZrO₂）
  | 'quantum_dot'  // 量子ドット（CdSe, ZnS, InP）
  | 'polymer'      // 高分子ナノ粒子
  | 'other';       // その他

/** ナノ粒子 */
export interface NanoParticle {
  id: number;
  name: string;
  nameEn: string | null;
  category: NanoParticleCategory;
  coreMaterial: string;          // 母材（例: TiO₂, Ag, SWCNT）
  surfaceLigand: string | null;  // 表面修飾剤（例: オレイルアミン, PVP）
  hsp: HSPValues;                // 表面HSP（リガンド込み）
  r0: number;                    // 相互作用半径
  particleSize: number | null;   // 粒子径 (nm)
  notes: string | null;
}

/** 分散性レベル (1=最良, 5=不可) — RED値が小さいほど良好 */
export enum DispersibilityLevel {
  Excellent = 1, // 優秀（HSP球の深部）
  Good = 2,      // 良好
  Fair = 3,      // 可能（HSP球の境界付近）
  Poor = 4,      // 不良（球外だが近い）
  Bad = 5,       // 不可（明確に球外）
}

/** 分散性閾値設定 */
export interface DispersibilityThresholds {
  excellentMax: number; // default: 0.5
  goodMax: number;      // default: 0.8
  fairMax: number;      // default: 1.0
  poorMax: number;      // default: 1.5
}

/** 個別溶媒の分散性評価結果 */
export interface SolventDispersibilityResult {
  nanoParticle: NanoParticle;
  solvent: Solvent;
  ra: number;
  red: number;
  dispersibility: DispersibilityLevel;
}

/** ナノ粒子に対する全溶媒スクリーニング結果 */
export interface NanoDispersionEvaluationResult {
  nanoParticle: NanoParticle;
  results: SolventDispersibilityResult[];
  evaluatedAt: Date;
  thresholdsUsed: DispersibilityThresholds;
}

/** 溶媒物性制約（スクリーニング用フィルタ） */
export interface SolventConstraints {
  maxBoilingPoint?: number;
  minBoilingPoint?: number;
  maxViscosity?: number;
  maxSurfaceTension?: number;
}

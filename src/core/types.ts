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

// ─── 接触角推定系 ───────────────────────────

/** 濡れ性レベル (1=最も濡れやすい, 6=最も撥水) */
export enum WettabilityLevel {
  SuperHydrophilic = 1, // 超親水 (θ < 10°)
  Hydrophilic = 2,      // 親水 (10° ≤ θ < 30°)
  Wettable = 3,         // 濡れ性良好 (30° ≤ θ < 60°)
  Moderate = 4,         // 中間 (60° ≤ θ < 90°)
  Hydrophobic = 5,      // 疎水 (90° ≤ θ < 150°)
  SuperHydrophobic = 6, // 超撥水 (θ ≥ 150°)
}

/** 濡れ性閾値設定 (接触角の閾値, 単位: °) */
export interface WettabilityThresholds {
  superHydrophilicMax: number; // default: 10
  hydrophilicMax: number;      // default: 30
  wettableMax: number;         // default: 60
  moderateMax: number;         // default: 90
  hydrophobicMax: number;      // default: 150
}

/** 個別部品の接触角推定結果 */
export interface ContactAngleResult {
  part: Part;
  solvent: Solvent;
  surfaceTensionLV: number;   // 液体表面張力 γ_LV (mN/m)
  surfaceEnergySV: number;    // 固体表面エネルギー γ_SV (mN/m)
  interfacialTension: number; // 界面張力 γ_SL (mN/m)
  cosTheta: number;           // cos(θ)
  contactAngle: number;       // 接触角 θ (°)
  wettability: WettabilityLevel;
}

/** グループ全体の接触角推定結果 */
export interface GroupContactAngleResult {
  partsGroup: PartsGroup;
  solvent: Solvent;
  results: ContactAngleResult[];
  evaluatedAt: Date;
}

// ─── 膨潤度予測系 ───────────────────────────

/** 膨潤レベル (1=最も膨潤, 5=膨潤なし) — RED小=膨潤大 */
export enum SwellingLevel {
  Severe = 1,     // 著しい膨潤（溶解に近い）
  High = 2,       // 高膨潤
  Moderate = 3,   // 中程度の膨潤
  Low = 4,        // 軽微な膨潤
  Negligible = 5, // 膨潤なし
}

/** 膨潤度閾値設定 (RED値ベース) */
export interface SwellingThresholds {
  severeMax: number;    // default: 0.5
  highMax: number;      // default: 0.8
  moderateMax: number;  // default: 1.0
  lowMax: number;       // default: 1.5
}

/** 膨潤度予測結果 */
export interface SwellingResult {
  part: Part;
  solvent: Solvent;
  ra: number;
  red: number;
  swellingLevel: SwellingLevel;
}

/** グループ全体の膨潤度予測結果 */
export interface GroupSwellingResult {
  partsGroup: PartsGroup;
  solvent: Solvent;
  results: SwellingResult[];
  evaluatedAt: Date;
  thresholdsUsed: SwellingThresholds;
}

// ─── 薬物溶解性予測系 ───────────────────────────

/** 薬物（有効成分） */
export interface Drug {
  id: number;
  name: string;
  nameEn: string | null;
  casNumber: string | null;
  hsp: HSPValues;
  r0: number;
  molWeight: number | null;
  logP: number | null;
  therapeuticCategory: string | null;
  notes: string | null;
}

/** 薬物溶解性レベル (1=最良, 5=不溶) — RED小=溶解性良好 */
export enum DrugSolubilityLevel {
  Excellent = 1, // 優秀な溶解性（HSP球の深部）
  Good = 2,      // 良好な溶解性
  Partial = 3,   // 部分的に溶解（境界付近）
  Poor = 4,      // 溶解性低い
  Insoluble = 5, // 不溶
}

/** 薬物溶解性閾値設定 (RED値ベース) */
export interface DrugSolubilityThresholds {
  excellentMax: number;  // default: 0.5
  goodMax: number;       // default: 0.8
  partialMax: number;    // default: 1.0
  poorMax: number;       // default: 1.5
}

/** 薬物溶解性予測結果 */
export interface DrugSolubilityResult {
  drug: Drug;
  solvent: Solvent;
  ra: number;
  red: number;
  solubility: DrugSolubilityLevel;
}

/** 薬物に対する全溶媒スクリーニング結果 */
export interface DrugSolubilityScreeningResult {
  drug: Drug;
  results: DrugSolubilityResult[];
  evaluatedAt: Date;
  thresholdsUsed: DrugSolubilityThresholds;
}

// ─── 溶剤ブレンド最適化系 ───────────────────────────

/** ブレンド最適化の入力（コア層） */
export interface BlendOptimizationInput {
  targetHSP: HSPValues;
  candidateSolvents: Solvent[];
  maxComponents: 2 | 3;
  stepSize: number;   // default: 0.05 (5%), 有効範囲: 0 < stepSize <= 1
  topN: number;       // default: 20
}

/** ブレンド最適化の個別結果 */
export interface BlendResult {
  components: { solvent: Solvent; volumeFraction: number }[];
  blendHSP: HSPValues;
  ra: number;
}

/** ブレンド最適化の全体結果 */
export interface BlendOptimizationResult {
  targetHSP: HSPValues;
  topResults: BlendResult[];
  evaluatedAt: Date;
}

// ─── 塗膜耐薬品性予測系 ───────────────────────────

/** 耐薬品性レベル (1=耐性なし, 5=優秀な耐性) — RED大=耐性良好（他の分類と解釈方向が逆） */
export enum ChemicalResistanceLevel {
  NoResistance = 1,   // 耐性なし（塗膜が溶解・剥離）
  Poor = 2,           // 低耐性
  Moderate = 3,       // 中程度の耐性
  Good = 4,           // 良好な耐性
  Excellent = 5,      // 優秀な耐性
}

/** 耐薬品性閾値設定 (RED値ベース) — RED大=良好 */
export interface ChemicalResistanceThresholds {
  noResistanceMax: number;  // default: 0.5
  poorMax: number;          // default: 0.8
  moderateMax: number;      // default: 1.2
  goodMax: number;          // default: 2.0
}

/** 個別部品の耐薬品性予測結果 */
export interface ChemicalResistanceResult {
  part: Part;
  solvent: Solvent;
  ra: number;
  red: number;
  resistanceLevel: ChemicalResistanceLevel;
}

/** グループ全体の耐薬品性予測結果 */
export interface GroupChemicalResistanceResult {
  partsGroup: PartsGroup;
  solvent: Solvent;
  results: ChemicalResistanceResult[];
  evaluatedAt: Date;
  thresholdsUsed: ChemicalResistanceThresholds;
}

// ─── 可塑剤選定支援系 ───────────────────────────

/** 可塑剤相溶性レベル (1=最良, 5=不相溶) — RED小=相溶性良好 */
export enum PlasticizerCompatibilityLevel {
  Excellent = 1,    // 優秀な相溶性
  Good = 2,         // 良好
  Fair = 3,         // 可能（境界付近）
  Poor = 4,         // 不良
  Incompatible = 5, // 不相溶
}

/** 可塑剤相溶性閾値設定 (RED値ベース) */
export interface PlasticizerCompatibilityThresholds {
  excellentMax: number;  // default: 0.5
  goodMax: number;       // default: 0.8
  fairMax: number;       // default: 1.0
  poorMax: number;       // default: 1.5
}

/** 可塑剤スクリーニング結果 */
export interface PlasticizerScreeningResult {
  part: Part;
  solvent: Solvent;
  ra: number;
  red: number;
  compatibility: PlasticizerCompatibilityLevel;
}

/** ポリマーに対する全可塑剤スクリーニング結果 */
export interface PlasticizerEvaluationResult {
  part: Part;
  results: PlasticizerScreeningResult[];
  evaluatedAt: Date;
  thresholdsUsed: PlasticizerCompatibilityThresholds;
}

// ─── 薬物送達キャリア選定系（DDS）───────────────────────────

/** キャリア適合性レベル (1=最良, 5=不適) — RED小=適合性良好 */
export enum CarrierCompatibilityLevel {
  Excellent = 1,    // 優秀な適合性（高カプセル化効率）
  Good = 2,         // 良好
  Fair = 3,         // 可能（境界付近）
  Poor = 4,         // 不良
  Incompatible = 5, // 不適
}

/** キャリア適合性閾値設定 (RED値ベース) */
export interface CarrierCompatibilityThresholds {
  excellentMax: number;  // default: 0.5
  goodMax: number;       // default: 0.8
  fairMax: number;       // default: 1.0
  poorMax: number;       // default: 1.5
}

/** キャリアスクリーニング結果 */
export interface CarrierScreeningResult {
  drug: Drug;
  carrier: Part;
  ra: number;
  red: number;
  compatibility: CarrierCompatibilityLevel;
}

/** 薬物に対する全キャリアスクリーニング結果 */
export interface CarrierEvaluationResult {
  drug: Drug;
  results: CarrierScreeningResult[];
  evaluatedAt: Date;
  thresholdsUsed: CarrierCompatibilityThresholds;
}

// ─── 接着性予測系 ───────────────────────────

// AdhesionLevel, AdhesionThresholds は src/core/adhesion.ts で定義
import { AdhesionLevel } from './adhesion';
import type { AdhesionThresholds } from './adhesion';
export { AdhesionLevel, type AdhesionThresholds };

/** 接着性予測結果 */
export interface AdhesionResult {
  part: Part;
  solvent: Solvent;
  ra: number;
  adhesionLevel: AdhesionLevel;
}

/** グループ全体の接着性予測結果 */
export interface GroupAdhesionResult {
  partsGroup: PartsGroup;
  solvent: Solvent;
  results: AdhesionResult[];
  evaluatedAt: Date;
  thresholdsUsed: AdhesionThresholds;
}

// ─── HSP球フィッティング系 ───────────────────────────

/** 溶媒の溶解試験分類データ */
export interface SolventClassificationInput {
  solventId: number;
  isGood: boolean;
}

// ─── グリーン溶媒代替系 ───────────────────────────

/** グリーン溶媒代替候補結果（IPC用簡略型） */
export interface GreenSubstitutionResultDTO {
  targetSolventName: string;
  candidates: Array<{
    solventName: string;
    solventId: number;
    ra: number;
    safetyRating: string | null;
    environmentalScore: number | null;
    healthScore: number | null;
    overallScore: number;
  }>;
  evaluatedAt: Date;
}

// ─── 分散剤選定支援系 ───────────────────────────

/** 分散剤タイプ */
export type DispersantType =
  | 'polymeric'       // 高分子分散剤
  | 'surfactant'      // 界面活性剤
  | 'silane_coupling'  // シランカップリング剤
  | 'other';          // その他

/** 分散剤 */
export interface Dispersant {
  id: number;
  name: string;
  nameEn: string | null;
  dispersantType: DispersantType;
  anchorHSP: HSPValues;     // アンカー基（粒子吸着部位）のHSP
  anchorR0: number;         // アンカー基の相互作用半径
  solvationHSP: HSPValues;  // 溶媒和鎖（分散媒溶解部位）のHSP
  solvationR0: number;      // 溶媒和鎖の相互作用半径
  overallHSP: HSPValues;    // 全体HSP（フォールバック評価用）
  hlb: number | null;       // HLB値
  molWeight: number | null;  // 分子量 (g/mol)
  tradeName: string | null;  // 商品名
  manufacturer: string | null; // メーカー名
  notes: string | null;
}

/** 分散剤親和性レベル (1=最良, 5=不適) — RED小=親和性良好 */
export enum DispersantAffinityLevel {
  Excellent = 1, // 優秀（最適な分散剤候補）
  Good = 2,      // 良好
  Fair = 3,      // 可能（境界付近）
  Poor = 4,      // 不良
  Bad = 5,       // 不適
}

/** 分散剤親和性閾値設定 (RED値ベース) */
export interface DispersantAffinityThresholds {
  excellentMax: number;  // default: 0.5
  goodMax: number;       // default: 0.8
  fairMax: number;       // default: 1.0
  poorMax: number;       // default: 1.5
}

/** 分散剤スクリーニング結果（個別） */
export interface DispersantScreeningResult {
  dispersant: Dispersant;
  particle: NanoParticle;
  solvent: Solvent;
  raAnchor: number;
  redAnchor: number;
  affinityAnchor: DispersantAffinityLevel;
  raSolvation: number;
  redSolvation: number;
  affinitySolvation: DispersantAffinityLevel;
  compositeScore: number;   // 幾何平均 √(RED_a × RED_s)
  overallLevel: DispersantAffinityLevel;
}

/** フォールバック評価結果（全体HSPのみ使用） */
export interface DispersantFallbackResult {
  dispersant: Dispersant;
  particle: NanoParticle;
  solvent: Solvent;
  raOverall: number;
  redOverall: number;
  affinity: DispersantAffinityLevel;
}

/** 分散剤スクリーニング全体結果 */
export interface DispersantEvaluationResult {
  particle: NanoParticle;
  solvent: Solvent;
  results: DispersantScreeningResult[];
  evaluatedAt: Date;
  thresholdsUsed: DispersantAffinityThresholds;
}

/** 逆引き溶媒スクリーニング結果（個別） */
export interface SolventForDispersantResult {
  dispersant: Dispersant;
  particle: NanoParticle;
  solvent: Solvent;
  raAnchor: number;
  redAnchor: number;
  affinityAnchor: DispersantAffinityLevel;
  raSolvation: number;
  redSolvation: number;
  affinitySolvation: DispersantAffinityLevel;
  compositeScore: number;
  overallLevel: DispersantAffinityLevel;
}

/** 逆引き溶媒スクリーニング全体結果 */
export interface SolventForDispersantEvaluationResult {
  particle: NanoParticle;
  dispersant: Dispersant;
  results: SolventForDispersantResult[];
  evaluatedAt: Date;
  thresholdsUsed: DispersantAffinityThresholds;
}

// ─── ブックマーク系 ─────────────────────────────────

/** ブックマーク対象パイプライン */
export type BookmarkPipeline =
  | 'risk' | 'contactAngle' | 'swelling' | 'chemicalResistance'
  | 'nanoDispersion' | 'plasticizer' | 'carrierSelection'
  | 'blendOptimizer' | 'drugSolubility' | 'adhesion'
  | 'dispersantSelection';

/** ブックマークのパラメータ（パイプラインごとに異なるが共通型で扱う） */
export type BookmarkParams = Record<string, unknown>;

/** ブックマーク */
export interface Bookmark {
  id: number;
  name: string;
  pipeline: BookmarkPipeline;
  params: BookmarkParams;
  createdAt: Date;
}

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

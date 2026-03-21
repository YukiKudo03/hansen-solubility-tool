/**
 * NL06: ESC (環境応力亀裂) バンド型リスク判定
 *
 * Environmental Stress Cracking (ESC) はポリマーが応力下で
 * 特定の溶媒に接触したときに起こる亀裂現象。
 *
 * HSPベースの予測: REDが中間帯（0.7-1.3）にあるとき最も危険。
 * - RED < dissolutionMax (0.7): 溶媒がポリマーを溶解/著しく膨潤（ESCではなく溶解）
 * - dissolutionMax ≤ RED ≤ escMax (0.7-1.3): ESC危険帯
 * - RED > escMax (1.3): 相互作用不足で安全
 *
 * 参考文献:
 * - Hansen (2000) "Prediction of Environmental Stress Cracking with Hansen
 *   Solubility Parameters" Ind. Eng. Chem. Res. 39:4422-4426
 * - Pirika ESC Chapter (ESC-adjusted spheres)
 */

/** ESCリスクレベル */
export enum ESCRiskLevel {
  /** RED < 0.7: 溶解/著しい膨潤（ESCよりも深刻な溶解） */
  Dissolution = 1,
  /** 0.7 ≤ RED ≤ 1.3: ESC危険帯（環境応力亀裂リスクが最大） */
  HighRisk = 2,
  /** RED > 1.3: 相互作用不足で安全 */
  Safe = 3,
}

/** ESC閾値 */
export interface ESCThresholds {
  /** 溶解ゾーン上限 (RED < この値 → 溶解) */
  dissolutionMax: number;
  /** ESC危険帯上限 (RED > この値 → 安全) */
  escMax: number;
}

/** デフォルトESC閾値 (Hansen 2000) */
export const DEFAULT_ESC_THRESHOLDS: ESCThresholds = {
  dissolutionMax: 0.7,
  escMax: 1.3,
};

/** ESCリスクレベルの表示情報 */
export interface ESCRiskLevelInfo {
  level: ESCRiskLevel;
  label: string;
  labelJa: string;
  description: string;
}

const ESC_RISK_INFO: Record<ESCRiskLevel, ESCRiskLevelInfo> = {
  [ESCRiskLevel.Dissolution]: {
    level: ESCRiskLevel.Dissolution,
    label: 'Dissolution',
    labelJa: '溶解',
    description: 'Solvent dissolves or severely swells the polymer. More severe than ESC.',
  },
  [ESCRiskLevel.HighRisk]: {
    level: ESCRiskLevel.HighRisk,
    label: 'High Risk',
    labelJa: '危険（ESC）',
    description: 'Environmental stress cracking zone. Maximum risk of cracking under stress.',
  },
  [ESCRiskLevel.Safe]: {
    level: ESCRiskLevel.Safe,
    label: 'Safe',
    labelJa: '安全',
    description: 'Insufficient solvent-polymer interaction. Low ESC risk.',
  },
};

/**
 * RED値からESCリスクをバンド型で判定する
 *
 * @param red - 相対エネルギー差 (Ra / R0)
 * @param thresholds - ESC閾値（デフォルト: dissolutionMax=0.7, escMax=1.3）
 * @returns ESCリスクレベル
 */
export function classifyESCRisk(
  red: number,
  thresholds: ESCThresholds = DEFAULT_ESC_THRESHOLDS
): ESCRiskLevel {
  if (red < 0) throw new Error('RED must be non-negative');

  if (red < thresholds.dissolutionMax) {
    return ESCRiskLevel.Dissolution;
  }
  if (red <= thresholds.escMax) {
    return ESCRiskLevel.HighRisk;
  }
  return ESCRiskLevel.Safe;
}

/**
 * ESCリスクレベルの表示情報を取得する
 */
export function getESCRiskLevelInfo(level: ESCRiskLevel): ESCRiskLevelInfo {
  return ESC_RISK_INFO[level];
}

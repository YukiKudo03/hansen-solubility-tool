/**
 * タンパク質凝集リスク評価
 *
 * RED値に基づいて、タンパク質の緩衝液中での安定性（凝集リスク）を評価する。
 * RED小 → タンパク質表面が溶媒和されて安定
 * RED大 → 溶媒和不十分で凝集リスク
 *
 * RED < 0.8: Stable（安定）
 * 0.8 <= RED < 1.2: AtRisk（凝集リスクあり）
 * RED >= 1.2: HighRisk（高凝集リスク）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 安定性レベル */
export enum ProteinStabilityLevel {
  Stable = 'Stable',
  AtRisk = 'AtRisk',
  HighRisk = 'HighRisk',
}

/** 安定性閾値 */
export interface ProteinStabilityThresholds {
  stableMax: number;    // default: 0.8
  atRiskMax: number;    // default: 1.2
}

/** デフォルト閾値 */
export const DEFAULT_PROTEIN_STABILITY_THRESHOLDS: ProteinStabilityThresholds = {
  stableMax: 0.8,
  atRiskMax: 1.2,
};

/** 安定性レベル情報 */
export interface ProteinStabilityLevelInfo {
  level: ProteinStabilityLevel;
  label: string;
  description: string;
  color: string;
}

const PROTEIN_STABILITY_LEVEL_INFO: Record<ProteinStabilityLevel, ProteinStabilityLevelInfo> = {
  [ProteinStabilityLevel.Stable]: {
    level: ProteinStabilityLevel.Stable,
    label: '安定',
    description: 'タンパク質表面が十分に溶媒和',
    color: 'green',
  },
  [ProteinStabilityLevel.AtRisk]: {
    level: ProteinStabilityLevel.AtRisk,
    label: '凝集リスク',
    description: '条件により凝集の可能性あり',
    color: 'yellow',
  },
  [ProteinStabilityLevel.HighRisk]: {
    level: ProteinStabilityLevel.HighRisk,
    label: '高凝集リスク',
    description: '凝集・沈殿の可能性が高い',
    color: 'red',
  },
};

/**
 * RED値からタンパク質安定性レベルを判定する
 */
export function classifyProteinStability(
  red: number,
  thresholds: ProteinStabilityThresholds = DEFAULT_PROTEIN_STABILITY_THRESHOLDS,
): ProteinStabilityLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.stableMax) return ProteinStabilityLevel.Stable;
  if (red < thresholds.atRiskMax) return ProteinStabilityLevel.AtRisk;
  return ProteinStabilityLevel.HighRisk;
}

/**
 * 安定性レベルの表示情報を取得する
 */
export function getProteinStabilityLevelInfo(level: ProteinStabilityLevel): ProteinStabilityLevelInfo {
  return PROTEIN_STABILITY_LEVEL_INFO[level];
}

/** タンパク質凝集リスク評価結果 */
export interface ProteinAggregationResult {
  proteinSurfaceHSP: HSPValues;
  bufferHSP: HSPValues;
  ra: number;
  red: number;
  stability: ProteinStabilityLevel;
  evaluatedAt: Date;
}

/**
 * タンパク質の緩衝液中での凝集リスクを評価する
 *
 * @param proteinSurfaceHSP - タンパク質表面のHSP値
 * @param bufferHSP - 緩衝液のHSP値
 * @param bufferR0 - 緩衝液の相互作用半径
 * @param thresholds - 安定性閾値（省略時デフォルト）
 * @returns 凝集リスク評価結果
 */
export function evaluateProteinAggregationRisk(
  proteinSurfaceHSP: HSPValues,
  bufferHSP: HSPValues,
  bufferR0: number,
  thresholds: ProteinStabilityThresholds = DEFAULT_PROTEIN_STABILITY_THRESHOLDS,
): ProteinAggregationResult {
  const ra = calculateRa(proteinSurfaceHSP, bufferHSP);
  const red = calculateRed(proteinSurfaceHSP, bufferHSP, bufferR0);
  const stability = classifyProteinStability(red, thresholds);

  return {
    proteinSurfaceHSP,
    bufferHSP,
    ra,
    red,
    stability,
    evaluatedAt: new Date(),
  };
}

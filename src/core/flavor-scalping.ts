/**
 * フレーバースカルピング予測 — 包装材とアロマ成分間のRED値に基づく吸着リスク評価
 *
 * RED値が小さい = 相溶性高い = アロマ成分が包装材に吸着されやすい = High (スカルピング)
 * RED値が大きい = 相溶性低い = アロマ成分が保持される = Low
 */
import { calculateRa, calculateRed } from './hsp';
import type { Part, Solvent } from './types';

/** スカルピングレベル */
export enum ScalpingLevel {
  High = 'High',        // 高いスカルピングリスク（吸着されやすい）
  Moderate = 'Moderate', // 中程度のリスク
  Low = 'Low',           // 低リスク（保持される）
}

/** スカルピング閾値 (RED値ベース) */
export interface ScalpingThresholds {
  highMax: number;     // default: 0.8 — RED ≤ highMax → High
  moderateMax: number; // default: 1.2 — RED ≤ moderateMax → Moderate, else Low
}

export const DEFAULT_SCALPING_THRESHOLDS: ScalpingThresholds = {
  highMax: 0.8,
  moderateMax: 1.2,
};

/** スカルピング分類 */
export function classifyScalping(red: number, thresholds: ScalpingThresholds): ScalpingLevel {
  if (red <= thresholds.highMax) return ScalpingLevel.High;
  if (red <= thresholds.moderateMax) return ScalpingLevel.Moderate;
  return ScalpingLevel.Low;
}

/** 個別スクリーニング結果 */
export interface FlavorScalpingResult {
  aroma: Solvent;
  packaging: Part;
  ra: number;
  red: number;
  scalpingLevel: ScalpingLevel;
}

/** 全体スクリーニング結果 */
export interface FlavorScalpingEvaluationResult {
  packaging: Part;
  results: FlavorScalpingResult[];
  evaluatedAt: Date;
  thresholdsUsed: ScalpingThresholds;
}

/** 全アロマ成分をスクリーニング */
export function screenFlavorScalping(
  packaging: Part,
  aromas: Solvent[],
  thresholds: ScalpingThresholds,
): FlavorScalpingEvaluationResult {
  const results: FlavorScalpingResult[] = aromas.map((aroma) => {
    const ra = calculateRa(packaging.hsp, aroma.hsp);
    const red = calculateRed(packaging.hsp, aroma.hsp, packaging.r0);
    const scalpingLevel = classifyScalping(red, thresholds);
    return { aroma, packaging, ra, red, scalpingLevel };
  });

  // RED昇順（吸着されやすい順）
  results.sort((a, b) => a.red - b.red);

  return {
    packaging,
    results,
    evaluatedAt: new Date(),
    thresholdsUsed: thresholds,
  };
}

/** レベル情報取得 */
export function getScalpingLevelInfo(level: ScalpingLevel): { label: string; description: string } {
  switch (level) {
    case ScalpingLevel.High: return { label: 'High', description: '高いスカルピングリスク' };
    case ScalpingLevel.Moderate: return { label: 'Moderate', description: '中程度のリスク' };
    case ScalpingLevel.Low: return { label: 'Low', description: '低リスク' };
  }
}

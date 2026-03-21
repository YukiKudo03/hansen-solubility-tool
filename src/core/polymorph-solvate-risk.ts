/**
 * 多形/溶媒和物リスク評価
 *
 * 医薬品原薬(API)に対する溶媒群の多形変換・溶媒和物形成リスクを評価する。
 * RED値の中間帯(0.5-1.5)にある溶媒は、ESC類似のバンド判定により
 * 多形変換や溶媒和物の形成を引き起こすリスクがある。
 *
 * 判定基準:
 * - RED < 0.5: 完全溶解リスク（結晶が溶解し、再結晶時に多形変換の可能性）
 * - 0.5 ≤ RED < 1.0: 高リスク帯（溶媒和物・水和物形成の可能性大）
 * - 1.0 ≤ RED < 1.5: 中リスク帯（部分的な溶媒和物形成の可能性）
 * - RED ≥ 1.5: 低リスク（溶媒和物形成は起こりにくい）
 *
 * 参考文献:
 * - Bauer et al. (2001) Pharm. Res. 18:859 (solvent-mediated polymorphism)
 * - Gu & Grant (2001) J. Pharm. Sci. 90:1277
 */

import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 多形/溶媒和物リスクレベル */
export enum PolymorphRiskLevel {
  DissolutionRisk = 1,  // 完全溶解リスク（RED < 0.5）
  HighRisk = 2,         // 高リスク（0.5 ≤ RED < 1.0）
  MediumRisk = 3,       // 中リスク（1.0 ≤ RED < 1.5）
  LowRisk = 4,          // 低リスク（RED ≥ 1.5）
}

/** 多形リスク閾値 */
export interface PolymorphRiskThresholds {
  dissolutionMax: number;  // default: 0.5
  highRiskMax: number;     // default: 1.0
  mediumRiskMax: number;   // default: 1.5
}

/** デフォルト閾値 */
export const DEFAULT_POLYMORPH_RISK_THRESHOLDS: PolymorphRiskThresholds = {
  dissolutionMax: 0.5,
  highRiskMax: 1.0,
  mediumRiskMax: 1.5,
};

/** 多形リスク個別結果 */
export interface PolymorphRiskResult {
  solvent: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  riskLevel: PolymorphRiskLevel;
}

/** 多形リスクレベル情報 */
const POLYMORPH_RISK_INFO: Record<PolymorphRiskLevel, { label: string; labelEn: string; description: string }> = {
  [PolymorphRiskLevel.DissolutionRisk]: { label: '溶解リスク', labelEn: 'Dissolution Risk', description: '完全溶解により再結晶時に多形変換のリスク' },
  [PolymorphRiskLevel.HighRisk]: { label: '高リスク', labelEn: 'High Risk', description: '溶媒和物・水和物の形成リスクが高い' },
  [PolymorphRiskLevel.MediumRisk]: { label: '中リスク', labelEn: 'Medium Risk', description: '部分的な溶媒和物形成の可能性' },
  [PolymorphRiskLevel.LowRisk]: { label: '低リスク', labelEn: 'Low Risk', description: '溶媒和物形成は起こりにくい' },
};

/**
 * 多形リスクレベル情報を取得する
 */
export function getPolymorphRiskInfo(level: PolymorphRiskLevel): { label: string; labelEn: string; description: string } {
  return POLYMORPH_RISK_INFO[level];
}

/**
 * RED値から多形リスクレベルを分類する
 */
export function classifyPolymorphRisk(
  red: number,
  thresholds: PolymorphRiskThresholds = DEFAULT_POLYMORPH_RISK_THRESHOLDS,
): PolymorphRiskLevel {
  if (red < thresholds.dissolutionMax) return PolymorphRiskLevel.DissolutionRisk;
  if (red < thresholds.highRiskMax) return PolymorphRiskLevel.HighRisk;
  if (red < thresholds.mediumRiskMax) return PolymorphRiskLevel.MediumRisk;
  return PolymorphRiskLevel.LowRisk;
}

/**
 * 多形/溶媒和物リスクを評価する
 *
 * @param apiHSP - 原薬のHSP値
 * @param apiR0 - 原薬の相互作用半径
 * @param solvents - 評価対象の溶媒リスト
 * @param thresholds - 閾値（省略時はデフォルト）
 * @returns リスク順にソートされた結果
 */
export function evaluatePolymorphRisk(
  apiHSP: HSPValues,
  apiR0: number,
  solvents: Array<{ name: string; hsp: HSPValues }>,
  thresholds: PolymorphRiskThresholds = DEFAULT_POLYMORPH_RISK_THRESHOLDS,
): PolymorphRiskResult[] {
  const results: PolymorphRiskResult[] = solvents.map((solvent) => {
    const ra = calculateRa(apiHSP, solvent.hsp);
    const red = calculateRed(apiHSP, solvent.hsp, apiR0);
    const riskLevel = classifyPolymorphRisk(red, thresholds);

    return {
      solvent: { name: solvent.name, hsp: solvent.hsp },
      ra,
      red,
      riskLevel,
    };
  });

  // リスク順（DissolutionRisk=1 → LowRisk=4）、同リスク内はRED昇順
  results.sort((a, b) => {
    if (a.riskLevel !== b.riskLevel) return a.riskLevel - b.riskLevel;
    return a.red - b.red;
  });

  return results;
}

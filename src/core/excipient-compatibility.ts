/**
 * 賦形剤適合性評価
 *
 * 医薬品のAPI（有効成分）と賦形剤候補間のHSP距離に基づいて
 * 適合性を評価する。RED値が小さいほど相互作用が強く、
 * 製剤設計上の適合性が高い。
 *
 * RED < 1.0 → Compatible（適合）
 * 1.0 ≤ RED ≤ 1.5 → Caution（要注意）
 * RED > 1.5 → Incompatible（不適合）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 賦形剤適合性レベル */
export enum CompatibilityLevel {
  /** RED < 1.0: 適合（良好な相互作用） */
  Compatible = 1,
  /** 1.0 ≤ RED ≤ 1.5: 要注意（境界付近） */
  Caution = 2,
  /** RED > 1.5: 不適合（相互作用不足） */
  Incompatible = 3,
}

/** 賦形剤評価個別結果 */
export interface ExcipientResult {
  excipient: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  compatibility: CompatibilityLevel;
}

/** 賦形剤適合性閾値 */
export interface CompatibilityThresholds {
  /** Compatible上限 (RED < この値 → Compatible) */
  compatibleMax: number;
  /** Caution上限 (RED ≤ この値 → Caution) */
  cautionMax: number;
}

/** デフォルト賦形剤適合性閾値 */
export const DEFAULT_COMPATIBILITY_THRESHOLDS: CompatibilityThresholds = {
  compatibleMax: 1.0,
  cautionMax: 1.5,
};

/**
 * RED値から賦形剤適合性レベルを分類する
 *
 * @param red - 相対エネルギー差 (Ra / R0)
 * @param thresholds - 分類閾値（省略時はデフォルト値を使用）
 * @returns 賦形剤適合性レベル
 * @throws {Error} REDが負の場合
 */
export function classifyCompatibility(
  red: number,
  thresholds: CompatibilityThresholds = DEFAULT_COMPATIBILITY_THRESHOLDS,
): CompatibilityLevel {
  if (red < 0) throw new Error('RED must be non-negative');

  if (red < thresholds.compatibleMax) return CompatibilityLevel.Compatible;
  if (red <= thresholds.cautionMax) return CompatibilityLevel.Caution;
  return CompatibilityLevel.Incompatible;
}

/**
 * APIに対する賦形剤候補群の適合性を評価し、
 * 適合性順（Compatible→Caution→Incompatible）、同レベル内はRED昇順でソートして返す。
 *
 * @param apiHSP - APIのHSP値
 * @param apiR0 - APIの相互作用半径
 * @param excipients - スクリーニング対象の賦形剤リスト
 * @param thresholds - 分類閾値（省略時はデフォルト値を使用）
 * @returns 賦形剤評価結果（適合性順ソート済み）
 */
export function evaluateExcipientCompatibility(
  apiHSP: HSPValues,
  apiR0: number,
  excipients: Array<{ name: string; hsp: HSPValues }>,
  thresholds?: CompatibilityThresholds,
): ExcipientResult[] {
  const results: ExcipientResult[] = excipients.map((excipient) => {
    const ra = calculateRa(apiHSP, excipient.hsp);
    const red = calculateRed(apiHSP, excipient.hsp, apiR0);
    const compatibility = classifyCompatibility(red, thresholds);

    return {
      excipient: { name: excipient.name, hsp: excipient.hsp },
      ra,
      red,
      compatibility,
    };
  });

  // 適合性順（enum値昇順: Compatible=1, Caution=2, Incompatible=3）、同レベル内はRED昇順
  results.sort((a, b) => {
    if (a.compatibility !== b.compatibility) return a.compatibility - b.compatibility;
    return a.red - b.red;
  });

  return results;
}

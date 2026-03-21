/**
 * 共結晶スクリーニング — API-コフォーマーのRa/RED評価
 *
 * 医薬品のAPI（有効成分）と共結晶コフォーマー候補間の
 * HSP距離に基づいて共結晶形成の可能性を評価する。
 *
 * RED < 0.7 → Likely（形成しやすい）
 * 0.7 ≤ RED ≤ 1.0 → Possible（可能性あり）
 * RED > 1.0 → Unlikely（形成しにくい）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 共結晶形成の可能性レベル */
export enum CocrystalLikelihood {
  Likely = 1,
  Possible = 2,
  Unlikely = 3,
}

/** 共結晶スクリーニング個別結果 */
export interface CocrystalScreeningResult {
  coformer: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  likelihood: CocrystalLikelihood;
}

/** 共結晶スクリーニング閾値 */
export interface CocrystalThresholds {
  /** Likely上限 (RED < この値 → Likely) */
  likelyMax: number;
  /** Possible上限 (RED ≤ この値 → Possible) */
  possibleMax: number;
}

/** デフォルト共結晶閾値 */
export const DEFAULT_COCRYSTAL_THRESHOLDS: CocrystalThresholds = {
  likelyMax: 0.7,
  possibleMax: 1.0,
};

/**
 * RED値から共結晶形成の可能性を分類する
 *
 * @param red - 相対エネルギー差 (Ra / R0)
 * @param thresholds - 分類閾値（省略時はデフォルト値を使用）
 * @returns 共結晶形成の可能性レベル
 * @throws {Error} REDが負の場合
 */
export function classifyCocrystalLikelihood(
  red: number,
  thresholds: CocrystalThresholds = DEFAULT_COCRYSTAL_THRESHOLDS,
): CocrystalLikelihood {
  if (red < 0) throw new Error('RED must be non-negative');

  if (red < thresholds.likelyMax) return CocrystalLikelihood.Likely;
  if (red <= thresholds.possibleMax) return CocrystalLikelihood.Possible;
  return CocrystalLikelihood.Unlikely;
}

/**
 * コフォーマー候補群を共結晶形成の可能性でスクリーニングし、
 * 可能性順（Likely→Possible→Unlikely）、同レベル内はRED昇順でソートして返す。
 *
 * @param apiHSP - APIのHSP値
 * @param apiR0 - APIの相互作用半径
 * @param coformers - スクリーニング対象のコフォーマーリスト
 * @param thresholds - 分類閾値（省略時はデフォルト値を使用）
 * @returns 共結晶スクリーニング結果（可能性順ソート済み）
 */
export function screenCocrystals(
  apiHSP: HSPValues,
  apiR0: number,
  coformers: Array<{ name: string; hsp: HSPValues }>,
  thresholds?: CocrystalThresholds,
): CocrystalScreeningResult[] {
  const results: CocrystalScreeningResult[] = coformers.map((coformer) => {
    const ra = calculateRa(apiHSP, coformer.hsp);
    const red = calculateRed(apiHSP, coformer.hsp, apiR0);
    const likelihood = classifyCocrystalLikelihood(red, thresholds);

    return {
      coformer: { name: coformer.name, hsp: coformer.hsp },
      ra,
      red,
      likelihood,
    };
  });

  // 可能性順（enum値昇順: Likely=1, Possible=2, Unlikely=3）、同レベル内はRED昇順
  results.sort((a, b) => {
    if (a.likelihood !== b.likelihood) return a.likelihood - b.likelihood;
    return a.red - b.red;
  });

  return results;
}

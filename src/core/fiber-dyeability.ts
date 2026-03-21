/**
 * 繊維染色性予測
 *
 * RED値（Ra/R0）が小さい染料 → 繊維への浸透性が高い → 染色性良好
 *
 * DyeabilityLevel: Excellent / Good / Moderate / Poor
 *
 * 参考文献:
 * - Hansen (2007) "Hansen Solubility Parameters: A User's Handbook" 2nd ed.
 * - Abbott, Hansen (2008) "Hansen Solubility Parameters in Practice"
 */

import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 染料情報 */
export interface Dye {
  name: string;
  hsp: HSPValues;
}

/** 染色性レベル */
export type DyeabilityLevel = 'Excellent' | 'Good' | 'Moderate' | 'Poor';

/** 染色性情報 */
export interface DyeabilityInfo {
  level: DyeabilityLevel;
  label: string;
  description: string;
}

const DYEABILITY_INFO: Record<DyeabilityLevel, DyeabilityInfo> = {
  Excellent: {
    level: 'Excellent',
    label: '優秀',
    description: '高い染色性が期待でき、繊維への浸透が良好',
  },
  Good: {
    level: 'Good',
    label: '良好',
    description: '良好な染色性が得られる',
  },
  Moderate: {
    level: 'Moderate',
    label: '中程度',
    description: '染色条件の最適化が必要',
  },
  Poor: {
    level: 'Poor',
    label: '不良',
    description: '染色性が低く、実用上の困難が予想される',
  },
};

/** 染色性スクリーニング結果（個別） */
export interface DyeabilityResult {
  dye: Dye;
  ra: number;
  red: number;
  dyeability: DyeabilityLevel;
}

/**
 * 染色性情報を取得する
 */
export function getDyeabilityInfo(level: DyeabilityLevel): DyeabilityInfo {
  return DYEABILITY_INFO[level];
}

/**
 * RED値から染色性を判定する
 */
function classifyDyeability(red: number): DyeabilityLevel {
  if (red <= 0.5) return 'Excellent';
  if (red <= 0.8) return 'Good';
  if (red <= 1.0) return 'Moderate';
  return 'Poor';
}

/**
 * 繊維に対する染料の染色性をスクリーニングする
 *
 * @param fiberHSP - 繊維のHSP [MPa^0.5]
 * @param fiberR0 - 繊維の相互作用半径
 * @param dyes - 染料候補リスト
 * @returns 染色性スクリーニング結果（RED昇順）
 */
export function screenDyeability(
  fiberHSP: HSPValues,
  fiberR0: number,
  dyes: Dye[],
): DyeabilityResult[] {
  if (fiberR0 <= 0) throw new Error('Interaction radius (R0) must be positive');
  if (dyes.length === 0) throw new Error('At least one dye is required');

  const results: DyeabilityResult[] = dyes.map((dye) => {
    const ra = calculateRa(fiberHSP, dye.hsp);
    const red = calculateRed(fiberHSP, dye.hsp, fiberR0);
    const dyeability = classifyDyeability(red);

    return {
      dye,
      ra,
      red,
      dyeability,
    };
  });

  // RED昇順でソート（染色性が高い候補が先頭）
  results.sort((a, b) => a.red - b.red);

  return results;
}

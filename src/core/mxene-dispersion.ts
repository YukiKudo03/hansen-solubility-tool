/**
 * MXene分散最適化
 *
 * MXene(Ti3C2Tx)は親水性表面（高dP, dH）を持ち、
 * 水やDMSO系の溶媒が有効。HSP距離に基づいて最適溶媒を選定する。
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';
import { classifyDispersibility, DEFAULT_DISPERSIBILITY_THRESHOLDS } from './dispersibility';
import type { DispersibilityThresholds } from './types';
import { DispersibilityLevel } from './types';

/** MXene分散スクリーニング個別結果 */
export interface MXeneDispersionResult {
  solvent: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  dispersibility: DispersibilityLevel;
}

/**
 * MXene材料に対する溶媒群の分散性をスクリーニングする
 *
 * @param mxeneHSP - MXeneのHSP値
 * @param r0 - MXeneの相互作用半径
 * @param solvents - 溶媒リスト
 * @param thresholds - 分散性閾値（省略時デフォルト）
 * @returns スクリーニング結果（RED昇順ソート済み）
 */
export function screenMXeneDispersion(
  mxeneHSP: HSPValues,
  r0: number,
  solvents: Array<{ name: string; hsp: HSPValues }>,
  thresholds: DispersibilityThresholds = DEFAULT_DISPERSIBILITY_THRESHOLDS,
): MXeneDispersionResult[] {
  const results: MXeneDispersionResult[] = solvents.map((solvent) => {
    const ra = calculateRa(mxeneHSP, solvent.hsp);
    const red = calculateRed(mxeneHSP, solvent.hsp, r0);
    const dispersibility = classifyDispersibility(red, thresholds);
    return { solvent: { name: solvent.name, hsp: solvent.hsp }, ra, red, dispersibility };
  });

  // RED昇順ソート
  results.sort((a, b) => a.red - b.red);
  return results;
}

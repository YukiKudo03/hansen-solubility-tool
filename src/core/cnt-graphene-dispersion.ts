/**
 * CNT/グラフェン分散溶媒スクリーニング
 *
 * CNT/グラフェン系ナノ材料の分散に適した溶媒をHSP距離で選定する。
 * ナノ粒子分散評価の変種だが、CNT/Graphene特有のHSP球を使用。
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';
import { classifyDispersibility, DEFAULT_DISPERSIBILITY_THRESHOLDS } from './dispersibility';
import type { DispersibilityThresholds } from './types';
import { DispersibilityLevel } from './types';

/** CNT/グラフェン分散スクリーニング個別結果 */
export interface CNTGrapheneDispersionResult {
  solvent: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  dispersibility: DispersibilityLevel;
}

/**
 * CNT/グラフェン系ナノ材料に対する溶媒群の分散性をスクリーニングする
 *
 * @param nanomaterialHSP - ナノ材料のHSP値
 * @param r0 - ナノ材料の相互作用半径
 * @param solvents - 溶媒リスト
 * @param thresholds - 分散性閾値（省略時デフォルト）
 * @returns スクリーニング結果（RED昇順ソート済み）
 */
export function screenCNTGrapheneDispersion(
  nanomaterialHSP: HSPValues,
  r0: number,
  solvents: Array<{ name: string; hsp: HSPValues }>,
  thresholds: DispersibilityThresholds = DEFAULT_DISPERSIBILITY_THRESHOLDS,
): CNTGrapheneDispersionResult[] {
  const results: CNTGrapheneDispersionResult[] = solvents.map((solvent) => {
    const ra = calculateRa(nanomaterialHSP, solvent.hsp);
    const red = calculateRed(nanomaterialHSP, solvent.hsp, r0);
    const dispersibility = classifyDispersibility(red, thresholds);
    return { solvent: { name: solvent.name, hsp: solvent.hsp }, ra, red, dispersibility };
  });

  // RED昇順ソート（良好分散→不良の順）
  results.sort((a, b) => a.red - b.red);
  return results;
}

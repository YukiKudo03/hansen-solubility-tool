/**
 * NL14: フォトレジスト型コントラスト計算
 *
 * 露光/未露光領域のHSP変化による現像コントラストを定量する。
 *
 * 数式: Contrast = log10(Ra_unexposed / Ra_exposed)
 *
 * 正のコントラスト → ポジ型（露光部が溶けやすい）
 * 負のコントラスト → ネガ型（未露光部が溶けやすい）
 *
 * 参考文献:
 * - Ito (2005) Adv. Polym. Sci. 172:37 (Chemically Amplified Resists)
 */

import type { HSPValues } from './types';
import { calculateRa } from './hsp';

/** コントラスト品質 */
export enum ContrastQuality {
  /** コントラスト > 0.5: 高解像度パターン */
  Excellent = 1,
  /** 0.2 ≤ コントラスト ≤ 0.5: 実用レベル */
  Good = 2,
  /** 0 < コントラスト < 0.2: 低解像度 */
  Poor = 3,
  /** コントラスト < 0: 反転（ネガ型動作） */
  Inverted = 4,
}

/**
 * 現像コントラストを計算する
 *
 * @param unexposedHSP - 未露光レジストのHSP
 * @param exposedHSP - 露光後レジストのHSP
 * @param developerHSP - 現像液のHSP
 * @returns コントラスト値 log10(Ra_unexposed / Ra_exposed)
 */
export function calculateDissolutionContrast(
  unexposedHSP: HSPValues,
  exposedHSP: HSPValues,
  developerHSP: HSPValues
): number {
  const raUnexposed = calculateRa(unexposedHSP, developerHSP);
  const raExposed = calculateRa(exposedHSP, developerHSP);

  // 両方0の場合（同一HSP）はコントラスト0
  if (raUnexposed === 0 && raExposed === 0) return 0;
  // 露光側Ra=0の場合は完全溶解 → Infinity（実際にはありえないが数学的に）
  if (raExposed === 0) return Infinity;
  // 未露光側Ra=0の場合は完全ネガ
  if (raUnexposed === 0) return -Infinity;

  return Math.log10(raUnexposed / raExposed);
}

/**
 * コントラスト値から品質を判定する
 *
 * @param contrast - コントラスト値
 * @returns 品質分類
 */
export function classifyContrastQuality(contrast: number): ContrastQuality {
  if (contrast < 0) return ContrastQuality.Inverted;
  if (contrast < 0.2) return ContrastQuality.Poor;
  if (contrast <= 0.5) return ContrastQuality.Good;
  return ContrastQuality.Excellent;
}

/**
 * インク-基材密着性評価
 *
 * Wa (work of adhesion) と Ra距離の複合評価により、
 * インクと基材の密着性を予測する。
 *
 * 判定基準:
 * - Excellent: Wa > 80 AND Ra < 5
 * - Good: Wa > 60
 * - Fair: Wa > 40
 * - Poor: それ以外
 */

import type { HSPValues } from './types';
import { calculateWorkOfAdhesionFromHSP } from './work-of-adhesion';
import { calculateRa } from './hsp';

/** インク-基材密着性レベル */
export enum InkSubstrateAdhesionLevel {
  Excellent = 'Excellent',
  Good = 'Good',
  Fair = 'Fair',
  Poor = 'Poor',
}

/** インク-基材密着性評価結果 */
export interface InkSubstrateAdhesionResult {
  wa: number;
  ra: number;
  adhesionLevel: InkSubstrateAdhesionLevel;
}

/**
 * インク-基材密着性を評価する
 *
 * @param inkHSP - インクのHSP値
 * @param substrateHSP - 基材のHSP値
 * @returns 密着性評価結果
 */
export function evaluateInkSubstrateAdhesion(
  inkHSP: HSPValues,
  substrateHSP: HSPValues,
): InkSubstrateAdhesionResult {
  const wa = calculateWorkOfAdhesionFromHSP(inkHSP, substrateHSP);
  const ra = calculateRa(inkHSP, substrateHSP);

  let adhesionLevel: InkSubstrateAdhesionLevel;
  if (wa > 80 && ra < 5) {
    adhesionLevel = InkSubstrateAdhesionLevel.Excellent;
  } else if (wa > 60) {
    adhesionLevel = InkSubstrateAdhesionLevel.Good;
  } else if (wa > 40) {
    adhesionLevel = InkSubstrateAdhesionLevel.Fair;
  } else {
    adhesionLevel = InkSubstrateAdhesionLevel.Poor;
  }

  return { wa, ra, adhesionLevel };
}

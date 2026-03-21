/**
 * 粘着テープ (PSA) 剥離強度推定
 *
 * Wa → 剥離力の経験的相関:
 * F_peel ≈ k * Wa  (k: 経験定数, デフォルト 0.25 N/m per mJ/m²)
 *
 * 剥離レベル:
 * - Strong: Wa > 80
 * - Medium: 50 ≤ Wa ≤ 80
 * - Weak: Wa < 50
 */

import type { HSPValues } from './types';
import { calculateWorkOfAdhesionFromHSP } from './work-of-adhesion';

/** 剥離強度レベル */
export enum PeelLevel {
  Strong = 'Strong',
  Medium = 'Medium',
  Weak = 'Weak',
}

/** PSA剥離強度推定結果 */
export interface PSAPeelStrengthResult {
  wa: number;
  estimatedPeelForce: number; // N/m
  peelLevel: PeelLevel;
}

/** デフォルトの経験定数 k (N/m per mJ/m²) */
const DEFAULT_K = 0.25;

/**
 * PSA剥離強度を推定する
 *
 * @param psaHSP - 粘着剤のHSP値
 * @param adherendHSP - 被着体のHSP値
 * @param k - 経験定数 (デフォルト: 0.25)
 * @returns 剥離強度推定結果
 */
export function estimatePSAPeelStrength(
  psaHSP: HSPValues,
  adherendHSP: HSPValues,
  k: number = DEFAULT_K,
): PSAPeelStrengthResult {
  const wa = calculateWorkOfAdhesionFromHSP(psaHSP, adherendHSP);
  const estimatedPeelForce = k * wa;

  let peelLevel: PeelLevel;
  if (wa > 80) {
    peelLevel = PeelLevel.Strong;
  } else if (wa >= 50) {
    peelLevel = PeelLevel.Medium;
  } else {
    peelLevel = PeelLevel.Weak;
  }

  return { wa, estimatedPeelForce, peelLevel };
}

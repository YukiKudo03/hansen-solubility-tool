/**
 * 構造用接着剤接合設計
 *
 * 接着剤と2つの被着体間のWaを計算し、
 * 弱い方が接合強度のボトルネックとなる。
 *
 * 判定基準:
 * - Excellent: min(Wa1, Wa2) > 80
 * - Good: min(Wa1, Wa2) > 60
 * - Fair: min(Wa1, Wa2) > 40
 * - Poor: それ以外
 */

import type { HSPValues } from './types';
import { calculateWorkOfAdhesionFromHSP } from './work-of-adhesion';
import { calculateRa } from './hsp';

/** 接合品質レベル */
export enum JointLevel {
  Excellent = 'Excellent',
  Good = 'Good',
  Fair = 'Fair',
  Poor = 'Poor',
}

/** 接合評価結果 */
export interface JointResult {
  wa1: number;  // 接着剤-被着体1 のWa
  wa2: number;  // 接着剤-被着体2 のWa
  ra1: number;  // 接着剤-被着体1 のRa
  ra2: number;  // 接着剤-被着体2 のRa
  minWa: number;
  bottleneck: 'adherend1' | 'adherend2';
  jointLevel: JointLevel;
}

/**
 * 構造用接着剤接合を評価する
 *
 * @param adhesiveHSP - 接着剤のHSP値
 * @param adherend1HSP - 被着体1のHSP値
 * @param adherend2HSP - 被着体2のHSP値
 * @returns 接合評価結果
 */
export function evaluateStructuralJoint(
  adhesiveHSP: HSPValues,
  adherend1HSP: HSPValues,
  adherend2HSP: HSPValues,
): JointResult {
  const wa1 = calculateWorkOfAdhesionFromHSP(adhesiveHSP, adherend1HSP);
  const wa2 = calculateWorkOfAdhesionFromHSP(adhesiveHSP, adherend2HSP);
  const ra1 = calculateRa(adhesiveHSP, adherend1HSP);
  const ra2 = calculateRa(adhesiveHSP, adherend2HSP);

  const minWa = Math.min(wa1, wa2);
  const bottleneck: 'adherend1' | 'adherend2' = wa1 <= wa2 ? 'adherend1' : 'adherend2';

  let jointLevel: JointLevel;
  if (minWa > 80) {
    jointLevel = JointLevel.Excellent;
  } else if (minWa > 60) {
    jointLevel = JointLevel.Good;
  } else if (minWa > 40) {
    jointLevel = JointLevel.Fair;
  } else {
    jointLevel = JointLevel.Poor;
  }

  return { wa1, wa2, ra1, ra2, minWa, bottleneck, jointLevel };
}

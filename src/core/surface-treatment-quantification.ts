/**
 * 表面処理効果定量化
 *
 * 処理前後でターゲット（接着剤等）とのWa/Ra変化を計算し、
 * 表面処理の効果を定量的に評価する。
 *
 * improvementRatio = Wa_after / Wa_before
 */

import type { HSPValues } from './types';
import { calculateWorkOfAdhesionFromHSP } from './work-of-adhesion';
import { calculateRa } from './hsp';

/** 表面処理効果評価結果 */
export interface TreatmentResult {
  waBefore: number;
  waAfter: number;
  raBefore: number;
  raAfter: number;
  improvementRatio: number; // Wa_after / Wa_before
  raReduction: number;      // raBefore - raAfter
  isImproved: boolean;
}

/**
 * 表面処理効果を定量化する
 *
 * @param beforeHSP - 処理前の基材HSP値
 * @param afterHSP - 処理後の基材HSP値
 * @param targetHSP - ターゲット（接着剤等）のHSP値
 * @returns 表面処理効果評価結果
 */
export function quantifySurfaceTreatment(
  beforeHSP: HSPValues,
  afterHSP: HSPValues,
  targetHSP: HSPValues,
): TreatmentResult {
  const waBefore = calculateWorkOfAdhesionFromHSP(beforeHSP, targetHSP);
  const waAfter = calculateWorkOfAdhesionFromHSP(afterHSP, targetHSP);
  const raBefore = calculateRa(beforeHSP, targetHSP);
  const raAfter = calculateRa(afterHSP, targetHSP);

  const improvementRatio = waBefore > 0 ? waAfter / waBefore : Infinity;
  const raReduction = raBefore - raAfter;
  const isImproved = waAfter > waBefore;

  return {
    waBefore,
    waAfter,
    raBefore,
    raAfter,
    improvementRatio,
    raReduction,
    isImproved,
  };
}

/**
 * ハイドロゲル膨潤平衡予測
 *
 * HSP距離からFlory-Huggins chiを自動算出し、
 * Flory-Rehner方程式で平衡膨潤度を計算する。
 *
 * 結果: phiP, swellingRatio Q, chi
 *
 * 参考文献:
 * - Flory, Rehner (1943) J. Chem. Phys. 11:521
 * - Peppas et al. (2000) Eur. J. Pharm. Biopharm. 50:27
 */

import type { HSPValues } from './types';
import { calculateFloryHugginsChi } from './flory-huggins';
import { solveFloryRehner } from './flory-rehner';

/** ハイドロゲル膨潤計算結果 */
export interface HydrogelSwellingResult {
  /** 平衡ポリマー体積分率 φp */
  phiP: number;
  /** 体積膨潤度 Q = 1/φp */
  swellingRatio: number;
  /** Flory-Huggins chi パラメータ */
  chi: number;
}

/**
 * ハイドロゲルの平衡膨潤度を計算する
 *
 * HSPからchiを自動算出し、Flory-Rehner方程式を解く。
 *
 * @param gelHSP - ゲルのHSP [MPa^0.5]
 * @param solventHSP - 溶媒のHSP [MPa^0.5]
 * @param crosslinkDensity - 架橋密度 [mol/cm³]
 * @param vs - 溶媒モル体積 [cm³/mol]
 * @param temperature - 温度 [K] (デフォルト: 298.15)
 * @returns 膨潤計算結果
 */
export function calculateHydrogelSwelling(
  gelHSP: HSPValues,
  solventHSP: HSPValues,
  crosslinkDensity: number,
  vs: number,
  temperature: number = 298.15,
): HydrogelSwellingResult {
  // バリデーション
  if (crosslinkDensity <= 0) throw new Error('Crosslink density must be positive');
  if (vs <= 0) throw new Error('Solvent molar volume (Vs) must be positive');
  if (temperature <= 0) throw new Error('Temperature must be positive');

  // HSPからFlory-Huggins chiを自動算出
  const chi = calculateFloryHugginsChi(gelHSP, solventHSP, vs, temperature);

  // Flory-Rehner方程式で平衡φpを求める
  const phiP = solveFloryRehner({ chi, vs, crosslinkDensity });
  const swellingRatio = 1 / phiP;

  return {
    phiP,
    swellingRatio,
    chi,
  };
}

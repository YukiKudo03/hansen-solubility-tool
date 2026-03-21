/**
 * NL01: Flory-Huggins chi パラメータ計算 + NL03: 臨界chi
 *
 * HSP距離RaからFlory-Huggins相互作用パラメータchiを推算する。
 *
 * 参考文献:
 * - Lindvig, Michelsen, Kontogeorgis (2002) Fluid Phase Equilibria 203:247-260
 * - Hansen (2007) "Hansen Solubility Parameters: A User's Handbook" 2nd ed.
 *
 * 数式: chi = V_s * Ra^2 / (6 * R * T)
 *   V_s: 溶媒（小さい方の）モル体積 [cm³/mol]
 *   Ra: Hansen距離 [MPa^0.5]
 *   R: 気体定数 8.314 [J/(mol·K)]
 *   T: 温度 [K]
 *
 * 注: Ra² [MPa] → [J/cm³] の変換は 1:1（1 MPa = 1 J/cm³）なので
 *     chi = V_s [cm³/mol] * Ra² [J/cm³] / (6 * R [J/(mol·K)] * T [K])
 *     の次元が無次元になる。
 */

import type { HSPValues } from './types';
import { calculateRa } from './hsp';

/** 気体定数 [J/(mol·K)] */
const R_GAS = 8.314;

/**
 * Flory-Huggins chi パラメータを計算する
 *
 * @param hsp1 - 材料1（ポリマー）のHSP値 [MPa^0.5]
 * @param hsp2 - 材料2（溶媒）のHSP値 [MPa^0.5]
 * @param molarVolume - 溶媒のモル体積 [cm³/mol]
 * @param temperature - 温度 [K] (デフォルト: 298.15 = 25°C)
 * @returns chi パラメータ (無次元)
 */
export function calculateFloryHugginsChi(
  hsp1: HSPValues,
  hsp2: HSPValues,
  molarVolume: number,
  temperature: number = 298.15
): number {
  if (molarVolume <= 0) throw new Error('Molar volume must be positive');
  if (temperature <= 0) throw new Error('Temperature must be positive');

  const ra = calculateRa(hsp1, hsp2);
  const ra2 = ra * ra;

  // chi = V_s * Ra² / (6 * R * T)
  return (molarVolume * ra2) / (6 * R_GAS * temperature);
}

/**
 * 臨界chi値を計算する（ポリマーブレンドの相溶性限界）
 *
 * Flory-Huggins理論による臨界相互作用パラメータ:
 * chi_critical = 0.5 * (1/sqrt(N1) + 1/sqrt(N2))^2
 *
 * @param n1 - ポリマー1の重合度
 * @param n2 - ポリマー2の重合度（溶媒の場合 n2=1）
 * @returns chi_critical (無次元)
 */
export function calculateChiCritical(n1: number, n2: number): number {
  if (n1 <= 0 || n2 <= 0) throw new Error('Degree of polymerization must be positive');

  const term = 1 / Math.sqrt(n1) + 1 / Math.sqrt(n2);
  return 0.5 * term * term;
}

/** 相溶性判定結果 */
export type MiscibilityResult = 'miscible' | 'immiscible' | 'partial';

/**
 * chi値と臨界chiから相溶性を判定する
 *
 * @param chi - Flory-Huggins chi パラメータ
 * @param chiCritical - 臨界chi値
 * @param tolerance - 境界判定のマージン（デフォルト 5%）
 * @returns 相溶性判定
 */
export function assessMiscibility(
  chi: number,
  chiCritical: number,
  tolerance: number = 0.05
): MiscibilityResult {
  const lowerBound = chiCritical * (1 - tolerance);
  const upperBound = chiCritical * (1 + tolerance);

  if (chi < lowerBound) return 'miscible';
  if (chi > upperBound) return 'immiscible';
  return 'partial';
}

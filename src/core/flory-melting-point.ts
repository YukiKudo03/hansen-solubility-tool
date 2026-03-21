/**
 * NL05: Flory希釈理論による融点降下計算
 *
 * 結晶性ポリマーの溶解温度Tdを、溶媒との相互作用から推算する。
 *
 * 数式: 1/Td - 1/Tm0 = (R/dHu) * (Vu/V1) * (phi1 - chi*phi1^2)
 *
 * 参考文献:
 * - Flory (1953) Principles of Polymer Chemistry, Cornell University Press
 * - Tian et al. (2013) Mol. Pharmaceutics 10:236
 */

/** 気体定数 [J/(mol·K)] */
const R_GAS = 8.314;

/** 融点降下計算の入力パラメータ */
export interface MeltingPointDepressionParams {
  /** 純ポリマーの融点 [K] */
  tm0: number;
  /** 繰り返し単位あたりの融解熱 [J/mol] */
  deltaHu: number;
  /** 繰り返し単位のモル体積 [cm³/mol] */
  vu: number;
  /** 溶媒のモル体積 [cm³/mol] */
  v1: number;
  /** 溶媒の体積分率 (0-1) */
  phi1: number;
  /** Flory-Huggins chi パラメータ */
  chi: number;
}

/**
 * Flory希釈理論による溶解温度を計算する
 *
 * @param params - 融点降下パラメータ
 * @returns 溶解温度 Td [K]
 */
export function calculateDissolutionTemperature(params: MeltingPointDepressionParams): number {
  const { tm0, deltaHu, vu, v1, phi1, chi } = params;

  if (tm0 <= 0) throw new Error('Melting point must be positive');
  if (deltaHu <= 0) throw new Error('Heat of fusion must be positive');
  if (phi1 < 0 || phi1 > 1) throw new Error('Volume fraction must be between 0 and 1');

  // phi1 = 0 → 純ポリマー → Td = Tm0
  if (phi1 === 0) return tm0;

  // 1/Td = 1/Tm0 + (R/dHu) * (Vu/V1) * (phi1 - chi*phi1^2)
  const floryTerm = (R_GAS / deltaHu) * (vu / v1) * (phi1 - chi * phi1 * phi1);
  const invTd = 1 / tm0 + floryTerm;

  // invTd ≤ 0 は物理的に不合理（非常に強い相互作用の場合）
  if (invTd <= 0) return Infinity;

  return 1 / invTd;
}

/**
 * 融点降下量を計算する
 *
 * @param params - 融点降下パラメータ
 * @returns 融点降下量 dT = Tm0 - Td [K] (正の値)
 */
export function estimateMeltingPointDepression(params: MeltingPointDepressionParams): number {
  const td = calculateDissolutionTemperature(params);
  return params.tm0 - td;
}

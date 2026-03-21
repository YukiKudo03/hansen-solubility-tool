/**
 * 結晶性ポリマー溶解温度予測
 *
 * HSP距離からFlory-Huggins chiを自動算出し、
 * Flory希釈理論による溶解温度Tdを計算する。
 *
 * 入力: Tm0, dHu, Vu, V1, phi1 + ポリマー/溶媒HSP → Td
 *
 * 参考文献:
 * - Flory (1953) Principles of Polymer Chemistry
 * - Lindvig et al. (2002) Fluid Phase Equilibria 203:247
 */

import type { HSPValues } from './types';
import { calculateFloryHugginsChi } from './flory-huggins';
import { calculateDissolutionTemperature, estimateMeltingPointDepression } from './flory-melting-point';

/** 結晶性ポリマー溶解温度計算の入力パラメータ */
export interface CrystallinePolymerParams {
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
  /** 温度 [K] (chi計算用、デフォルト: 298.15) */
  temperature?: number;
}

/** 結晶性ポリマー溶解温度の計算結果 */
export interface CrystallinePolymerDissolutionResult {
  /** 溶解温度 Td [K] */
  dissolutionTemperature: number;
  /** 融点降下量 dT = Tm0 - Td [K] */
  meltingPointDepression: number;
  /** Flory-Huggins chi パラメータ */
  chi: number;
  /** 純ポリマー融点 Tm0 [K] */
  tm0: number;
  /** 溶媒の体積分率 */
  phi1: number;
}

/**
 * 結晶性ポリマーの溶解温度を計算する
 *
 * HSPからchiを自動算出し、Flory希釈理論で溶解温度を求める。
 *
 * @param polymerHSP - ポリマーのHSP [MPa^0.5]
 * @param solventHSP - 溶媒のHSP [MPa^0.5]
 * @param params - 結晶性ポリマーパラメータ
 * @returns 溶解温度計算結果
 */
export function calculatePolymerDissolutionTemp(
  polymerHSP: HSPValues,
  solventHSP: HSPValues,
  params: CrystallinePolymerParams,
): CrystallinePolymerDissolutionResult {
  const { tm0, deltaHu, vu, v1, phi1, temperature = 298.15 } = params;

  // バリデーション
  if (tm0 <= 0) throw new Error('Melting point (Tm0) must be positive');
  if (deltaHu <= 0) throw new Error('Heat of fusion (deltaHu) must be positive');
  if (vu <= 0) throw new Error('Polymer molar volume (Vu) must be positive');
  if (v1 <= 0) throw new Error('Solvent molar volume (V1) must be positive');
  if (phi1 < 0 || phi1 > 1) throw new Error('Volume fraction (phi1) must be between 0 and 1');

  // HSPからFlory-Huggins chiを自動算出
  const chi = calculateFloryHugginsChi(polymerHSP, solventHSP, v1, temperature);

  // Flory希釈理論で溶解温度を計算
  const dissolutionTemperature = calculateDissolutionTemperature({
    tm0,
    deltaHu,
    vu,
    v1,
    phi1,
    chi,
  });

  const meltingPointDepression = estimateMeltingPointDepression({
    tm0,
    deltaHu,
    vu,
    v1,
    phi1,
    chi,
  });

  return {
    dissolutionTemperature,
    meltingPointDepression,
    chi,
    tm0,
    phi1,
  };
}

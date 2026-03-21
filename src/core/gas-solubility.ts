/**
 * NL10: ガス溶解度推定 (HSPベース)
 *
 * ガス分子のHSPとポリマー膜のHSP距離から、
 * ガス透過性・溶解性の相対的な優劣を推定する。
 *
 * 原理: Ra²が小さい → ガス-ポリマー親和性が高い → 溶解度・透過性が高い
 *
 * ガスHSP値は Hansen (2007) Table A-16 に基づく。
 *
 * 参考文献:
 * - Hansen (2007) Hansen Solubility Parameters: A User's Handbook, 2nd ed.
 * - Robeson (2008) J. Membr. Sci. 320:390-400
 */

import type { HSPValues } from './types';
import { calculateRa } from './hsp';

/** ガスHSPデータベース [MPa^0.5] */
export const GAS_HSP_DATABASE: Record<string, HSPValues> = {
  CO2: { deltaD: 15.6, deltaP: 5.2, deltaH: 5.8 },
  O2: { deltaD: 14.7, deltaP: 0.0, deltaH: 0.0 },
  N2: { deltaD: 11.9, deltaP: 0.0, deltaH: 0.0 },
  CH4: { deltaD: 14.2, deltaP: 0.0, deltaH: 0.2 },
  H2: { deltaD: 5.8, deltaP: 0.0, deltaH: 0.0 },
  He: { deltaD: 3.0, deltaP: 0.0, deltaH: 0.0 },
  Ar: { deltaD: 13.1, deltaP: 0.0, deltaH: 0.0 },
  H2O: { deltaD: 15.6, deltaP: 16.0, deltaH: 42.3 },
};

/** ガス-ポリマー親和性の評価結果 */
export interface GasPolymerAffinityResult {
  gasName: string;
  gasHSP: HSPValues;
  polymerHSP: HSPValues;
  ra: number;
  ra2: number;
}

/**
 * ガス-ポリマー間のHSP親和性を評価する
 *
 * @param gasName - ガス名 (GAS_HSP_DATABASEのキー)
 * @param polymerHSP - ポリマーのHSP値
 * @returns 親和性評価結果
 */
export function estimateGasPolymerAffinity(
  gasName: string,
  polymerHSP: HSPValues
): GasPolymerAffinityResult {
  const gasHSP = GAS_HSP_DATABASE[gasName];
  if (!gasHSP) {
    throw new Error(`Unknown gas: ${gasName}. Available: ${Object.keys(GAS_HSP_DATABASE).join(', ')}`);
  }

  const ra = calculateRa(gasHSP, polymerHSP);

  return {
    gasName,
    gasHSP,
    polymerHSP,
    ra,
    ra2: ra * ra,
  };
}

/**
 * 複数ガスの透過性をRa²基準でランキングする
 *
 * Ra²が小さい（親和性が高い）順にソート。
 * Ra²が小さいほど溶解度・透過性が高いと推定される。
 *
 * @param polymerHSP - ポリマーのHSP値
 * @param gasNames - 評価するガス名リスト
 * @returns Ra²昇順でソートされたランキング
 */
export function rankGasPermeability(
  polymerHSP: HSPValues,
  gasNames: string[]
): GasPolymerAffinityResult[] {
  return gasNames
    .map(name => estimateGasPolymerAffinity(name, polymerHSP))
    .sort((a, b) => a.ra2 - b.ra2);
}

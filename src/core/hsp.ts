/**
 * Hansen溶解度パラメータ 距離・RED値計算
 *
 * Ra² = 4(δD1 - δD2)² + (δP1 - δP2)² + (δH1 - δH2)²
 * RED = Ra / R₀
 */
import type { HSPValues } from './types';

/**
 * Hansen距離 Ra を計算する
 * δDの係数4は実験データとの整合性のための経験的補正
 */
export function calculateRa(hsp1: HSPValues, hsp2: HSPValues): number {
  const dD = hsp1.deltaD - hsp2.deltaD;
  const dP = hsp1.deltaP - hsp2.deltaP;
  const dH = hsp1.deltaH - hsp2.deltaH;
  const raSquared = 4 * dD * dD + dP * dP + dH * dH;
  return Math.sqrt(raSquared);
}

/**
 * 相対エネルギー差 RED を計算する
 * @throws {Error} r0が0以下の場合
 */
export function calculateRed(hsp1: HSPValues, hsp2: HSPValues, r0: number): number {
  if (r0 <= 0) {
    throw new Error('相互作用半径 R₀ は正の値でなければなりません');
  }
  return calculateRa(hsp1, hsp2) / r0;
}

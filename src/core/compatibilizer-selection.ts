/**
 * Compatibilizer Selection — ブレンド用相溶化剤を選定する
 *
 * ブロックコポリマーの各ブロックがそれぞれのポリマー相と相溶する必要がある。
 * 各候補の両ブロックのRa/REDを計算し、effectivenessScore（幾何平均RED）でランキング。
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

export interface CompatibilizerResult {
  compatibilizer: { name: string; blockA_hsp: HSPValues; blockB_hsp: HSPValues };
  raBlockA_Polymer1: number;
  raBlockB_Polymer2: number;
  redBlockA: number;
  redBlockB: number;
  effectivenessScore: number; // sqrt(redA * redB) — 低いほど良い
}

/**
 * 相溶化剤候補をスクリーニングし、effectivenessScore昇順でソートして返す
 *
 * @param polymer1 - ポリマー1（HSP + 相互作用半径）
 * @param polymer2 - ポリマー2（HSP + 相互作用半径）
 * @param candidates - 相溶化剤候補リスト
 * @returns スクリーニング結果（effectivenessScore昇順）
 */
export function screenCompatibilizers(
  polymer1: { hsp: HSPValues; r0: number },
  polymer2: { hsp: HSPValues; r0: number },
  candidates: Array<{ name: string; blockA_hsp: HSPValues; blockB_hsp: HSPValues }>
): CompatibilizerResult[] {
  if (polymer1.r0 <= 0 || polymer2.r0 <= 0) {
    throw new Error('Interaction radius R₀ must be positive');
  }

  const results: CompatibilizerResult[] = candidates.map((candidate) => {
    const raBlockA_Polymer1 = calculateRa(candidate.blockA_hsp, polymer1.hsp);
    const raBlockB_Polymer2 = calculateRa(candidate.blockB_hsp, polymer2.hsp);
    const redBlockA = calculateRed(candidate.blockA_hsp, polymer1.hsp, polymer1.r0);
    const redBlockB = calculateRed(candidate.blockB_hsp, polymer2.hsp, polymer2.r0);
    const effectivenessScore = Math.sqrt(redBlockA * redBlockB);

    return {
      compatibilizer: {
        name: candidate.name,
        blockA_hsp: candidate.blockA_hsp,
        blockB_hsp: candidate.blockB_hsp,
      },
      raBlockA_Polymer1,
      raBlockB_Polymer2,
      redBlockA,
      redBlockB,
      effectivenessScore,
    };
  });

  // effectivenessScore昇順（低いほど良い）
  results.sort((a, b) => a.effectivenessScore - b.effectivenessScore);

  return results;
}

/**
 * Polymer Recycling Compatibility — リサイクル混合ポリマーの相溶性マトリクス生成
 *
 * N個のポリマーについて N×(N-1)/2 の組み合わせを評価し、
 * 各ペアの相溶性をFlory-Huggins理論で判定する。
 */
import type { HSPValues } from './types';
import { evaluatePolymerBlendMiscibility } from './polymer-blend-miscibility';

export interface RecyclingCompatibilityResult {
  polymer1Name: string;
  polymer2Name: string;
  ra: number;
  chi: number;
  chiCritical: number;
  miscibility: 'miscible' | 'immiscible' | 'partial';
}

/**
 * N×Nマトリクス（対角除く、上三角）を生成する
 *
 * @param polymers - ポリマーリスト
 * @param referenceVolume - 繰り返し単位参照体積 [cm³/mol]
 * @param temperature - 温度 [K]（デフォルト: 298.15 = 25°C）
 * @returns 全ペアの相溶性評価結果
 */
export function evaluateRecyclingCompatibilityMatrix(
  polymers: Array<{ name: string; hsp: HSPValues; degreeOfPolymerization: number }>,
  referenceVolume: number,
  temperature: number = 298.15
): RecyclingCompatibilityResult[] {
  if (polymers.length < 2) {
    throw new Error('At least 2 polymers are required');
  }

  const results: RecyclingCompatibilityResult[] = [];

  for (let i = 0; i < polymers.length; i++) {
    for (let j = i + 1; j < polymers.length; j++) {
      const blend = evaluatePolymerBlendMiscibility(
        polymers[i],
        polymers[j],
        referenceVolume,
        temperature
      );

      results.push({
        polymer1Name: polymers[i].name,
        polymer2Name: polymers[j].name,
        ra: blend.ra,
        chi: blend.chi,
        chiCritical: blend.chiCritical,
        miscibility: blend.miscibility,
      });
    }
  }

  return results;
}

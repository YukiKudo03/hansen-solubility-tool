/**
 * Copolymer HSP Estimation — モノマー組成比からコポリマーのHSPを推算する
 *
 * 体積分率加重平均による線形混合則:
 *   dD_cop = Σ(φi * dDi)
 *   dP_cop = Σ(φi * dPi)
 *   dH_cop = Σ(φi * dHi)
 */
import type { HSPValues } from './types';

export interface CopolymerHSPResult {
  blendHSP: HSPValues;
  components: Array<{ name: string; hsp: HSPValues; fraction: number }>;
}

/**
 * モノマー組成比からコポリマーのHSPを体積分率加重平均で推算する
 *
 * @param monomers - モノマーリスト（名前、HSP、体積分率）
 * @returns コポリマーHSP推算結果
 * @throws {Error} モノマーが0個の場合
 * @throws {Error} 分率合計が1.0でない場合（±0.01の許容誤差）
 * @throws {Error} 分率が負の場合
 */
export function estimateCopolymerHSP(
  monomers: Array<{ name: string; hsp: HSPValues; fraction: number }>
): CopolymerHSPResult {
  if (monomers.length === 0) {
    throw new Error('At least one monomer is required');
  }

  for (const m of monomers) {
    if (m.fraction < 0) {
      throw new Error(`Fraction must be non-negative: ${m.name} has fraction ${m.fraction}`);
    }
  }

  const totalFraction = monomers.reduce((sum, m) => sum + m.fraction, 0);
  if (Math.abs(totalFraction - 1.0) > 0.01) {
    throw new Error(
      `Sum of fractions must equal 1.0 (got ${totalFraction.toFixed(4)})`
    );
  }

  const blendHSP: HSPValues = {
    deltaD: monomers.reduce((sum, m) => sum + m.fraction * m.hsp.deltaD, 0),
    deltaP: monomers.reduce((sum, m) => sum + m.fraction * m.hsp.deltaP, 0),
    deltaH: monomers.reduce((sum, m) => sum + m.fraction * m.hsp.deltaH, 0),
  };

  return {
    blendHSP,
    components: monomers.map((m) => ({
      name: m.name,
      hsp: m.hsp,
      fraction: m.fraction,
    })),
  };
}

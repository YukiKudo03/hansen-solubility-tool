/**
 * NL04: Flory-Rehner膨潤平衡計算のテスト
 *
 * 数式: ln(1-φp) + φp + χ·φp² = -Vs·νe·(φp^(1/3) - φp/2)
 *   φp: ポリマー体積分率 (膨潤平衡時)
 *   χ: Flory-Huggins相互作用パラメータ
 *   Vs: 溶媒モル体積 [cm³/mol]
 *   νe: 架橋密度 [mol/cm³]
 *   Q = 1/φp: 膨潤度
 *
 * 文献:
 * - Flory, Rehner (1943) J. Chem. Phys. 11:521
 * - Mark, Erman (2007) Rubberlike Elasticity
 *
 * 検証値:
 * - 天然ゴム(NR)-トルエン系: χ≈0.39, νe≈1e-4 mol/cm³ → Q≈5-8
 * - PDMS-トルエン系: χ≈0.46, νe≈2e-4 → Q≈3-5
 */
import { describe, it, expect } from 'vitest';

import {
  solveFloryRehner,
  calculateSwellingRatio,
} from '../../src/core/flory-rehner';

describe('solveFloryRehner', () => {
  it('NR-トルエン系: φp が 0.1-0.3 の範囲', () => {
    // 天然ゴム-トルエン: χ=0.39, Vs=106.8 cm³/mol, νe=1e-4 mol/cm³
    const phiP = solveFloryRehner({
      chi: 0.39,
      vs: 106.8,
      crosslinkDensity: 1e-4,
    });
    expect(phiP).toBeGreaterThan(0.05);
    expect(phiP).toBeLessThan(0.4);
  });

  it('PDMS-トルエン系: φp が NR系より大きい（架橋密度が高い）', () => {
    const phiP_NR = solveFloryRehner({ chi: 0.39, vs: 106.8, crosslinkDensity: 1e-4 });
    const phiP_PDMS = solveFloryRehner({ chi: 0.46, vs: 106.8, crosslinkDensity: 2e-4 });
    // 架橋密度大 + chi大 → φp大（膨潤少）
    expect(phiP_PDMS).toBeGreaterThan(phiP_NR);
  });

  it('χ増加でφpが増加する（膨潤度が減少）', () => {
    const params = { vs: 106.8, crosslinkDensity: 1e-4 };
    const phiP_low = solveFloryRehner({ ...params, chi: 0.2 });
    const phiP_high = solveFloryRehner({ ...params, chi: 0.8 });
    expect(phiP_high).toBeGreaterThan(phiP_low);
  });

  it('架橋密度増加でφpが増加する（膨潤度が減少）', () => {
    const params = { chi: 0.4, vs: 106.8 };
    const phiP_low = solveFloryRehner({ ...params, crosslinkDensity: 5e-5 });
    const phiP_high = solveFloryRehner({ ...params, crosslinkDensity: 5e-4 });
    expect(phiP_high).toBeGreaterThan(phiP_low);
  });

  it('φpは常に0-1の範囲', () => {
    const phiP = solveFloryRehner({ chi: 0.5, vs: 100, crosslinkDensity: 1e-4 });
    expect(phiP).toBeGreaterThan(0);
    expect(phiP).toBeLessThan(1);
  });

  it('良溶媒(χ<0.5)で大きく膨潤する(Q>3)', () => {
    const phiP = solveFloryRehner({ chi: 0.3, vs: 106.8, crosslinkDensity: 1e-4 });
    const Q = 1 / phiP;
    expect(Q).toBeGreaterThan(3);
  });

  it('貧溶媒(χ>1)では殆ど膨潤しない(Q<2)', () => {
    const phiP = solveFloryRehner({ chi: 1.5, vs: 106.8, crosslinkDensity: 1e-4 });
    const Q = 1 / phiP;
    expect(Q).toBeLessThan(3);
  });
});

describe('calculateSwellingRatio', () => {
  it('Q = 1/φp', () => {
    const { phiP, swellingRatio } = calculateSwellingRatio({
      chi: 0.39, vs: 106.8, crosslinkDensity: 1e-4,
    });
    expect(swellingRatio).toBeCloseTo(1 / phiP, 5);
  });

  it('NR-トルエン系: Q ≈ 5-8（文献値範囲内）', () => {
    const { swellingRatio } = calculateSwellingRatio({
      chi: 0.39, vs: 106.8, crosslinkDensity: 1e-4,
    });
    expect(swellingRatio).toBeGreaterThan(3);
    expect(swellingRatio).toBeLessThan(15);
  });
});

/**
 * 粘着テープ (PSA) 剥離強度推定のテスト
 *
 * 文献参考:
 * - Owens-Wendt surface energy model
 * - Empirical peel force correlation (Wa → F_peel)
 */
import { describe, it, expect } from 'vitest';

import {
  estimatePSAPeelStrength,
  PeelLevel,
} from '../../src/core/psa-peel-strength';

describe('estimatePSAPeelStrength', () => {
  it('Acrylic PSA on high-SE substrate → Strong (Wa>80)', () => {
    // Acrylic PSA: dD=19, dP=9, dH=9
    // High-SE substrate: dD=19.5, dP=10, dH=10
    // Expected: Wa≈80+
    const result = estimatePSAPeelStrength(
      { deltaD: 19, deltaP: 9, deltaH: 9 },
      { deltaD: 19.5, deltaP: 10, deltaH: 10 },
    );

    expect(result.wa).toBeGreaterThan(80);
    expect(result.peelLevel).toBe(PeelLevel.Strong);
    expect(result.estimatedPeelForce).toBeGreaterThan(0);
  });

  it('Acrylic PSA (dD=17.5,dP=7,dH=9) on Glass (dD=15.5,dP=12,dH=15.9) → Medium', () => {
    // Expected: Wa≈63.5 → Medium (50-80)
    const result = estimatePSAPeelStrength(
      { deltaD: 17.5, deltaP: 7, deltaH: 9 },
      { deltaD: 15.5, deltaP: 12, deltaH: 15.9 },
    );

    expect(result.wa).toBeGreaterThanOrEqual(50);
    expect(result.wa).toBeLessThanOrEqual(80);
    expect(result.peelLevel).toBe(PeelLevel.Medium);
  });

  it('Low-SE PSA on PTFE → Weak (Wa<50)', () => {
    // Silicone PSA-like: dD=14, dP=1, dH=2
    // PTFE: dD=16.2, dP=1.8, dH=3.4
    const result = estimatePSAPeelStrength(
      { deltaD: 14, deltaP: 1, deltaH: 2 },
      { deltaD: 16.2, deltaP: 1.8, deltaH: 3.4 },
    );

    expect(result.wa).toBeLessThan(50);
    expect(result.peelLevel).toBe(PeelLevel.Weak);
  });

  it('剥離力はWa * k で計算される (デフォルトk=0.25)', () => {
    const result = estimatePSAPeelStrength(
      { deltaD: 18, deltaP: 8, deltaH: 8 },
      { deltaD: 18.5, deltaP: 9, deltaH: 8.5 },
    );

    expect(result.estimatedPeelForce).toBeCloseTo(result.wa * 0.25, 5);
  });

  it('カスタムk値で剥離力が変化する', () => {
    const hsp1 = { deltaD: 18, deltaP: 8, deltaH: 8 };
    const hsp2 = { deltaD: 18.5, deltaP: 9, deltaH: 8.5 };

    const result1 = estimatePSAPeelStrength(hsp1, hsp2, 0.25);
    const result2 = estimatePSAPeelStrength(hsp1, hsp2, 0.50);

    expect(result2.estimatedPeelForce).toBeCloseTo(result1.estimatedPeelForce * 2, 5);
    // Wa自体は同じ
    expect(result1.wa).toBeCloseTo(result2.wa, 10);
  });

  it('対称性: Wa(PSA,adherend) === Wa(adherend,PSA)', () => {
    const psaHSP = { deltaD: 17.5, deltaP: 7, deltaH: 9 };
    const adherendHSP = { deltaD: 18, deltaP: 10, deltaH: 8 };

    const result1 = estimatePSAPeelStrength(psaHSP, adherendHSP);
    const result2 = estimatePSAPeelStrength(adherendHSP, psaHSP);

    expect(result1.wa).toBeCloseTo(result2.wa, 10);
  });

  it('剥離力ランキング: Strong > Medium > Weak', () => {
    const strong = estimatePSAPeelStrength(
      { deltaD: 19, deltaP: 9, deltaH: 9 },
      { deltaD: 19.5, deltaP: 10, deltaH: 10 },
    );
    const medium = estimatePSAPeelStrength(
      { deltaD: 17.5, deltaP: 7, deltaH: 9 },
      { deltaD: 15.5, deltaP: 12, deltaH: 15.9 },
    );
    const weak = estimatePSAPeelStrength(
      { deltaD: 14, deltaP: 1, deltaH: 2 },
      { deltaD: 16.2, deltaP: 1.8, deltaH: 3.4 },
    );

    expect(strong.estimatedPeelForce).toBeGreaterThan(medium.estimatedPeelForce);
    expect(medium.estimatedPeelForce).toBeGreaterThan(weak.estimatedPeelForce);
  });
});

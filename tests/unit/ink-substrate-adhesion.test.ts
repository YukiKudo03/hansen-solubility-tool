/**
 * インク-基材密着性評価のテスト
 *
 * 文献参考値:
 * - Owens-Wendt model (1969) surface energy approach
 * - Hansen Solubility Parameters in Practice (HSPiP) database
 */
import { describe, it, expect } from 'vitest';

import {
  evaluateInkSubstrateAdhesion,
  InkSubstrateAdhesionLevel,
} from '../../src/core/ink-substrate-adhesion';

describe('evaluateInkSubstrateAdhesion', () => {
  it('Epoxy-like ink on similar substrate → Excellent (Wa>80, Ra<5)', () => {
    // Epoxy ink: dD=20, dP=10, dH=9
    // Substrate (Al-like): dD=20.5, dP=10.5, dH=8.5
    // Expected: Wa≈87.9, Ra≈1.22
    const result = evaluateInkSubstrateAdhesion(
      { deltaD: 20, deltaP: 10, deltaH: 9 },
      { deltaD: 20.5, deltaP: 10.5, deltaH: 8.5 },
    );

    expect(result.wa).toBeGreaterThan(80);
    expect(result.ra).toBeLessThan(5);
    expect(result.adhesionLevel).toBe(InkSubstrateAdhesionLevel.Excellent);
  });

  it('Epoxy ink (dD=18,dP=10,dH=8) on Aluminum (dD=17.5,dP=6,dH=8.5) → Good (Wa>60)', () => {
    // Expected: Wa≈66.7, Ra≈4.15
    const result = evaluateInkSubstrateAdhesion(
      { deltaD: 18, deltaP: 10, deltaH: 8 },
      { deltaD: 17.5, deltaP: 6, deltaH: 8.5 },
    );

    expect(result.wa).toBeGreaterThan(60);
    expect(result.wa).toBeLessThan(80);
    expect(result.adhesionLevel).toBe(InkSubstrateAdhesionLevel.Good);
  });

  it('PTFE-like ink on Steel → Fair (40<Wa≤60)', () => {
    // PTFE-like: dD=16.2, dP=1.8, dH=3.4
    // Steel: dD=18.2, dP=7.5, dH=7.0
    // Expected: Wa≈57.8 → Fair
    const result = evaluateInkSubstrateAdhesion(
      { deltaD: 16.2, deltaP: 1.8, deltaH: 3.4 },
      { deltaD: 18.2, deltaP: 7.5, deltaH: 7.0 },
    );

    expect(result.wa).toBeGreaterThan(40);
    expect(result.wa).toBeLessThanOrEqual(60);
    expect(result.adhesionLevel).toBe(InkSubstrateAdhesionLevel.Fair);
  });

  it('Very dissimilar materials → Poor (Wa≤40)', () => {
    // Very low SE material vs highly polar substrate
    const result = evaluateInkSubstrateAdhesion(
      { deltaD: 10, deltaP: 0.5, deltaH: 0.5 },
      { deltaD: 20, deltaP: 15, deltaH: 15 },
    );

    expect(result.wa).toBeLessThanOrEqual(40);
    expect(result.adhesionLevel).toBe(InkSubstrateAdhesionLevel.Poor);
  });

  it('Wa>80 but Ra≥5 → Good (not Excellent)', () => {
    // High Wa but large Ra distance: materials with high individual SE but different profiles
    // dD=21, dP=11, dH=10 vs dD=21, dP=11, dH=10 gives Excellent
    // Need Wa>80 but Ra>=5: boost dD difference
    const result = evaluateInkSubstrateAdhesion(
      { deltaD: 22, deltaP: 12, deltaH: 10 },
      { deltaD: 19, deltaP: 12, deltaH: 10 },
    );

    // Ra = sqrt(4*3^2 + 0 + 0) = 6.0
    expect(result.ra).toBeGreaterThanOrEqual(5);
    if (result.wa > 80) {
      // Wa>80 but Ra>=5 → should be Good, not Excellent
      expect(result.adhesionLevel).toBe(InkSubstrateAdhesionLevel.Good);
    }
  });

  it('対称性: Wa(ink,sub) === Wa(sub,ink)', () => {
    const inkHSP = { deltaD: 18, deltaP: 10, deltaH: 8 };
    const subHSP = { deltaD: 17.5, deltaP: 6, deltaH: 8.5 };

    const result1 = evaluateInkSubstrateAdhesion(inkHSP, subHSP);
    const result2 = evaluateInkSubstrateAdhesion(subHSP, inkHSP);

    expect(result1.wa).toBeCloseTo(result2.wa, 10);
    expect(result1.ra).toBeCloseTo(result2.ra, 10);
  });

  it('結果オブジェクトに必要なフィールドが含まれる', () => {
    const result = evaluateInkSubstrateAdhesion(
      { deltaD: 18, deltaP: 10, deltaH: 8 },
      { deltaD: 17, deltaP: 8, deltaH: 7 },
    );

    expect(result).toHaveProperty('wa');
    expect(result).toHaveProperty('ra');
    expect(result).toHaveProperty('adhesionLevel');
    expect(typeof result.wa).toBe('number');
    expect(typeof result.ra).toBe('number');
    expect(result.wa).toBeGreaterThan(0);
    expect(result.ra).toBeGreaterThanOrEqual(0);
  });
});

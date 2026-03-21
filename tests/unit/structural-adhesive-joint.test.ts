/**
 * 構造用接着剤接合設計のテスト
 *
 * 文献参考:
 * - Owens-Wendt model for adhesion work
 * - Epoxy adhesive / metal substrate systems
 */
import { describe, it, expect } from 'vitest';

import {
  evaluateStructuralJoint,
  JointLevel,
} from '../../src/core/structural-adhesive-joint';

describe('evaluateStructuralJoint', () => {
  it('Epoxy adhesive + similar substrates → Excellent (min(Wa)>80)', () => {
    // Epoxy: dD=20, dP=11, dH=9
    // Substrate A: dD=20.5, dP=10.5, dH=8.5
    // Substrate B: dD=20, dP=12, dH=9.5
    const result = evaluateStructuralJoint(
      { deltaD: 20, deltaP: 11, deltaH: 9 },
      { deltaD: 20.5, deltaP: 10.5, deltaH: 8.5 },
      { deltaD: 20, deltaP: 12, deltaH: 9.5 },
    );

    expect(result.wa1).toBeGreaterThan(80);
    expect(result.wa2).toBeGreaterThan(80);
    expect(result.minWa).toBeGreaterThan(80);
    expect(result.jointLevel).toBe(JointLevel.Excellent);
  });

  it('Epoxy (dD=18.5,dP=10,dH=9) + Aluminum + Steel → Good', () => {
    // Aluminum: dD=17.5, dP=6, dH=8.5
    // Steel: dD=18.2, dP=7.5, dH=7
    const result = evaluateStructuralJoint(
      { deltaD: 18.5, deltaP: 10, deltaH: 9 },
      { deltaD: 17.5, deltaP: 6, deltaH: 8.5 },
      { deltaD: 18.2, deltaP: 7.5, deltaH: 7 },
    );

    // Wa values ≈ 68-72 → Good (60<min(Wa)≤80)
    expect(result.minWa).toBeGreaterThan(60);
    expect(result.minWa).toBeLessThanOrEqual(80);
    expect(result.jointLevel).toBe(JointLevel.Good);
  });

  it('One weak interface → Fair', () => {
    // Adhesive with high SE
    // Adherend1: compatible
    // Adherend2: very different (PTFE-like)
    const result = evaluateStructuralJoint(
      { deltaD: 18, deltaP: 10, deltaH: 8 },
      { deltaD: 18.5, deltaP: 9, deltaH: 7.5 },
      { deltaD: 16.2, deltaP: 1.8, deltaH: 3.4 },
    );

    // Wa with adherend2 (PTFE-like) will be lower, determining the level
    expect(result.wa1).toBeGreaterThan(result.wa2);
    expect(result.minWa).toBeGreaterThan(40);
    expect(result.minWa).toBeLessThanOrEqual(60);
    expect(result.jointLevel).toBe(JointLevel.Fair);
    expect(result.bottleneck).toBe('adherend2');
  });

  it('Very dissimilar adhesive-substrate pair → Poor', () => {
    const result = evaluateStructuralJoint(
      { deltaD: 8, deltaP: 1, deltaH: 1 },
      { deltaD: 22, deltaP: 15, deltaH: 14 },
      { deltaD: 22, deltaP: 14, deltaH: 13 },
    );

    expect(result.minWa).toBeLessThanOrEqual(40);
    expect(result.jointLevel).toBe(JointLevel.Poor);
  });

  it('ボトルネックが弱い方の被着体を正しく特定する', () => {
    // Adhesive close to adherend1, far from adherend2
    const result = evaluateStructuralJoint(
      { deltaD: 18, deltaP: 10, deltaH: 8 },
      { deltaD: 18, deltaP: 10, deltaH: 8 },   // 同一 → Wa最大
      { deltaD: 15, deltaP: 3, deltaH: 3 },     // 異なる → Wa小
    );

    expect(result.wa1).toBeGreaterThan(result.wa2);
    expect(result.bottleneck).toBe('adherend2');
  });

  it('結果にRa値が含まれる', () => {
    const result = evaluateStructuralJoint(
      { deltaD: 18, deltaP: 10, deltaH: 8 },
      { deltaD: 17, deltaP: 8, deltaH: 7 },
      { deltaD: 19, deltaP: 11, deltaH: 9 },
    );

    expect(typeof result.ra1).toBe('number');
    expect(typeof result.ra2).toBe('number');
    expect(result.ra1).toBeGreaterThanOrEqual(0);
    expect(result.ra2).toBeGreaterThanOrEqual(0);
  });

  it('対称的被着体で同等のWa値', () => {
    const adhesiveHSP = { deltaD: 18, deltaP: 10, deltaH: 8 };
    const adherendHSP = { deltaD: 17, deltaP: 9, deltaH: 7 };

    const result = evaluateStructuralJoint(adhesiveHSP, adherendHSP, adherendHSP);

    expect(result.wa1).toBeCloseTo(result.wa2, 10);
  });
});

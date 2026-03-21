import { describe, it, expect } from 'vitest';
import {
  classifyProteinStability,
  evaluateProteinAggregationRisk,
  ProteinStabilityLevel,
  DEFAULT_PROTEIN_STABILITY_THRESHOLDS,
  getProteinStabilityLevelInfo,
} from '../../src/core/protein-aggregation-risk';

describe('classifyProteinStability', () => {
  it('RED < 0.8 → Stable', () => {
    expect(classifyProteinStability(0.0)).toBe(ProteinStabilityLevel.Stable);
    expect(classifyProteinStability(0.5)).toBe(ProteinStabilityLevel.Stable);
    expect(classifyProteinStability(0.79)).toBe(ProteinStabilityLevel.Stable);
  });

  it('0.8 <= RED < 1.2 → AtRisk', () => {
    expect(classifyProteinStability(0.8)).toBe(ProteinStabilityLevel.AtRisk);
    expect(classifyProteinStability(1.0)).toBe(ProteinStabilityLevel.AtRisk);
    expect(classifyProteinStability(1.19)).toBe(ProteinStabilityLevel.AtRisk);
  });

  it('RED >= 1.2 → HighRisk', () => {
    expect(classifyProteinStability(1.2)).toBe(ProteinStabilityLevel.HighRisk);
    expect(classifyProteinStability(2.0)).toBe(ProteinStabilityLevel.HighRisk);
    expect(classifyProteinStability(5.0)).toBe(ProteinStabilityLevel.HighRisk);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyProteinStability(-0.1)).toThrow('RED値は非負でなければなりません');
  });

  it('カスタム閾値を適用', () => {
    const custom = { stableMax: 0.5, atRiskMax: 1.0 };
    expect(classifyProteinStability(0.3, custom)).toBe(ProteinStabilityLevel.Stable);
    expect(classifyProteinStability(0.6, custom)).toBe(ProteinStabilityLevel.AtRisk);
    expect(classifyProteinStability(1.1, custom)).toBe(ProteinStabilityLevel.HighRisk);
  });
});

describe('getProteinStabilityLevelInfo', () => {
  it('各レベルの情報を正しく返す', () => {
    const stable = getProteinStabilityLevelInfo(ProteinStabilityLevel.Stable);
    expect(stable.label).toBe('安定');
    expect(stable.color).toBe('green');

    const atRisk = getProteinStabilityLevelInfo(ProteinStabilityLevel.AtRisk);
    expect(atRisk.label).toBe('凝集リスク');
    expect(atRisk.color).toBe('yellow');

    const highRisk = getProteinStabilityLevelInfo(ProteinStabilityLevel.HighRisk);
    expect(highRisk.label).toBe('高凝集リスク');
    expect(highRisk.color).toBe('red');
  });
});

describe('evaluateProteinAggregationRisk', () => {
  // Lysozyme surface (dD=17.5, dP=10.0, dH=15.0) vs PBS buffer (dD=15.5, dP=16.0, dH=42.3, R0=10)
  const lysozymeHSP = { deltaD: 17.5, deltaP: 10.0, deltaH: 15.0 };
  const pbsHSP = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };
  const r0 = 10;

  it('Lysozyme vs PBS buffer で正しい結果を返す', () => {
    const result = evaluateProteinAggregationRisk(lysozymeHSP, pbsHSP, r0);

    expect(result.ra).toBeGreaterThan(0);
    expect(result.red).toBeGreaterThan(0);
    expect(Object.values(ProteinStabilityLevel)).toContain(result.stability);
    expect(result.evaluatedAt).toBeInstanceOf(Date);
    expect(result.proteinSurfaceHSP).toEqual(lysozymeHSP);
    expect(result.bufferHSP).toEqual(pbsHSP);
  });

  it('raとredが正しく計算される', () => {
    const result = evaluateProteinAggregationRisk(lysozymeHSP, pbsHSP, r0);

    const dD = lysozymeHSP.deltaD - pbsHSP.deltaD;
    const dP = lysozymeHSP.deltaP - pbsHSP.deltaP;
    const dH = lysozymeHSP.deltaH - pbsHSP.deltaH;
    const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
    expect(result.ra).toBeCloseTo(expectedRa, 6);
    expect(result.red).toBeCloseTo(expectedRa / r0, 6);
  });

  it('同一HSPでRED=0, Stable', () => {
    const sameHSP = { deltaD: 17, deltaP: 10, deltaH: 15 };
    const result = evaluateProteinAggregationRisk(sameHSP, sameHSP, r0);
    expect(result.ra).toBeCloseTo(0);
    expect(result.red).toBeCloseTo(0);
    expect(result.stability).toBe(ProteinStabilityLevel.Stable);
  });

  it('近いHSPでStable判定', () => {
    const nearBuffer = { deltaD: 18.0, deltaP: 10.5, deltaH: 15.5 };
    const result = evaluateProteinAggregationRisk(lysozymeHSP, nearBuffer, r0);
    expect(result.stability).toBe(ProteinStabilityLevel.Stable);
  });
});

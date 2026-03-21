import { describe, it, expect } from 'vitest';
import {
  classifyFormulation,
  evaluateInhalationCompatibility,
  FormulationType,
  DEFAULT_FORMULATION_THRESHOLDS,
  getFormulationLevelInfo,
} from '../../src/core/inhalation-drug-propellant';

describe('classifyFormulation', () => {
  it('RED < 0.8 → Solution', () => {
    expect(classifyFormulation(0.0)).toBe(FormulationType.Solution);
    expect(classifyFormulation(0.5)).toBe(FormulationType.Solution);
    expect(classifyFormulation(0.79)).toBe(FormulationType.Solution);
  });

  it('0.8 <= RED < 1.2 → Suspension', () => {
    expect(classifyFormulation(0.8)).toBe(FormulationType.Suspension);
    expect(classifyFormulation(1.0)).toBe(FormulationType.Suspension);
    expect(classifyFormulation(1.19)).toBe(FormulationType.Suspension);
  });

  it('RED >= 1.2 → Unstable', () => {
    expect(classifyFormulation(1.2)).toBe(FormulationType.Unstable);
    expect(classifyFormulation(2.0)).toBe(FormulationType.Unstable);
    expect(classifyFormulation(5.0)).toBe(FormulationType.Unstable);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyFormulation(-0.1)).toThrow('RED値は非負でなければなりません');
  });

  it('カスタム閾値を適用', () => {
    const custom = { solutionMax: 0.5, suspensionMax: 1.0 };
    expect(classifyFormulation(0.3, custom)).toBe(FormulationType.Solution);
    expect(classifyFormulation(0.7, custom)).toBe(FormulationType.Suspension);
    expect(classifyFormulation(1.1, custom)).toBe(FormulationType.Unstable);
  });
});

describe('getFormulationLevelInfo', () => {
  it('各レベルの情報を正しく返す', () => {
    const solution = getFormulationLevelInfo(FormulationType.Solution);
    expect(solution.label).toBe('溶液型');
    expect(solution.color).toBe('green');

    const suspension = getFormulationLevelInfo(FormulationType.Suspension);
    expect(suspension.label).toBe('懸濁型');
    expect(suspension.color).toBe('yellow');

    const unstable = getFormulationLevelInfo(FormulationType.Unstable);
    expect(unstable.label).toBe('不安定');
    expect(unstable.color).toBe('red');
  });
});

describe('evaluateInhalationCompatibility', () => {
  // Salbutamol (dD=18.5, dP=10.2, dH=14.0) vs HFA-134a (dD=12.4, dP=6.2, dH=3.8, R0=8)
  const salbutamolHSP = { deltaD: 18.5, deltaP: 10.2, deltaH: 14.0 };
  const hfa134aHSP = { deltaD: 12.4, deltaP: 6.2, deltaH: 3.8 };
  const r0 = 8;

  it('Salbutamol vs HFA-134a で正しい結果を返す', () => {
    const result = evaluateInhalationCompatibility(salbutamolHSP, hfa134aHSP, r0);

    // Ra = sqrt(4*(18.5-12.4)^2 + (10.2-6.2)^2 + (14.0-3.8)^2)
    // = sqrt(4*37.21 + 16 + 104.04)
    // = sqrt(148.84 + 16 + 104.04) = sqrt(268.88) ≈ 16.398
    // RED = 16.398 / 8 ≈ 2.050 → Unstable
    expect(result.ra).toBeGreaterThan(0);
    expect(result.red).toBeGreaterThan(0);
    expect(result.formulation).toBe(FormulationType.Unstable);
    expect(result.evaluatedAt).toBeInstanceOf(Date);
    expect(result.drugHSP).toEqual(salbutamolHSP);
    expect(result.propellantHSP).toEqual(hfa134aHSP);
  });

  it('raとredが正しく計算される', () => {
    const result = evaluateInhalationCompatibility(salbutamolHSP, hfa134aHSP, r0);

    const dD = salbutamolHSP.deltaD - hfa134aHSP.deltaD;
    const dP = salbutamolHSP.deltaP - hfa134aHSP.deltaP;
    const dH = salbutamolHSP.deltaH - hfa134aHSP.deltaH;
    const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
    expect(result.ra).toBeCloseTo(expectedRa, 6);
    expect(result.red).toBeCloseTo(expectedRa / r0, 6);
  });

  it('同一HSPでRED=0, Solution', () => {
    const sameHSP = { deltaD: 15, deltaP: 5, deltaH: 5 };
    const result = evaluateInhalationCompatibility(sameHSP, sameHSP, r0);
    expect(result.ra).toBeCloseTo(0);
    expect(result.red).toBeCloseTo(0);
    expect(result.formulation).toBe(FormulationType.Solution);
  });

  it('近いHSPでSolution判定', () => {
    const drug = { deltaD: 13, deltaP: 6, deltaH: 4 };
    const result = evaluateInhalationCompatibility(drug, hfa134aHSP, r0);
    // 近いHSPなのでREDが小さくなる → Solutionの可能性
    expect(result.red).toBeLessThan(2.0);
  });
});

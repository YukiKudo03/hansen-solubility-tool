import { describe, it, expect } from 'vitest';
import {
  classifyPolymorphRisk,
  evaluatePolymorphRisk,
  getPolymorphRiskInfo,
  PolymorphRiskLevel,
  DEFAULT_POLYMORPH_RISK_THRESHOLDS,
} from '../../src/core/polymorph-solvate-risk';

describe('classifyPolymorphRisk', () => {
  it('RED < 0.5 → DissolutionRisk', () => {
    expect(classifyPolymorphRisk(0.0)).toBe(PolymorphRiskLevel.DissolutionRisk);
    expect(classifyPolymorphRisk(0.3)).toBe(PolymorphRiskLevel.DissolutionRisk);
    expect(classifyPolymorphRisk(0.49)).toBe(PolymorphRiskLevel.DissolutionRisk);
  });

  it('0.5 ≤ RED < 1.0 → HighRisk', () => {
    expect(classifyPolymorphRisk(0.5)).toBe(PolymorphRiskLevel.HighRisk);
    expect(classifyPolymorphRisk(0.75)).toBe(PolymorphRiskLevel.HighRisk);
    expect(classifyPolymorphRisk(0.99)).toBe(PolymorphRiskLevel.HighRisk);
  });

  it('1.0 ≤ RED < 1.5 → MediumRisk', () => {
    expect(classifyPolymorphRisk(1.0)).toBe(PolymorphRiskLevel.MediumRisk);
    expect(classifyPolymorphRisk(1.25)).toBe(PolymorphRiskLevel.MediumRisk);
    expect(classifyPolymorphRisk(1.49)).toBe(PolymorphRiskLevel.MediumRisk);
  });

  it('RED ≥ 1.5 → LowRisk', () => {
    expect(classifyPolymorphRisk(1.5)).toBe(PolymorphRiskLevel.LowRisk);
    expect(classifyPolymorphRisk(2.0)).toBe(PolymorphRiskLevel.LowRisk);
    expect(classifyPolymorphRisk(5.0)).toBe(PolymorphRiskLevel.LowRisk);
  });

  it('カスタム閾値を適用', () => {
    const custom = { dissolutionMax: 0.3, highRiskMax: 0.8, mediumRiskMax: 1.2 };
    expect(classifyPolymorphRisk(0.25, custom)).toBe(PolymorphRiskLevel.DissolutionRisk);
    expect(classifyPolymorphRisk(0.5, custom)).toBe(PolymorphRiskLevel.HighRisk);
    expect(classifyPolymorphRisk(1.0, custom)).toBe(PolymorphRiskLevel.MediumRisk);
    expect(classifyPolymorphRisk(1.3, custom)).toBe(PolymorphRiskLevel.LowRisk);
  });
});

describe('getPolymorphRiskInfo', () => {
  it('各レベルの情報を返す', () => {
    for (const level of [PolymorphRiskLevel.DissolutionRisk, PolymorphRiskLevel.HighRisk, PolymorphRiskLevel.MediumRisk, PolymorphRiskLevel.LowRisk]) {
      const info = getPolymorphRiskInfo(level);
      expect(info.label).toBeDefined();
      expect(info.labelEn).toBeDefined();
      expect(info.description).toBeDefined();
    }
  });
});

describe('evaluatePolymorphRisk', () => {
  const apiHSP = { deltaD: 17.0, deltaP: 10.0, deltaH: 12.0 };
  const apiR0 = 8.0;
  const solvents = [
    { name: 'Water', hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 } },
    { name: 'Ethanol', hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 } },
    { name: 'Toluene', hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 } },
    { name: 'DMSO', hsp: { deltaD: 18.4, deltaP: 16.4, deltaH: 10.2 } },
  ];

  it('全溶媒の結果を返す', () => {
    const results = evaluatePolymorphRisk(apiHSP, apiR0, solvents);
    expect(results.length).toBe(4);
  });

  it('リスク順にソートされる', () => {
    const results = evaluatePolymorphRisk(apiHSP, apiR0, solvents);
    for (let i = 1; i < results.length; i++) {
      if (results[i].riskLevel === results[i - 1].riskLevel) {
        expect(results[i].red).toBeGreaterThanOrEqual(results[i - 1].red);
      } else {
        expect(results[i].riskLevel).toBeGreaterThanOrEqual(results[i - 1].riskLevel);
      }
    }
  });

  it('各結果にRa, RED, riskLevelが含まれる', () => {
    const results = evaluatePolymorphRisk(apiHSP, apiR0, solvents);
    for (const r of results) {
      expect(r.ra).toBeGreaterThanOrEqual(0);
      expect(r.red).toBeGreaterThanOrEqual(0);
      expect(r.riskLevel).toBeDefined();
      expect(r.solvent.name).toBeDefined();
    }
  });

  it('HSPが近い溶媒は高リスクになる', () => {
    // DMSOはAPIのHSPに比較的近い
    const results = evaluatePolymorphRisk(apiHSP, apiR0, solvents);
    const dmso = results.find(r => r.solvent.name === 'DMSO');
    const water = results.find(r => r.solvent.name === 'Water');
    expect(dmso!.red).toBeLessThan(water!.red);
  });

  it('空の溶媒リストで空配列を返す', () => {
    const results = evaluatePolymorphRisk(apiHSP, apiR0, []);
    expect(results).toEqual([]);
  });
});

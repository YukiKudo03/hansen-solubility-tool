import { describe, it, expect } from 'vitest';
import {
  classifyPermeability,
  evaluateLiposomePermeability,
  screenDrugPermeability,
  getPermeabilityLevelInfo,
  DEFAULT_PERMEABILITY_THRESHOLDS,
  PermeabilityLevel,
} from '../../src/core/liposome-permeability';
import type { DrugPermeabilityInput } from '../../src/core/liposome-permeability';
import type { HSPValues } from '../../src/core/types';

describe('classifyPermeability', () => {
  it('RED < 0.8 → HighPermeability', () => {
    expect(classifyPermeability(0.5)).toBe(PermeabilityLevel.HighPermeability);
  });
  it('RED = 0.0 → HighPermeability', () => {
    expect(classifyPermeability(0.0)).toBe(PermeabilityLevel.HighPermeability);
  });
  it('RED = 0.8 → Moderate (境界)', () => {
    expect(classifyPermeability(0.8)).toBe(PermeabilityLevel.Moderate);
  });
  it('RED = 1.0 → Moderate', () => {
    expect(classifyPermeability(1.0)).toBe(PermeabilityLevel.Moderate);
  });
  it('RED = 1.2 → LowPermeability (境界)', () => {
    expect(classifyPermeability(1.2)).toBe(PermeabilityLevel.LowPermeability);
  });
  it('RED = 2.0 → LowPermeability', () => {
    expect(classifyPermeability(2.0)).toBe(PermeabilityLevel.LowPermeability);
  });
  it('負のRED値でエラー', () => {
    expect(() => classifyPermeability(-0.1)).toThrow();
  });
  it('カスタム閾値が適用される', () => {
    const custom = { highPermeabilityMax: 0.5, moderateMax: 1.0 };
    expect(classifyPermeability(0.3, custom)).toBe(PermeabilityLevel.HighPermeability);
    expect(classifyPermeability(0.7, custom)).toBe(PermeabilityLevel.Moderate);
    expect(classifyPermeability(1.5, custom)).toBe(PermeabilityLevel.LowPermeability);
  });
});

describe('DEFAULT_PERMEABILITY_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_PERMEABILITY_THRESHOLDS;
    expect(t.highPermeabilityMax).toBeLessThan(t.moderateMax);
  });
});

describe('getPermeabilityLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [PermeabilityLevel.HighPermeability, PermeabilityLevel.Moderate, PermeabilityLevel.LowPermeability];
    for (const level of levels) {
      const info = getPermeabilityLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});

describe('evaluateLiposomePermeability', () => {
  // Ibuprofen: dD=17.6, dP=5.2, dH=7.0
  const ibuprofenHSP: HSPValues = { deltaD: 17.6, deltaP: 5.2, deltaH: 7.0 };
  // DPPC脂質膜: dD=16.5, dP=5.0, dH=4.5, R0=8
  const dppcHSP: HSPValues = { deltaD: 16.5, deltaP: 5.0, deltaH: 4.5 };
  const dppcR0 = 8.0;

  it('Ibuprofen vs DPPC → HighPermeability (脂溶性薬物は脂質膜に分配しやすい)', () => {
    const result = evaluateLiposomePermeability(ibuprofenHSP, dppcHSP, dppcR0);
    expect(result.permeabilityLevel).toBe(PermeabilityLevel.HighPermeability);
    expect(result.red).toBeLessThan(0.8);
  });

  it('Ra値が正しく計算される', () => {
    const result = evaluateLiposomePermeability(ibuprofenHSP, dppcHSP, dppcR0);
    expect(result.ra).toBeGreaterThan(0);
    expect(result.red).toBe(result.ra / dppcR0);
  });

  it('HSP値が結果に含まれる', () => {
    const result = evaluateLiposomePermeability(ibuprofenHSP, dppcHSP, dppcR0);
    expect(result.drugHSP).toEqual(ibuprofenHSP);
    expect(result.lipidHSP).toEqual(dppcHSP);
  });

  // 極性薬物 (水溶性が高い): dD=15.0, dP=16.0, dH=20.0 → 脂質膜から遠い
  const polarDrugHSP: HSPValues = { deltaD: 15.0, deltaP: 16.0, deltaH: 20.0 };

  it('極性薬物 vs DPPC → LowPermeability', () => {
    const result = evaluateLiposomePermeability(polarDrugHSP, dppcHSP, dppcR0);
    expect(result.permeabilityLevel).toBe(PermeabilityLevel.LowPermeability);
    expect(result.red).toBeGreaterThanOrEqual(1.2);
  });
});

describe('screenDrugPermeability', () => {
  const dppcHSP: HSPValues = { deltaD: 16.5, deltaP: 5.0, deltaH: 4.5 };
  const dppcR0 = 8.0;

  const drugs: DrugPermeabilityInput[] = [
    { name: 'Ibuprofen', hsp: { deltaD: 17.6, deltaP: 5.2, deltaH: 7.0 } },
    { name: 'PolarDrug', hsp: { deltaD: 15.0, deltaP: 16.0, deltaH: 20.0 } },
    { name: 'Caffeine', hsp: { deltaD: 19.5, deltaP: 10.2, deltaH: 13.0 } },
  ];

  it('結果がRED昇順にソートされる', () => {
    const results = screenDrugPermeability(drugs, dppcHSP, dppcR0);
    expect(results.length).toBe(3);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].red).toBeGreaterThanOrEqual(results[i - 1].red);
    }
  });

  it('Ibuprofenが最も透過性が高い', () => {
    const results = screenDrugPermeability(drugs, dppcHSP, dppcR0);
    expect(results[0].drugName).toBe('Ibuprofen');
    expect(results[0].permeabilityLevel).toBe(PermeabilityLevel.HighPermeability);
  });

  it('空のリストで空結果', () => {
    const results = screenDrugPermeability([], dppcHSP, dppcR0);
    expect(results).toHaveLength(0);
  });

  it('全結果にlipidHSPが含まれる', () => {
    const results = screenDrugPermeability(drugs, dppcHSP, dppcR0);
    for (const r of results) {
      expect(r.lipidHSP).toEqual(dppcHSP);
    }
  });
});

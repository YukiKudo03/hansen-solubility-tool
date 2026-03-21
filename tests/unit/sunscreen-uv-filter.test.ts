import { describe, it, expect } from 'vitest';
import {
  classifySolubility,
  screenUVFilterCompatibility,
  SolubilityLevel,
  DEFAULT_SOLUBILITY_THRESHOLDS,
  getSolubilityLevelInfo,
} from '../../src/core/sunscreen-uv-filter';

describe('classifySolubility', () => {
  it('RED < 0.7 → Excellent', () => {
    expect(classifySolubility(0.0)).toBe(SolubilityLevel.Excellent);
    expect(classifySolubility(0.5)).toBe(SolubilityLevel.Excellent);
    expect(classifySolubility(0.69)).toBe(SolubilityLevel.Excellent);
  });

  it('0.7 <= RED < 1.0 → Good', () => {
    expect(classifySolubility(0.7)).toBe(SolubilityLevel.Good);
    expect(classifySolubility(0.85)).toBe(SolubilityLevel.Good);
    expect(classifySolubility(0.99)).toBe(SolubilityLevel.Good);
  });

  it('RED >= 1.0 → Poor', () => {
    expect(classifySolubility(1.0)).toBe(SolubilityLevel.Poor);
    expect(classifySolubility(1.5)).toBe(SolubilityLevel.Poor);
    expect(classifySolubility(3.0)).toBe(SolubilityLevel.Poor);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifySolubility(-0.1)).toThrow('RED値は非負でなければなりません');
  });

  it('カスタム閾値を適用', () => {
    const custom = { excellentMax: 0.5, goodMax: 0.8 };
    expect(classifySolubility(0.3, custom)).toBe(SolubilityLevel.Excellent);
    expect(classifySolubility(0.6, custom)).toBe(SolubilityLevel.Good);
    expect(classifySolubility(0.9, custom)).toBe(SolubilityLevel.Poor);
  });
});

describe('getSolubilityLevelInfo', () => {
  it('各レベルの情報を正しく返す', () => {
    const excellent = getSolubilityLevelInfo(SolubilityLevel.Excellent);
    expect(excellent.label).toBe('優秀');
    expect(excellent.color).toBe('green');

    const good = getSolubilityLevelInfo(SolubilityLevel.Good);
    expect(good.label).toBe('良好');
    expect(good.color).toBe('yellow');

    const poor = getSolubilityLevelInfo(SolubilityLevel.Poor);
    expect(poor.label).toBe('不良');
    expect(poor.color).toBe('red');
  });
});

describe('screenUVFilterCompatibility', () => {
  // Emollient(dD=16, dP=3, dH=5, R0=8) vs UVフィルター群
  const emollientHSP = { deltaD: 16.0, deltaP: 3.0, deltaH: 5.0 };
  const r0 = 8;

  const uvFilters = [
    { name: 'Avobenzone', hsp: { deltaD: 18.8, deltaP: 5.2, deltaH: 7.5 } },
    { name: 'Octinoxate', hsp: { deltaD: 17.5, deltaP: 3.5, deltaH: 4.5 } },
    { name: 'Titanium Dioxide', hsp: { deltaD: 20.0, deltaP: 10.0, deltaH: 12.0 } },
  ];

  it('UVフィルタースクリーニングで正しい結果を返す', () => {
    const results = screenUVFilterCompatibility(emollientHSP, r0, uvFilters);
    expect(results.length).toBe(3);

    // RED昇順でソートされている
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].red).toBeLessThanOrEqual(results[i + 1].red);
    }

    // 各結果にuvFilter, ra, red, solubilityが含まれる
    for (const r of results) {
      expect(r.uvFilter.name).toBeTruthy();
      expect(r.ra).toBeGreaterThanOrEqual(0);
      expect(r.red).toBeGreaterThanOrEqual(0);
      expect(Object.values(SolubilityLevel)).toContain(r.solubility);
    }
  });

  it('空のUVフィルターリストで空配列を返す', () => {
    const results = screenUVFilterCompatibility(emollientHSP, r0, []);
    expect(results).toEqual([]);
  });

  it('Avobenzone (dD=18.8, dP=5.2, dH=7.5) はエモリエントに対してExcellentまたはGood', () => {
    const results = screenUVFilterCompatibility(emollientHSP, r0, [uvFilters[0]]);
    // Ra = sqrt(4*(16-18.8)^2 + (3-5.2)^2 + (5-7.5)^2) = sqrt(4*7.84 + 4.84 + 6.25) = sqrt(42.45) ≈ 6.52
    // RED = 6.52 / 8 ≈ 0.815 → Good
    expect(results[0].solubility).not.toBe(SolubilityLevel.Poor);
  });

  it('結果のraとredが正しく計算される', () => {
    const results = screenUVFilterCompatibility(emollientHSP, r0, uvFilters);
    for (const r of results) {
      const dD = emollientHSP.deltaD - r.uvFilter.hsp.deltaD;
      const dP = emollientHSP.deltaP - r.uvFilter.hsp.deltaP;
      const dH = emollientHSP.deltaH - r.uvFilter.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / r0, 6);
    }
  });
});

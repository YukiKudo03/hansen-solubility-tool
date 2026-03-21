import { describe, it, expect } from 'vitest';
import {
  classifyCleaning,
  screenCleaningSolvents,
  CleaningLevel,
  DEFAULT_CLEANING_THRESHOLDS,
  getCleaningLevelInfo,
} from '../../src/core/cleaning-product-formulation';

describe('classifyCleaning', () => {
  it('RED < 0.6 → Excellent', () => {
    expect(classifyCleaning(0.0)).toBe(CleaningLevel.Excellent);
    expect(classifyCleaning(0.3)).toBe(CleaningLevel.Excellent);
    expect(classifyCleaning(0.59)).toBe(CleaningLevel.Excellent);
  });

  it('0.6 <= RED < 1.0 → Good', () => {
    expect(classifyCleaning(0.6)).toBe(CleaningLevel.Good);
    expect(classifyCleaning(0.8)).toBe(CleaningLevel.Good);
    expect(classifyCleaning(0.99)).toBe(CleaningLevel.Good);
  });

  it('1.0 <= RED < 1.5 → Moderate', () => {
    expect(classifyCleaning(1.0)).toBe(CleaningLevel.Moderate);
    expect(classifyCleaning(1.2)).toBe(CleaningLevel.Moderate);
    expect(classifyCleaning(1.49)).toBe(CleaningLevel.Moderate);
  });

  it('RED >= 1.5 → Poor', () => {
    expect(classifyCleaning(1.5)).toBe(CleaningLevel.Poor);
    expect(classifyCleaning(2.0)).toBe(CleaningLevel.Poor);
    expect(classifyCleaning(5.0)).toBe(CleaningLevel.Poor);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyCleaning(-0.1)).toThrow('RED値は非負でなければなりません');
  });

  it('カスタム閾値を適用', () => {
    const custom = { excellentMax: 0.4, goodMax: 0.8, moderateMax: 1.2 };
    expect(classifyCleaning(0.3, custom)).toBe(CleaningLevel.Excellent);
    expect(classifyCleaning(0.5, custom)).toBe(CleaningLevel.Good);
    expect(classifyCleaning(0.9, custom)).toBe(CleaningLevel.Moderate);
    expect(classifyCleaning(1.3, custom)).toBe(CleaningLevel.Poor);
  });
});

describe('getCleaningLevelInfo', () => {
  it('各レベルの情報を正しく返す', () => {
    const excellent = getCleaningLevelInfo(CleaningLevel.Excellent);
    expect(excellent.label).toBe('優秀');
    expect(excellent.color).toBe('green');

    const good = getCleaningLevelInfo(CleaningLevel.Good);
    expect(good.label).toBe('良好');

    const moderate = getCleaningLevelInfo(CleaningLevel.Moderate);
    expect(moderate.label).toBe('中程度');

    const poor = getCleaningLevelInfo(CleaningLevel.Poor);
    expect(poor.label).toBe('不良');
    expect(poor.color).toBe('red');
  });
});

describe('screenCleaningSolvents', () => {
  // 油汚れ (dD=17.5, dP=1.0, dH=2.0, R0=6)
  const soilHSP = { deltaD: 17.5, deltaP: 1.0, deltaH: 2.0 };
  const soilR0 = 6;

  const solvents = [
    { name: 'ヘキサン', hsp: { deltaD: 14.9, deltaP: 0.0, deltaH: 0.0 } },
    { name: 'アセトン', hsp: { deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 } },
    { name: 'トルエン', hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 } },
    { name: '水', hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 } },
  ];

  it('油汚れのスクリーニングで正しい結果を返す', () => {
    const results = screenCleaningSolvents(soilHSP, soilR0, solvents);
    expect(results.length).toBe(4);

    // RED昇順でソートされている
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].red).toBeLessThanOrEqual(results[i + 1].red);
    }

    // 各結果にsolvent, ra, red, cleaningLevelが含まれる
    for (const r of results) {
      expect(r.solvent.name).toBeTruthy();
      expect(r.ra).toBeGreaterThanOrEqual(0);
      expect(r.red).toBeGreaterThanOrEqual(0);
      expect(Object.values(CleaningLevel)).toContain(r.cleaningLevel);
    }
  });

  it('トルエンは油汚れに対してExcellent（HSPが近い）', () => {
    const results = screenCleaningSolvents(soilHSP, soilR0, [solvents[2]]);
    expect(results[0].cleaningLevel).toBe(CleaningLevel.Excellent);
  });

  it('水は油汚れに対してPoor（HSPが遠い）', () => {
    const results = screenCleaningSolvents(soilHSP, soilR0, [solvents[3]]);
    expect(results[0].cleaningLevel).toBe(CleaningLevel.Poor);
  });

  it('空の溶媒リストで空配列を返す', () => {
    const results = screenCleaningSolvents(soilHSP, soilR0, []);
    expect(results).toEqual([]);
  });

  it('結果のraとredが正しく計算される', () => {
    const results = screenCleaningSolvents(soilHSP, soilR0, solvents);
    for (const r of results) {
      const dD = soilHSP.deltaD - r.solvent.hsp.deltaD;
      const dP = soilHSP.deltaP - r.solvent.hsp.deltaP;
      const dH = soilHSP.deltaH - r.solvent.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / soilR0, 6);
    }
  });
});

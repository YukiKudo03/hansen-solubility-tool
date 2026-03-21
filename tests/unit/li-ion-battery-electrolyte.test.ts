import { describe, it, expect } from 'vitest';
import {
  classifyElectrolyteSuitability,
  screenElectrolyteSolvents,
  estimateDielectric,
  DEFAULT_ELECTROLYTE_THRESHOLDS,
} from '../../src/core/li-ion-battery-electrolyte';

describe('classifyElectrolyteSuitability', () => {
  it('RED < 0.6 → Excellent', () => {
    expect(classifyElectrolyteSuitability(0.0)).toBe('Excellent');
    expect(classifyElectrolyteSuitability(0.3)).toBe('Excellent');
    expect(classifyElectrolyteSuitability(0.59)).toBe('Excellent');
  });

  it('0.6 <= RED < 1.0 → Good', () => {
    expect(classifyElectrolyteSuitability(0.6)).toBe('Good');
    expect(classifyElectrolyteSuitability(0.8)).toBe('Good');
    expect(classifyElectrolyteSuitability(0.99)).toBe('Good');
  });

  it('1.0 <= RED < 1.5 → Moderate', () => {
    expect(classifyElectrolyteSuitability(1.0)).toBe('Moderate');
    expect(classifyElectrolyteSuitability(1.2)).toBe('Moderate');
    expect(classifyElectrolyteSuitability(1.49)).toBe('Moderate');
  });

  it('RED >= 1.5 → Poor', () => {
    expect(classifyElectrolyteSuitability(1.5)).toBe('Poor');
    expect(classifyElectrolyteSuitability(2.0)).toBe('Poor');
    expect(classifyElectrolyteSuitability(5.0)).toBe('Poor');
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyElectrolyteSuitability(-0.1)).toThrow('RED値は非負でなければなりません');
  });

  it('カスタム閾値を適用', () => {
    const custom = { excellentMax: 0.4, goodMax: 0.8, moderateMax: 1.2 };
    expect(classifyElectrolyteSuitability(0.3, custom)).toBe('Excellent');
    expect(classifyElectrolyteSuitability(0.5, custom)).toBe('Good');
    expect(classifyElectrolyteSuitability(0.9, custom)).toBe('Moderate');
    expect(classifyElectrolyteSuitability(1.3, custom)).toBe('Poor');
  });
});

describe('estimateDielectric', () => {
  it('δP=0 → ε=0', () => {
    expect(estimateDielectric(0)).toBe(0);
  });

  it('δP=14 → ε=49', () => {
    expect(estimateDielectric(14)).toBeCloseTo(49, 1);
  });

  it('δP=10 → ε=25', () => {
    expect(estimateDielectric(10)).toBeCloseTo(25, 1);
  });
});

describe('screenElectrolyteSolvents', () => {
  // LiPF6: dD=15.0, dP=18.0, dH=10.0, R0=10
  const saltHSP = { deltaD: 15.0, deltaP: 18.0, deltaH: 10.0 };
  const saltR0 = 10;

  const solvents = [
    { name: 'EC (Ethylene Carbonate)', hsp: { deltaD: 19.4, deltaP: 21.7, deltaH: 5.1 } },
    { name: 'DMC (Dimethyl Carbonate)', hsp: { deltaD: 15.5, deltaP: 3.9, deltaH: 9.7 } },
    { name: 'DEC (Diethyl Carbonate)', hsp: { deltaD: 16.6, deltaP: 3.1, deltaH: 6.1 } },
    { name: 'Toluene', hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 } },
  ];

  it('LiPF6に対してECは上位（HSPが最も近い）', () => {
    const results = screenElectrolyteSolvents(saltHSP, saltR0, solvents);
    // ECが最初（RED最小）
    expect(results[0].solvent.name).toContain('EC');
    // ECのREDは他より低い
    expect(results[0].red).toBeLessThan(results[results.length - 1].red);
  });

  it('RED昇順でソートされている', () => {
    const results = screenElectrolyteSolvents(saltHSP, saltR0, solvents);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].red).toBeLessThanOrEqual(results[i + 1].red);
    }
  });

  it('各結果にra, red, estimatedDielectric, suitabilityが含まれる', () => {
    const results = screenElectrolyteSolvents(saltHSP, saltR0, solvents);
    for (const r of results) {
      expect(r.solvent.name).toBeTruthy();
      expect(r.ra).toBeGreaterThanOrEqual(0);
      expect(r.red).toBeGreaterThanOrEqual(0);
      expect(r.estimatedDielectric).toBeGreaterThanOrEqual(0);
      expect(['Excellent', 'Good', 'Moderate', 'Poor']).toContain(r.suitability);
    }
  });

  it('TolueneはLiPF6に対してPoorまたはModerate（HSPが遠い）', () => {
    const results = screenElectrolyteSolvents(saltHSP, saltR0, solvents);
    const toluene = results.find((r) => r.solvent.name === 'Toluene');
    expect(toluene).toBeDefined();
    expect(['Moderate', 'Poor']).toContain(toluene!.suitability);
  });

  it('空の溶媒リストで空配列を返す', () => {
    const results = screenElectrolyteSolvents(saltHSP, saltR0, []);
    expect(results).toEqual([]);
  });

  it('raとredが正しく計算される', () => {
    const results = screenElectrolyteSolvents(saltHSP, saltR0, solvents);
    for (const r of results) {
      const dD = saltHSP.deltaD - r.solvent.hsp.deltaD;
      const dP = saltHSP.deltaP - r.solvent.hsp.deltaP;
      const dH = saltHSP.deltaH - r.solvent.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / saltR0, 6);
    }
  });
});

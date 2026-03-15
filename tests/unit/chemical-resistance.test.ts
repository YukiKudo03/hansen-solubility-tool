import { describe, it, expect } from 'vitest';
import { classifyChemicalResistance, DEFAULT_CHEMICAL_RESISTANCE_THRESHOLDS, getChemicalResistanceLevelInfo } from '../../src/core/chemical-resistance';
import { ChemicalResistanceLevel } from '../../src/core/types';

describe('classifyChemicalResistance', () => {
  it('RED = 0.3 → NoResistance (耐性なし)', () => {
    expect(classifyChemicalResistance(0.3)).toBe(ChemicalResistanceLevel.NoResistance);
  });
  it('RED = 0.0 → NoResistance', () => {
    expect(classifyChemicalResistance(0.0)).toBe(ChemicalResistanceLevel.NoResistance);
  });
  it('RED = 0.5 → Poor (境界)', () => {
    expect(classifyChemicalResistance(0.5)).toBe(ChemicalResistanceLevel.Poor);
  });
  it('RED = 0.7 → Poor', () => {
    expect(classifyChemicalResistance(0.7)).toBe(ChemicalResistanceLevel.Poor);
  });
  it('RED = 0.8 → Moderate (境界)', () => {
    expect(classifyChemicalResistance(0.8)).toBe(ChemicalResistanceLevel.Moderate);
  });
  it('RED = 1.0 → Moderate', () => {
    expect(classifyChemicalResistance(1.0)).toBe(ChemicalResistanceLevel.Moderate);
  });
  it('RED = 1.2 → Good (境界)', () => {
    expect(classifyChemicalResistance(1.2)).toBe(ChemicalResistanceLevel.Good);
  });
  it('RED = 1.5 → Good', () => {
    expect(classifyChemicalResistance(1.5)).toBe(ChemicalResistanceLevel.Good);
  });
  it('RED = 2.0 → Excellent (境界)', () => {
    expect(classifyChemicalResistance(2.0)).toBe(ChemicalResistanceLevel.Excellent);
  });
  it('RED = 2.5 → Excellent', () => {
    expect(classifyChemicalResistance(2.5)).toBe(ChemicalResistanceLevel.Excellent);
  });
  it('負のRED値でエラー', () => {
    expect(() => classifyChemicalResistance(-0.1)).toThrow();
  });
  it('カスタム閾値が適用される', () => {
    const custom = { noResistanceMax: 0.3, poorMax: 0.6, moderateMax: 1.0, goodMax: 1.5 };
    expect(classifyChemicalResistance(0.2, custom)).toBe(ChemicalResistanceLevel.NoResistance);
    expect(classifyChemicalResistance(0.4, custom)).toBe(ChemicalResistanceLevel.Poor);
    expect(classifyChemicalResistance(0.8, custom)).toBe(ChemicalResistanceLevel.Moderate);
    expect(classifyChemicalResistance(1.2, custom)).toBe(ChemicalResistanceLevel.Good);
    expect(classifyChemicalResistance(1.8, custom)).toBe(ChemicalResistanceLevel.Excellent);
  });
});

describe('DEFAULT_CHEMICAL_RESISTANCE_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_CHEMICAL_RESISTANCE_THRESHOLDS;
    expect(t.noResistanceMax).toBeLessThan(t.poorMax);
    expect(t.poorMax).toBeLessThan(t.moderateMax);
    expect(t.moderateMax).toBeLessThan(t.goodMax);
  });
});

describe('getChemicalResistanceLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [ChemicalResistanceLevel.NoResistance, ChemicalResistanceLevel.Poor, ChemicalResistanceLevel.Moderate, ChemicalResistanceLevel.Good, ChemicalResistanceLevel.Excellent];
    for (const level of levels) {
      const info = getChemicalResistanceLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});

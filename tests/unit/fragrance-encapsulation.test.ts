import { describe, it, expect } from 'vitest';
import {
  classifyEncapsulation,
  screenFragranceEncapsulation,
  getEncapsulationLevelInfo,
  DEFAULT_ENCAPSULATION_THRESHOLDS,
  EncapsulationLevel,
} from '../../src/core/fragrance-encapsulation';
import type { FragranceInput } from '../../src/core/fragrance-encapsulation';
import type { HSPValues } from '../../src/core/types';

describe('classifyEncapsulation', () => {
  it('RED < 1.0 → Poor', () => {
    expect(classifyEncapsulation(0.5)).toBe(EncapsulationLevel.Poor);
  });
  it('RED = 0.0 → Poor', () => {
    expect(classifyEncapsulation(0.0)).toBe(EncapsulationLevel.Poor);
  });
  it('RED = 1.0 → Good (境界)', () => {
    expect(classifyEncapsulation(1.0)).toBe(EncapsulationLevel.Good);
  });
  it('RED = 1.3 → Good', () => {
    expect(classifyEncapsulation(1.3)).toBe(EncapsulationLevel.Good);
  });
  it('RED = 1.5 → Excellent (境界)', () => {
    expect(classifyEncapsulation(1.5)).toBe(EncapsulationLevel.Excellent);
  });
  it('RED = 2.0 → Excellent', () => {
    expect(classifyEncapsulation(2.0)).toBe(EncapsulationLevel.Excellent);
  });
  it('負のRED値でエラー', () => {
    expect(() => classifyEncapsulation(-0.1)).toThrow();
  });
  it('カスタム閾値が適用される', () => {
    const custom = { poorMax: 0.8, goodMax: 1.2 };
    expect(classifyEncapsulation(0.5, custom)).toBe(EncapsulationLevel.Poor);
    expect(classifyEncapsulation(1.0, custom)).toBe(EncapsulationLevel.Good);
    expect(classifyEncapsulation(1.5, custom)).toBe(EncapsulationLevel.Excellent);
  });
});

describe('DEFAULT_ENCAPSULATION_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_ENCAPSULATION_THRESHOLDS;
    expect(t.poorMax).toBeLessThan(t.goodMax);
  });
});

describe('getEncapsulationLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [EncapsulationLevel.Poor, EncapsulationLevel.Good, EncapsulationLevel.Excellent];
    for (const level of levels) {
      const info = getEncapsulationLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});

describe('screenFragranceEncapsulation', () => {
  // Gelatin-like壁材: dD=17.0, dP=12.0, dH=18.0, R0=10.0
  const gelatinHSP: HSPValues = { deltaD: 17.0, deltaP: 12.0, deltaH: 18.0 };
  const gelatinR0 = 10.0;

  // Limonene (柑橘系香料): dD=17.2, dP=1.8, dH=4.3 → ゼラチンから遠い→Excellent
  const limonene: FragranceInput = { name: 'Limonene', hsp: { deltaD: 17.2, deltaP: 1.8, deltaH: 4.3 } };
  // Ethanol (極性溶媒): dD=15.8, dP=8.8, dH=19.4 → ゼラチンに近い→Poor
  const ethanol: FragranceInput = { name: 'Ethanol', hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 } };

  it('Gelatin vs Limonene → Excellent (ゼラチンカプセルは柑橘系香料に有効)', () => {
    const results = screenFragranceEncapsulation(gelatinHSP, gelatinR0, [limonene]);
    expect(results).toHaveLength(1);
    expect(results[0].encapsulationLevel).toBe(EncapsulationLevel.Excellent);
    expect(results[0].red).toBeGreaterThanOrEqual(1.5);
  });

  it('Gelatin vs Ethanol → Poor (極性が近く壁材を透過しやすい)', () => {
    const results = screenFragranceEncapsulation(gelatinHSP, gelatinR0, [ethanol]);
    expect(results).toHaveLength(1);
    expect(results[0].encapsulationLevel).toBe(EncapsulationLevel.Poor);
    expect(results[0].red).toBeLessThan(1.0);
  });

  it('結果がRED降順にソートされる（カプセル化適合性が高い順）', () => {
    const results = screenFragranceEncapsulation(gelatinHSP, gelatinR0, [ethanol, limonene]);
    expect(results).toHaveLength(2);
    expect(results[0].red).toBeGreaterThanOrEqual(results[1].red);
    expect(results[0].fragranceName).toBe('Limonene');
  });

  it('空のリストで空結果', () => {
    const results = screenFragranceEncapsulation(gelatinHSP, gelatinR0, []);
    expect(results).toHaveLength(0);
  });

  it('Ra値が正しく計算される', () => {
    const results = screenFragranceEncapsulation(gelatinHSP, gelatinR0, [limonene]);
    expect(results[0].ra).toBeGreaterThan(0);
  });
});

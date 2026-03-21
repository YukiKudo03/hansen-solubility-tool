import { describe, it, expect } from 'vitest';
import { screenBiofuelCompatibility, classifyBiofuelCompatibility, BiofuelCompatibilityLevel, getBiofuelCompatibilityLevelInfo } from '../../src/core/biofuel-material-compatibility';
import type { HSPValues } from '../../src/core/types';

describe('biofuel-material-compatibility', () => {
  // E85バイオ燃料（エタノール85%）
  const fuelHSP: HSPValues = { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 };
  const fuelR0 = 10.0;

  const materials = [
    { name: 'Nylon 6', hsp: { deltaD: 17.0, deltaP: 3.4, deltaH: 10.6 } },
    { name: 'PTFE', hsp: { deltaD: 16.2, deltaP: 1.8, deltaH: 3.4 } },
    { name: 'NBR Rubber', hsp: { deltaD: 18.0, deltaP: 8.0, deltaH: 4.0 } },
    { name: 'PE', hsp: { deltaD: 16.6, deltaP: 0.4, deltaH: 2.8 } },
  ];

  describe('classifyBiofuelCompatibility', () => {
    it('RED < 0.5 → Dangerous', () => {
      expect(classifyBiofuelCompatibility(0.3)).toBe(BiofuelCompatibilityLevel.Dangerous);
    });
    it('RED = 0.6 → Warning', () => {
      expect(classifyBiofuelCompatibility(0.6)).toBe(BiofuelCompatibilityLevel.Warning);
    });
    it('RED = 1.0 → Caution', () => {
      expect(classifyBiofuelCompatibility(1.0)).toBe(BiofuelCompatibilityLevel.Caution);
    });
    it('RED = 1.5 → Good', () => {
      expect(classifyBiofuelCompatibility(1.5)).toBe(BiofuelCompatibilityLevel.Good);
    });
    it('RED = 3.0 → Safe', () => {
      expect(classifyBiofuelCompatibility(3.0)).toBe(BiofuelCompatibilityLevel.Safe);
    });
    it('負のREDでエラー', () => {
      expect(() => classifyBiofuelCompatibility(-1)).toThrow();
    });
  });

  describe('screenBiofuelCompatibility', () => {
    it('全材料の結果を返す', () => {
      const results = screenBiofuelCompatibility(fuelHSP, fuelR0, materials);
      expect(results).toHaveLength(4);
    });

    it('RED降順（安全な順）にソートされる', () => {
      const results = screenBiofuelCompatibility(fuelHSP, fuelR0, materials);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].red).toBeLessThanOrEqual(results[i - 1].red);
      }
    });

    it('各結果にra, red, levelが含まれる', () => {
      const results = screenBiofuelCompatibility(fuelHSP, fuelR0, materials);
      for (const r of results) {
        expect(r.ra).toBeGreaterThanOrEqual(0);
        expect(r.red).toBeGreaterThanOrEqual(0);
        expect(r.level).toBeDefined();
        expect(r.materialName).toBeTruthy();
      }
    });

    it('空配列で空結果', () => {
      const results = screenBiofuelCompatibility(fuelHSP, fuelR0, []);
      expect(results).toHaveLength(0);
    });
  });

  describe('getBiofuelCompatibilityLevelInfo', () => {
    it('各レベルにラベルがある', () => {
      for (const level of [1, 2, 3, 4, 5] as BiofuelCompatibilityLevel[]) {
        const info = getBiofuelCompatibilityLevelInfo(level);
        expect(info.label).toBeTruthy();
        expect(info.color).toBeTruthy();
      }
    });
  });
});

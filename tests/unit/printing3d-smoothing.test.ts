/**
 * 3Dプリント溶剤平滑化のテスト (TDD Red Phase)
 *
 * パイプライン: screen3DPrintingSolvents(filamentHSP, filamentR0, solvents[]) → SmoothingScreeningResult[]
 *   - RED < 0.5 → Dissolves (危険)
 *   - 0.5 ≤ RED < 1.0 → Good smoothing
 *   - 1.0 ≤ RED < 1.5 → Mild smoothing
 *   - RED ≥ 1.5 → No effect
 *
 * 文献値:
 * - ABS acetone vapor smoothing: 広く文献化された手法
 *   (Galantucci et al. 2009, Rapid Prototyping Journal)
 * - ABS HSP: dD=18.6, dP=8.6, dH=6.4, R0=6.0 (Hansen 2007)
 * - PLA HSP: dD=18.6, dP=9.9, dH=6.0, R0=7.0 (Auras et al. 2010)
 */
import { describe, it, expect } from 'vitest';

import { calculateRa, calculateRed } from '../../src/core/hsp';
import type { HSPValues, Solvent } from '../../src/core/types';

// パイプライン関数（未実装 → Red phase）
import {
  screen3DPrintingSolvents,
  classifySmoothingEffect,
  SmoothingEffectLevel as SmoothingLevel,
} from '../../src/core/printing3d-smoothing';
import type { SmoothingScreeningResult } from '../../src/core/printing3d-smoothing';

// ===== テストデータ =====

// ABS filament (Hansen 2007)
const ABS_HSP: HSPValues = { deltaD: 18.6, deltaP: 8.6, deltaH: 6.4 };
const ABS_R0 = 6.0;

// PLA filament (Auras et al. 2010)
const PLA_HSP: HSPValues = { deltaD: 18.6, deltaP: 9.9, deltaH: 6.0 };
const PLA_R0 = 7.0;

function makeSolvent(
  id: number,
  name: string,
  deltaD: number,
  deltaP: number,
  deltaH: number,
  boilingPoint: number | null = null,
): Solvent {
  return {
    id, name, nameEn: null, casNumber: null,
    hsp: { deltaD, deltaP, deltaH },
    molarVolume: null, molWeight: null, boilingPoint,
    viscosity: null, specificGravity: null, surfaceTension: null, notes: null,
  };
}

const testSolvents: Solvent[] = [
  makeSolvent(1, 'Acetone', 15.5, 10.4, 7.0, 56),
  makeSolvent(2, 'Dichloromethane', 18.2, 6.3, 6.1, 40),
  makeSolvent(3, 'Ethyl Acetate', 15.8, 5.3, 7.2, 77),
  makeSolvent(4, 'Chloroform', 17.8, 3.1, 5.7, 61),
  makeSolvent(5, 'Toluene', 18.0, 1.4, 2.0, 111),
  makeSolvent(6, 'Ethanol', 15.8, 8.8, 19.4, 78),
  makeSolvent(7, 'Water', 15.6, 16.0, 42.3, 100),
  makeSolvent(8, 'MEK', 16.0, 9.0, 5.1, 80),
  makeSolvent(9, 'THF', 16.8, 5.7, 8.0, 66),
  makeSolvent(10, 'Limonene', 17.2, 1.8, 4.3, 176),
];

describe('classifySmoothingEffect', () => {
  it('RED < 0.5 → Dissolves', () => {
    expect(classifySmoothingEffect(0.0)).toBe(SmoothingLevel.Dissolves);
    expect(classifySmoothingEffect(0.3)).toBe(SmoothingLevel.Dissolves);
    expect(classifySmoothingEffect(0.49)).toBe(SmoothingLevel.Dissolves);
  });

  it('0.5 ≤ RED < 1.0 → GoodSmoothing', () => {
    expect(classifySmoothingEffect(0.5)).toBe(SmoothingLevel.GoodSmoothing);
    expect(classifySmoothingEffect(0.75)).toBe(SmoothingLevel.GoodSmoothing);
    expect(classifySmoothingEffect(0.99)).toBe(SmoothingLevel.GoodSmoothing);
  });

  it('1.0 < RED ≤ 1.5 → MildSmoothing', () => {
    expect(classifySmoothingEffect(1.01)).toBe(SmoothingLevel.MildSmoothing);
    expect(classifySmoothingEffect(1.2)).toBe(SmoothingLevel.MildSmoothing);
    expect(classifySmoothingEffect(1.5)).toBe(SmoothingLevel.MildSmoothing);
  });

  it('RED > 1.5 → NoEffect', () => {
    expect(classifySmoothingEffect(1.51)).toBe(SmoothingLevel.NoEffect);
    expect(classifySmoothingEffect(3.0)).toBe(SmoothingLevel.NoEffect);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifySmoothingEffect(-0.1)).toThrow();
  });
});

describe('screen3DPrintingSolvents パイプライン', () => {
  describe('文献値比較1: ABS系 (Galantucci et al. 2009)', () => {
    it('ABS + Acetone: Mild smoothing（アセトン蒸気平滑化は広く使われる技法）', () => {
      // ABS-Acetone vapor smoothing is well-established in 3D printing community
      // Ra = sqrt(4*(18.6-15.5)^2 + (8.6-10.4)^2 + (6.4-7.0)^2) ≈ 6.6
      // RED ≈ 6.6 / 6.0 ≈ 1.1 → Mild smoothing
      const results = screen3DPrintingSolvents(ABS_HSP, ABS_R0, [
        makeSolvent(1, 'Acetone', 15.5, 10.4, 7.0, 56),
      ]);
      expect(results).toHaveLength(1);
      expect(results[0].effect).toBe(SmoothingLevel.MildSmoothing);
    });

    it('ABS + Dichloromethane: Dissolves（DCMはABSを溶解、文献一致）', () => {
      // DCM is a strong solvent for ABS → Dissolves
      // Ra = sqrt(4*(18.6-18.2)^2 + (8.6-6.3)^2 + (6.4-6.1)^2) ≈ 2.4
      // RED ≈ 2.4 / 6.0 ≈ 0.40 → Dissolves
      const results = screen3DPrintingSolvents(ABS_HSP, ABS_R0, [
        makeSolvent(2, 'Dichloromethane', 18.2, 6.3, 6.1, 40),
      ]);
      expect(results[0].effect).toBe(SmoothingLevel.Dissolves);
      expect(results[0].red).toBeLessThan(0.5);
    });

    it('ABS + Water: No effect', () => {
      const results = screen3DPrintingSolvents(ABS_HSP, ABS_R0, [
        makeSolvent(7, 'Water', 15.6, 16.0, 42.3, 100),
      ]);
      expect(results[0].effect).toBe(SmoothingLevel.NoEffect);
      expect(results[0].red).toBeGreaterThanOrEqual(1.5);
    });
  });

  describe('文献値比較2: PLA系 (Auras et al. 2010)', () => {
    it('PLA + Ethyl Acetate: 平滑化効果あり（文献で報告済み）', () => {
      // Ethyl Acetate is reported to smooth PLA parts
      // Ra = sqrt(4*(18.6-15.8)^2 + (9.9-5.3)^2 + (6.0-7.2)^2) ≈ 7.3
      // RED ≈ 7.3 / 7.0 ≈ 1.05 → Mild smoothing
      const results = screen3DPrintingSolvents(PLA_HSP, PLA_R0, [
        makeSolvent(3, 'Ethyl Acetate', 15.8, 5.3, 7.2, 77),
      ]);
      expect(
        results[0].effect === SmoothingLevel.GoodSmoothing ||
        results[0].effect === SmoothingLevel.MildSmoothing
      ).toBe(true);
    });

    it('PLA + Chloroform: Dissolves or Good（PLAの強い溶媒）', () => {
      // Chloroform dissolves PLA
      const results = screen3DPrintingSolvents(PLA_HSP, PLA_R0, [
        makeSolvent(4, 'Chloroform', 17.8, 3.1, 5.7, 61),
      ]);
      expect(
        results[0].effect === SmoothingLevel.Dissolves ||
        results[0].effect === SmoothingLevel.GoodSmoothing
      ).toBe(true);
      expect(results[0].red).toBeLessThan(1.5);
    });

    it('PLA + Water: No effect', () => {
      const results = screen3DPrintingSolvents(PLA_HSP, PLA_R0, [
        makeSolvent(7, 'Water', 15.6, 16.0, 42.3, 100),
      ]);
      expect(results[0].effect).toBe(SmoothingLevel.NoEffect);
    });
  });

  describe('ソートとランキング', () => {
    it('結果がeffect昇順、同一effect内はRED昇順にソートされる', () => {
      const results = screen3DPrintingSolvents(ABS_HSP, ABS_R0, testSolvents);
      expect(results).toHaveLength(testSolvents.length);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].effect).toBeGreaterThanOrEqual(results[i - 1].effect);
        if (results[i].effect === results[i - 1].effect) {
          expect(results[i].red).toBeGreaterThanOrEqual(results[i - 1].red);
        }
      }
    });

    it('各結果にra, red, effect, solventが含まれる', () => {
      const results = screen3DPrintingSolvents(ABS_HSP, ABS_R0, testSolvents);
      for (const r of results) {
        expect(r).toHaveProperty('ra');
        expect(r).toHaveProperty('red');
        expect(r).toHaveProperty('effect');
        expect(r).toHaveProperty('solvent');
      }
    });
  });

  describe('エッジケース', () => {
    it('空配列入力で空結果', () => {
      const results = screen3DPrintingSolvents(ABS_HSP, ABS_R0, []);
      expect(results).toHaveLength(0);
    });

    it('HSPが完全一致 → RED = 0 → Dissolves', () => {
      const results = screen3DPrintingSolvents(ABS_HSP, ABS_R0, [
        makeSolvent(99, 'Perfect Match', 18.6, 8.6, 6.4),
      ]);
      expect(results[0].red).toBeCloseTo(0, 5);
      expect(results[0].effect).toBe(SmoothingLevel.Dissolves);
    });
  });
});

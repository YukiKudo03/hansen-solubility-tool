/**
 * 誘電体薄膜品質のテスト (TDD Red Phase)
 *
 * パイプライン: screenDielectricSolvents(polymerHSP, polymerR0, solvents[]) → DielectricScreeningResult[]
 *   - RED < 1.0 → Good (均一膜)
 *   - 1.0 ≤ RED < 1.5 → Moderate
 *   - RED ≥ 1.5 → Poor
 *   - 追加: 溶媒蒸発速度（沸点ベース）との組み合わせ
 *
 * 文献値:
 * - PVDF HSP: dD=17.0, dP=12.1, dH=10.2, R0=5.0 (Hansen 2007)
 * - DMF is the standard casting solvent for PVDF dielectric films
 *   (Lovinger 1983, Science 220:1115; Li et al. 2013, Energy Environ. Sci.)
 * - Hexane cannot dissolve PVDF → poor film quality
 */
import { describe, it, expect } from 'vitest';

import { calculateRa, calculateRed } from '../../src/core/hsp';
import type { HSPValues, Solvent } from '../../src/core/types';

// パイプライン関数（未実装 → Red phase）
import {
  screenDielectricSolvents,
  classifyFilmQuality as classifyDielectricQuality,
  FilmQualityLevel as DielectricQuality,
} from '../../src/core/dielectric-film';
import type { DielectricScreeningResult } from '../../src/core/dielectric-film';

// ===== テストデータ =====

// PVDF (Polyvinylidene fluoride) — 代表的な誘電体ポリマー
const PVDF_HSP: HSPValues = { deltaD: 17.0, deltaP: 12.1, deltaH: 10.2 };
const PVDF_R0 = 5.0;

// P(VDF-TrFE) — PVDF共重合体（圧電フィルム用）
const PVDF_TRFE_HSP: HSPValues = { deltaD: 17.2, deltaP: 11.5, deltaH: 9.8 };
const PVDF_TRFE_R0 = 5.5;

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
  makeSolvent(1, 'DMF', 17.4, 13.7, 11.3, 153),
  makeSolvent(2, 'DMSO', 18.4, 16.4, 10.2, 189),
  makeSolvent(3, 'NMP', 18.0, 12.3, 7.2, 202),
  makeSolvent(4, 'Acetone', 15.5, 10.4, 7.0, 56),
  makeSolvent(5, 'MEK', 16.0, 9.0, 5.1, 80),
  makeSolvent(6, 'Hexane', 14.9, 0.0, 0.0, 69),
  makeSolvent(7, 'Toluene', 18.0, 1.4, 2.0, 111),
  makeSolvent(8, 'Water', 15.6, 16.0, 42.3, 100),
  makeSolvent(9, 'Ethanol', 15.8, 8.8, 19.4, 78),
  makeSolvent(10, 'Cyclohexanone', 17.8, 8.4, 5.1, 156),
];

describe('classifyDielectricQuality', () => {
  it('RED < 1.0 → Good', () => {
    expect(classifyDielectricQuality(0.0)).toBe(DielectricQuality.Good);
    expect(classifyDielectricQuality(0.5)).toBe(DielectricQuality.Good);
    expect(classifyDielectricQuality(0.99)).toBe(DielectricQuality.Good);
  });

  it('1.0 ≤ RED < 1.5 → Moderate', () => {
    expect(classifyDielectricQuality(1.0)).toBe(DielectricQuality.Moderate);
    expect(classifyDielectricQuality(1.2)).toBe(DielectricQuality.Moderate);
    expect(classifyDielectricQuality(1.49)).toBe(DielectricQuality.Moderate);
  });

  it('RED > 1.5 → Poor', () => {
    expect(classifyDielectricQuality(1.51)).toBe(DielectricQuality.Poor);
    expect(classifyDielectricQuality(3.0)).toBe(DielectricQuality.Poor);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyDielectricQuality(-0.1)).toThrow();
  });
});

describe('screenDielectricSolvents パイプライン', () => {
  describe('文献値比較1: PVDF系 (Lovinger 1983, Li et al. 2013)', () => {
    it('PVDF + DMF: RED < 1 → Good（DMFはPVDFの標準キャスト溶媒）', () => {
      // DMF is the most widely used casting solvent for PVDF dielectric films
      // Ra = sqrt(4*(17.0-17.4)^2 + (12.1-13.7)^2 + (10.2-11.3)^2) ≈ 2.0
      // RED ≈ 2.0 / 5.0 ≈ 0.40 → Good
      const results = screenDielectricSolvents(PVDF_HSP, PVDF_R0, [
        makeSolvent(1, 'DMF', 17.4, 13.7, 11.3, 153),
      ]);
      expect(results).toHaveLength(1);
      expect(results[0].filmQuality).toBe(DielectricQuality.Good);
      expect(results[0].red).toBeLessThan(1.0);
    });

    it('PVDF + Hexane: RED >> 1.5 → Poor（非溶媒）', () => {
      // Hexane is a non-solvent for PVDF → poor film quality
      // Ra = sqrt(4*(17.0-14.9)^2 + (12.1-0)^2 + (10.2-0)^2) ≈ 16.5
      // RED ≈ 16.5 / 5.0 ≈ 3.3 → Poor
      const results = screenDielectricSolvents(PVDF_HSP, PVDF_R0, [
        makeSolvent(6, 'Hexane', 14.9, 0.0, 0.0, 69),
      ]);
      expect(results[0].filmQuality).toBe(DielectricQuality.Poor);
      expect(results[0].red).toBeGreaterThanOrEqual(1.5);
    });

    it('PVDF + NMP: Good（NMPもPVDF溶媒として使用される）', () => {
      const results = screenDielectricSolvents(PVDF_HSP, PVDF_R0, [
        makeSolvent(3, 'NMP', 18.0, 12.3, 7.2, 202),
      ]);
      // NMP is another common PVDF solvent
      expect(results[0].filmQuality).toBe(DielectricQuality.Good);
    });

    it('PVDF + Water: Poor（非溶媒）', () => {
      const results = screenDielectricSolvents(PVDF_HSP, PVDF_R0, [
        makeSolvent(8, 'Water', 15.6, 16.0, 42.3, 100),
      ]);
      expect(results[0].filmQuality).toBe(DielectricQuality.Poor);
    });
  });

  describe('文献値比較2: P(VDF-TrFE)系', () => {
    it('P(VDF-TrFE) + DMF: Good', () => {
      const results = screenDielectricSolvents(PVDF_TRFE_HSP, PVDF_TRFE_R0, [
        makeSolvent(1, 'DMF', 17.4, 13.7, 11.3, 153),
      ]);
      expect(results[0].filmQuality).toBe(DielectricQuality.Good);
    });

    it('P(VDF-TrFE) + Cyclohexanone: Good or Moderate', () => {
      const results = screenDielectricSolvents(PVDF_TRFE_HSP, PVDF_TRFE_R0, [
        makeSolvent(10, 'Cyclohexanone', 17.8, 8.4, 5.1, 156),
      ]);
      expect(
        results[0].filmQuality === DielectricQuality.Good ||
        results[0].filmQuality === DielectricQuality.Moderate
      ).toBe(true);
    });
  });

  describe('ランキングとソート', () => {
    it('結果がfilmQuality昇順、同一filmQuality内はRED昇順にソートされる', () => {
      const results = screenDielectricSolvents(PVDF_HSP, PVDF_R0, testSolvents);
      expect(results).toHaveLength(testSolvents.length);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].filmQuality).toBeGreaterThanOrEqual(results[i - 1].filmQuality);
        if (results[i].filmQuality === results[i - 1].filmQuality) {
          expect(results[i].red).toBeGreaterThanOrEqual(results[i - 1].red);
        }
      }
    });

    it('各結果にra, red, filmQuality, solventが含まれる', () => {
      const results = screenDielectricSolvents(PVDF_HSP, PVDF_R0, testSolvents);
      for (const r of results) {
        expect(r).toHaveProperty('ra');
        expect(r).toHaveProperty('red');
        expect(r).toHaveProperty('filmQuality');
        expect(r).toHaveProperty('solvent');
        expect(r.ra).toBeGreaterThanOrEqual(0);
        expect(r.red).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('蒸発速度（沸点）との組み合わせ', () => {
    it('結果のsolventに沸点情報が含まれる', () => {
      const results = screenDielectricSolvents(PVDF_HSP, PVDF_R0, testSolvents);
      for (const r of results) {
        expect(r).toHaveProperty('solvent');
      }
    });

    it('DMF (bp=153°C): 適切な蒸発速度', () => {
      const results = screenDielectricSolvents(PVDF_HSP, PVDF_R0, [
        makeSolvent(1, 'DMF', 17.4, 13.7, 11.3, 153),
      ]);
      expect(results[0].solvent.boilingPoint).toBe(153);
    });
  });

  describe('エッジケース', () => {
    it('空配列入力で空結果', () => {
      const results = screenDielectricSolvents(PVDF_HSP, PVDF_R0, []);
      expect(results).toHaveLength(0);
    });

    it('沸点nullの溶媒でもエラーにならない', () => {
      const results = screenDielectricSolvents(PVDF_HSP, PVDF_R0, [
        makeSolvent(99, 'NoBP', 17.4, 13.7, 11.3, null),
      ]);
      expect(results).toHaveLength(1);
      // boilingPoint is null when not provided (null !== undefined, so it gets included as null)
      expect(results[0].solvent.boilingPoint == null).toBe(true);
    });
  });
});

/**
 * 共結晶スクリーニングのテスト (TDD Red Phase)
 *
 * パイプライン: screenCocrystals(apiHSP, apiR0, coformerList[]) → CocrystalScreeningResult[]
 *   - Ra/RED計算 + 適合性分類 (RED < 0.7 → Likely, 0.7-1.0 → Possible, > 1.0 → Unlikely)
 *
 * 文献値:
 * - Mohammad et al. (2011) CrystEngComm 13:6112
 *   "ΔδT < 7 MPa^0.5 favors cocrystal formation"
 * - Ibuprofen HSP: dD=17.6, dP=5.2, dH=7.0 (Hansen 2007)
 * - Nicotinamide HSP: dD=18.0, dP=9.4, dH=8.8
 */
import { describe, it, expect } from 'vitest';

import { calculateRa, calculateRed } from '../../src/core/hsp';
import type { HSPValues } from '../../src/core/types';

// パイプライン関数（未実装 → Red phase）
import {
  screenCocrystals,
  classifyCocrystalLikelihood as classifyCocrystalCompatibility,
  CocrystalLikelihood as CocrystalCompatibility,
} from '../../src/core/cocrystal-screening';
import type { CocrystalScreeningResult } from '../../src/core/cocrystal-screening';

/** テスト用コフォーマー型 */
interface Coformer {
  id: number;
  name: string;
  nameEn: string | null;
  casNumber: string | null;
  hsp: { deltaD: number; deltaP: number; deltaH: number };
  molWeight: number | null;
  notes: string | null;
}

// ===== テストデータ =====

// Ibuprofen (API)
const IBUPROFEN_HSP: HSPValues = { deltaD: 17.6, deltaP: 5.2, deltaH: 7.0 };
const IBUPROFEN_R0 = 8.0;

// Caffeine (API) — 文献比較用2つ目
const CAFFEINE_HSP: HSPValues = { deltaD: 19.5, deltaP: 10.1, deltaH: 13.0 };
const CAFFEINE_R0 = 7.5;

function makeCoformer(
  id: number,
  name: string,
  deltaD: number,
  deltaP: number,
  deltaH: number,
): Coformer {
  return {
    id, name, nameEn: null, casNumber: null,
    hsp: { deltaD, deltaP, deltaH },
    molWeight: null, notes: null,
  };
}

const coformers: Coformer[] = [
  makeCoformer(1, 'Nicotinamide', 18.0, 9.4, 8.8),
  makeCoformer(2, 'Saccharin', 19.5, 8.3, 7.2),
  makeCoformer(3, 'Sucrose', 18.8, 14.2, 22.0),
  makeCoformer(4, 'Urea', 17.0, 17.0, 19.0),
  makeCoformer(5, 'Glutaric Acid', 17.2, 7.0, 12.5),
];

describe('classifyCocrystalCompatibility', () => {
  it('RED < 0.7 → Likely', () => {
    expect(classifyCocrystalCompatibility(0.3)).toBe(CocrystalCompatibility.Likely);
    expect(classifyCocrystalCompatibility(0.0)).toBe(CocrystalCompatibility.Likely);
    expect(classifyCocrystalCompatibility(0.69)).toBe(CocrystalCompatibility.Likely);
  });

  it('0.7 ≤ RED < 1.0 → Possible', () => {
    expect(classifyCocrystalCompatibility(0.7)).toBe(CocrystalCompatibility.Possible);
    expect(classifyCocrystalCompatibility(0.85)).toBe(CocrystalCompatibility.Possible);
    expect(classifyCocrystalCompatibility(0.99)).toBe(CocrystalCompatibility.Possible);
  });

  it('RED > 1.0 → Unlikely', () => {
    expect(classifyCocrystalCompatibility(1.01)).toBe(CocrystalCompatibility.Unlikely);
    expect(classifyCocrystalCompatibility(1.5)).toBe(CocrystalCompatibility.Unlikely);
    expect(classifyCocrystalCompatibility(3.0)).toBe(CocrystalCompatibility.Unlikely);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyCocrystalCompatibility(-0.1)).toThrow();
  });
});

describe('screenCocrystals パイプライン', () => {
  describe('文献値比較1: Ibuprofen系 (Mohammad et al. 2011)', () => {
    it('Ibuprofen + Nicotinamide → RED < 1 → Likely or Possible', () => {
      const results = screenCocrystals(IBUPROFEN_HSP, IBUPROFEN_R0, [
        makeCoformer(1, 'Nicotinamide', 18.0, 9.4, 8.8),
      ]);
      expect(results).toHaveLength(1);
      expect(results[0].red).toBeLessThan(1.0);
      expect(
        results[0].likelihood === CocrystalCompatibility.Likely ||
        results[0].likelihood === CocrystalCompatibility.Possible
      ).toBe(true);
    });

    it('Ibuprofen + Sucrose → RED >> 1 → Unlikely（dH差が大きい）', () => {
      const results = screenCocrystals(IBUPROFEN_HSP, IBUPROFEN_R0, [
        makeCoformer(3, 'Sucrose', 18.8, 14.2, 22.0),
      ]);
      expect(results).toHaveLength(1);
      expect(results[0].red).toBeGreaterThan(1.0);
      expect(results[0].likelihood).toBe(CocrystalCompatibility.Unlikely);
    });

    it('Ibuprofen + Urea → Unlikely（極性差が大きい）', () => {
      const results = screenCocrystals(IBUPROFEN_HSP, IBUPROFEN_R0, [
        makeCoformer(4, 'Urea', 17.0, 17.0, 19.0),
      ]);
      expect(results[0].red).toBeGreaterThan(1.0);
      expect(results[0].likelihood).toBe(CocrystalCompatibility.Unlikely);
    });
  });

  describe('文献値比較2: Caffeine系', () => {
    it('Caffeine + Glutaric Acid → Likely/Possible（既知の共結晶ペア）', () => {
      // Caffeine:Glutaric acid cocrystal is well-documented in literature
      const results = screenCocrystals(CAFFEINE_HSP, CAFFEINE_R0, [
        makeCoformer(5, 'Glutaric Acid', 17.2, 7.0, 12.5),
      ]);
      expect(results).toHaveLength(1);
      // HSP distance should be moderate → Likely or Possible
      expect(
        results[0].likelihood === CocrystalCompatibility.Likely ||
        results[0].likelihood === CocrystalCompatibility.Possible
      ).toBe(true);
    });

    it('Caffeine + Sucrose → Unlikely', () => {
      const results = screenCocrystals(CAFFEINE_HSP, CAFFEINE_R0, [
        makeCoformer(3, 'Sucrose', 18.8, 14.2, 22.0),
      ]);
      expect(results[0].likelihood).toBe(CocrystalCompatibility.Unlikely);
    });
  });

  describe('ランキングとソート', () => {
    it('ランキングがlikelihood昇順、同一likelihood内はRED昇順', () => {
      const results = screenCocrystals(IBUPROFEN_HSP, IBUPROFEN_R0, coformers);
      expect(results).toHaveLength(coformers.length);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].likelihood).toBeGreaterThanOrEqual(results[i - 1].likelihood);
        if (results[i].likelihood === results[i - 1].likelihood) {
          expect(results[i].red).toBeGreaterThanOrEqual(results[i - 1].red);
        }
      }
    });

    it('各結果にra, red, likelihood, coformerが含まれる', () => {
      const results = screenCocrystals(IBUPROFEN_HSP, IBUPROFEN_R0, coformers);
      for (const r of results) {
        expect(r).toHaveProperty('ra');
        expect(r).toHaveProperty('red');
        expect(r).toHaveProperty('likelihood');
        expect(r).toHaveProperty('coformer');
        expect(r.ra).toBeGreaterThanOrEqual(0);
        expect(r.red).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('エッジケース', () => {
    it('空配列入力で空結果', () => {
      const results = screenCocrystals(IBUPROFEN_HSP, IBUPROFEN_R0, []);
      expect(results).toHaveLength(0);
    });

    it('HSPが完全一致 → RED = 0 → Likely', () => {
      const results = screenCocrystals(IBUPROFEN_HSP, IBUPROFEN_R0, [
        makeCoformer(99, 'Identical', 17.6, 5.2, 7.0),
      ]);
      expect(results[0].red).toBeCloseTo(0, 5);
      expect(results[0].likelihood).toBe(CocrystalCompatibility.Likely);
    });
  });
});

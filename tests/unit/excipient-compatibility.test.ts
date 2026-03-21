/**
 * 賦形剤適合性マトリクスのテスト (TDD Red Phase)
 *
 * パイプライン: evaluateExcipientCompatibility(apiHSP, excipientList[]) → ExcipientResult[]
 *   - 各API-賦形剤ペアのRa/RED → Compatible (RED<1), Caution (1-1.5), Incompatible (>1.5)
 *
 * 文献値:
 * - Ibuprofen HSP: dD=17.6, dP=5.2, dH=7.0 (Hansen 2007)
 * - Greenhalgh et al. (1999) J. Pharm. Sci. 88:1182
 *   "Δδ < 7 MPa^0.5 → miscible, Δδ > 10 → immiscible"
 * - MCC, Lactose, Starch, Magnesium Stearate HSP from Pharmaceutical literature
 */
import { describe, it, expect } from 'vitest';

import { calculateRa, calculateRed } from '../../src/core/hsp';
import type { HSPValues } from '../../src/core/types';

// パイプライン関数（未実装 → Red phase）
import {
  evaluateExcipientCompatibility,
  classifyCompatibility as classifyExcipientCompatibility,
  CompatibilityLevel as ExcipientCompatibility,
} from '../../src/core/excipient-compatibility';
import type { ExcipientResult } from '../../src/core/excipient-compatibility';

/** テスト用賦形剤型 */
interface Excipient {
  id: number;
  name: string;
  nameEn: string | null;
  hsp: { deltaD: number; deltaP: number; deltaH: number };
  r0: number;
  category: string;
  notes: string | null;
}

// ===== テストデータ =====

// Ibuprofen (API)
const IBUPROFEN_HSP: HSPValues = { deltaD: 17.6, deltaP: 5.2, deltaH: 7.0 };
const IBUPROFEN_R0 = 8.0;

// Paracetamol (Acetaminophen) — 文献比較用2つ目のAPI
const PARACETAMOL_HSP: HSPValues = { deltaD: 18.6, deltaP: 10.2, deltaH: 14.5 };
const PARACETAMOL_R0 = 7.0;

function makeExcipient(
  id: number,
  name: string,
  deltaD: number,
  deltaP: number,
  deltaH: number,
  r0: number = 5.0,
): Excipient {
  return {
    id, name, nameEn: null,
    hsp: { deltaD, deltaP, deltaH },
    r0,
    category: 'filler',
    notes: null,
  };
}

const excipients: Excipient[] = [
  makeExcipient(1, 'MCC (Microcrystalline Cellulose)', 18.4, 13.0, 11.0, 5.0),
  makeExcipient(2, 'Lactose', 17.5, 13.5, 23.0, 5.0),
  makeExcipient(3, 'Starch', 17.0, 10.0, 15.0, 6.0),
  makeExcipient(4, 'Magnesium Stearate', 16.4, 2.8, 5.2, 4.0),
  makeExcipient(5, 'PVP (Polyvinylpyrrolidone)', 17.4, 9.4, 7.8, 7.0),
  makeExcipient(6, 'HPMC', 17.0, 10.7, 14.2, 6.0),
];

describe('classifyExcipientCompatibility', () => {
  it('RED < 1.0 → Compatible', () => {
    expect(classifyExcipientCompatibility(0.0)).toBe(ExcipientCompatibility.Compatible);
    expect(classifyExcipientCompatibility(0.5)).toBe(ExcipientCompatibility.Compatible);
    expect(classifyExcipientCompatibility(0.99)).toBe(ExcipientCompatibility.Compatible);
  });

  it('1.0 ≤ RED < 1.5 → Caution', () => {
    expect(classifyExcipientCompatibility(1.0)).toBe(ExcipientCompatibility.Caution);
    expect(classifyExcipientCompatibility(1.2)).toBe(ExcipientCompatibility.Caution);
    expect(classifyExcipientCompatibility(1.49)).toBe(ExcipientCompatibility.Caution);
  });

  it('RED > 1.5 → Incompatible', () => {
    expect(classifyExcipientCompatibility(1.51)).toBe(ExcipientCompatibility.Incompatible);
    expect(classifyExcipientCompatibility(3.0)).toBe(ExcipientCompatibility.Incompatible);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyExcipientCompatibility(-0.1)).toThrow();
  });
});

describe('evaluateExcipientCompatibility パイプライン', () => {
  describe('文献値比較1: Ibuprofen系 (Greenhalgh et al. 1999)', () => {
    it('Ibuprofen + MCC: Ra中程度（dP, dH差が存在）', () => {
      // MCC: dD=18.4, dP=13.0, dH=11.0
      // Ra = sqrt(4*(17.6-18.4)^2 + (5.2-13.0)^2 + (7.0-11.0)^2) ≈ 8.9
      // RED = 8.9 / 8.0 ≈ 1.11 → Caution
      const results = evaluateExcipientCompatibility(
        IBUPROFEN_HSP, IBUPROFEN_R0,
        [makeExcipient(1, 'MCC', 18.4, 13.0, 11.0)],
      );
      expect(results).toHaveLength(1);
      expect(results[0].ra).toBeGreaterThan(0);
      expect(
        results[0].compatibility === ExcipientCompatibility.Caution ||
        results[0].compatibility === ExcipientCompatibility.Incompatible
      ).toBe(true);
    });

    it('Ibuprofen + Lactose: Ra大（dH差が大きい）→ 適合性が低い', () => {
      // Lactose: dD=17.5, dP=13.5, dH=23.0
      // Ra = sqrt(4*(17.6-17.5)^2 + (5.2-13.5)^2 + (7.0-23.0)^2) ≈ 18.1
      // RED = 18.1 / 8.0 ≈ 2.26 → Incompatible
      const results = evaluateExcipientCompatibility(
        IBUPROFEN_HSP, IBUPROFEN_R0,
        [makeExcipient(2, 'Lactose', 17.5, 13.5, 23.0)],
      );
      expect(results).toHaveLength(1);
      expect(results[0].ra).toBeGreaterThan(10);
      expect(results[0].compatibility).toBe(ExcipientCompatibility.Incompatible);
    });

    it('Ibuprofen + Magnesium Stearate: Compatible（疎水性同士で相性良い）', () => {
      // Mg Stearate: dD=16.4, dP=2.8, dH=5.2 — 疎水性が近い
      // Ra = sqrt(4*(17.6-16.4)^2 + (5.2-2.8)^2 + (7.0-5.2)^2) ≈ 3.6
      // RED = 3.6 / 8.0 ≈ 0.45 → Compatible
      const results = evaluateExcipientCompatibility(
        IBUPROFEN_HSP, IBUPROFEN_R0,
        [makeExcipient(4, 'Magnesium Stearate', 16.4, 2.8, 5.2)],
      );
      expect(results[0].compatibility).toBe(ExcipientCompatibility.Compatible);
      expect(results[0].red).toBeLessThan(1.0);
    });
  });

  describe('文献値比較2: Paracetamol系', () => {
    it('Paracetamol + PVP: Compatible（PVPはバインダーとして広く使用）', () => {
      // PVP: dD=17.4, dP=9.4, dH=7.8
      // Paracetamol and PVP are known to have good compatibility in solid dispersions
      const results = evaluateExcipientCompatibility(
        PARACETAMOL_HSP, PARACETAMOL_R0,
        [makeExcipient(5, 'PVP', 17.4, 9.4, 7.8, 7.0)],
      );
      expect(
        results[0].compatibility === ExcipientCompatibility.Compatible ||
        results[0].compatibility === ExcipientCompatibility.Caution
      ).toBe(true);
    });

    it('Paracetamol + Lactose: Caution or Incompatible（dH差）', () => {
      const results = evaluateExcipientCompatibility(
        PARACETAMOL_HSP, PARACETAMOL_R0,
        [makeExcipient(2, 'Lactose', 17.5, 13.5, 23.0)],
      );
      expect(
        results[0].compatibility === ExcipientCompatibility.Caution ||
        results[0].compatibility === ExcipientCompatibility.Incompatible
      ).toBe(true);
    });
  });

  describe('マトリクスサイズとランキング', () => {
    it('結果が賦形剤の数と一致する', () => {
      const results = evaluateExcipientCompatibility(
        IBUPROFEN_HSP, IBUPROFEN_R0, excipients,
      );
      expect(results).toHaveLength(excipients.length);
    });

    it('各結果にra, red, compatibility, excipientが含まれる', () => {
      const results = evaluateExcipientCompatibility(
        IBUPROFEN_HSP, IBUPROFEN_R0, excipients,
      );
      for (const r of results) {
        expect(r).toHaveProperty('ra');
        expect(r).toHaveProperty('red');
        expect(r).toHaveProperty('compatibility');
        expect(r).toHaveProperty('excipient');
        expect(r.ra).toBeGreaterThanOrEqual(0);
        expect(r.red).toBeGreaterThanOrEqual(0);
      }
    });

    it('結果がcompatibility昇順、同一compatibility内はRED昇順にソートされる', () => {
      const results = evaluateExcipientCompatibility(
        IBUPROFEN_HSP, IBUPROFEN_R0, excipients,
      );
      for (let i = 1; i < results.length; i++) {
        expect(results[i].compatibility).toBeGreaterThanOrEqual(results[i - 1].compatibility);
        if (results[i].compatibility === results[i - 1].compatibility) {
          expect(results[i].red).toBeGreaterThanOrEqual(results[i - 1].red);
        }
      }
    });
  });

  describe('複数API × 複数賦形剤のマトリクス', () => {
    it('マトリクスがN×Mの正しいサイズ', () => {
      const apis = [
        { hsp: IBUPROFEN_HSP, r0: IBUPROFEN_R0 },
        { hsp: PARACETAMOL_HSP, r0: PARACETAMOL_R0 },
      ];
      const excipientSubset = excipients.slice(0, 3); // 3賦形剤

      // 各APIに対する結果がM件ずつ
      for (const api of apis) {
        const results = evaluateExcipientCompatibility(api.hsp, api.r0, excipientSubset);
        expect(results).toHaveLength(3);
      }
    });
  });

  describe('エッジケース', () => {
    it('空配列入力で空結果', () => {
      const results = evaluateExcipientCompatibility(
        IBUPROFEN_HSP, IBUPROFEN_R0, [],
      );
      expect(results).toHaveLength(0);
    });

    it('HSPが完全一致 → RED = 0 → Compatible', () => {
      const results = evaluateExcipientCompatibility(
        IBUPROFEN_HSP, IBUPROFEN_R0,
        [makeExcipient(99, 'Identical', 17.6, 5.2, 7.0)],
      );
      expect(results[0].red).toBeCloseTo(0, 5);
      expect(results[0].compatibility).toBe(ExcipientCompatibility.Compatible);
    });
  });
});

/**
 * ESC（環境応力亀裂）評価パイプラインのテスト (TDD Red Phase)
 *
 * パイプライン: screenESCRisk(polymerHSP, polymerR0, solvents[]) → ESCScreeningResult[]
 *   - 各溶媒のRED計算 + ESCリスク分類 + ソート (Dissolution > HighRisk > Safe)
 *
 * 文献値:
 * - Hansen (2000) Ind. Eng. Chem. Res. 39:4422-4426
 * - Pirika ESC Chapter: PC ESC-adjusted sphere (dD=21.0, dP=7.6, dH=4.4, R0=10.2)
 * - GMP Plastic PC Chemical Compatibility ratings
 */
import { describe, it, expect } from 'vitest';

import { calculateRa, calculateRed } from '../../src/core/hsp';
import type { HSPValues, Solvent } from '../../src/core/types';
import { ESCRiskLevel } from '../../src/core/esc-classification';

// パイプライン関数（未実装 → Red phase）
import { screenESCRisk } from '../../src/core/esc-pipeline';
import type { ESCScreeningResult } from '../../src/core/esc-pipeline';

// ===== テストデータ =====

// PC ESC-adjusted sphere (Hansen/Pirika)
const PC_HSP: HSPValues = { deltaD: 21.0, deltaP: 7.6, deltaH: 4.4 };
const PC_R0 = 10.2;

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

// PC vs 13溶媒 (文献データ)
const testSolvents: Solvent[] = [
  makeSolvent(1, 'Dichloromethane', 18.2, 6.3, 6.1, 40),
  makeSolvent(2, 'Chloroform', 17.8, 3.1, 5.7, 61),
  makeSolvent(3, 'Toluene', 18.0, 1.4, 2.0, 111),
  makeSolvent(4, 'Acetone', 15.5, 10.4, 7.0, 56),
  makeSolvent(5, 'MEK', 16.0, 9.0, 5.1, 80),
  makeSolvent(6, 'THF', 16.8, 5.7, 8.0, 66),
  makeSolvent(7, 'DMF', 17.4, 13.7, 11.3, 153),
  makeSolvent(8, 'Benzene', 18.4, 0.0, 2.0, 80),
  makeSolvent(9, 'Ethyl Acetate', 15.8, 5.3, 7.2, 77),
  makeSolvent(10, 'Ethanol', 15.8, 8.8, 19.4, 78),
  makeSolvent(11, 'Isopropanol', 15.8, 6.1, 16.4, 82),
  makeSolvent(12, 'Methanol', 15.1, 12.3, 22.3, 65),
  makeSolvent(13, 'Water', 15.6, 16.0, 42.3, 100),
];

// 期待されるESC分類（GMP Plastic Compatibility）
const expectedClassification: Record<string, ESCRiskLevel> = {
  Dichloromethane: ESCRiskLevel.Dissolution,
  Chloroform: ESCRiskLevel.HighRisk,
  Toluene: ESCRiskLevel.HighRisk,
  Acetone: ESCRiskLevel.HighRisk,
  MEK: ESCRiskLevel.HighRisk,
  THF: ESCRiskLevel.HighRisk,
  DMF: ESCRiskLevel.HighRisk,
  Benzene: ESCRiskLevel.HighRisk,
  'Ethyl Acetate': ESCRiskLevel.HighRisk,
  Ethanol: ESCRiskLevel.Safe,
  Isopropanol: ESCRiskLevel.Safe,
  Methanol: ESCRiskLevel.Safe,
  Water: ESCRiskLevel.Safe,
};

describe('screenESCRisk パイプライン', () => {
  describe('PC vs 13溶媒: 文献値比較', () => {
    it('全溶媒の結果を返す', () => {
      const results = screenESCRisk(PC_HSP, PC_R0, testSolvents);
      expect(results).toHaveLength(13);
    });

    it('各結果にra, red, risk, solventが含まれる', () => {
      const results = screenESCRisk(PC_HSP, PC_R0, testSolvents);
      for (const r of results) {
        expect(r).toHaveProperty('ra');
        expect(r).toHaveProperty('red');
        expect(r).toHaveProperty('risk');
        expect(r).toHaveProperty('solvent');
        expect(r.ra).toBeGreaterThanOrEqual(0);
        expect(r.red).toBeGreaterThanOrEqual(0);
      }
    });

    it('文献データに対して85%以上の正答率', () => {
      const results = screenESCRisk(PC_HSP, PC_R0, testSolvents);
      let correct = 0;
      for (const r of results) {
        const expected = expectedClassification[r.solvent.name];
        if (expected !== undefined && r.risk === expected) {
          correct++;
        }
      }
      const accuracy = correct / 13;
      expect(accuracy).toBeGreaterThanOrEqual(0.85);
    });

    it('DCM → Dissolution（溶解ゾーン）', () => {
      const results = screenESCRisk(PC_HSP, PC_R0, testSolvents);
      const dcm = results.find(r => r.solvent.name === 'Dichloromethane');
      expect(dcm).toBeDefined();
      expect(dcm!.risk).toBe(ESCRiskLevel.Dissolution);
      expect(dcm!.red).toBeLessThan(0.7);
    });

    it('Water → Safe（安全ゾーン）', () => {
      const results = screenESCRisk(PC_HSP, PC_R0, testSolvents);
      const water = results.find(r => r.solvent.name === 'Water');
      expect(water).toBeDefined();
      expect(water!.risk).toBe(ESCRiskLevel.Safe);
      expect(water!.red).toBeGreaterThan(1.3);
    });
  });

  describe('文献値比較2: PMMA系 (Hansen 2007)', () => {
    // PMMA HSP (Hansen 2007 Table): dD=18.6, dP=10.5, dH=7.5, R0=8.6
    const PMMA_HSP: HSPValues = { deltaD: 18.6, deltaP: 10.5, deltaH: 7.5 };
    const PMMA_R0 = 8.6;

    it('Acetone vs PMMA: RED < 1.3 → Dissolution or HighRisk（PMMAはアセトンに溶解）', () => {
      const results = screenESCRisk(PMMA_HSP, PMMA_R0, [
        makeSolvent(4, 'Acetone', 15.5, 10.4, 7.0),
      ]);
      expect(results).toHaveLength(1);
      // PMMA is dissolved by acetone (well-known), RED is near boundary
      expect(
        results[0].risk === ESCRiskLevel.Dissolution ||
        results[0].risk === ESCRiskLevel.HighRisk
      ).toBe(true);
      expect(results[0].red).toBeLessThan(1.3);
    });

    it('Water vs PMMA: RED >> 1.3 → Safe', () => {
      const results = screenESCRisk(PMMA_HSP, PMMA_R0, [
        makeSolvent(13, 'Water', 15.6, 16.0, 42.3),
      ]);
      expect(results[0].risk).toBe(ESCRiskLevel.Safe);
      expect(results[0].red).toBeGreaterThan(1.3);
    });
  });

  describe('ソート順', () => {
    it('Dissolution → HighRisk → Safe の順にソートされる', () => {
      const results = screenESCRisk(PC_HSP, PC_R0, testSolvents);

      // リスクレベルの数値: Dissolution=1, HighRisk=2, Safe=3
      for (let i = 1; i < results.length; i++) {
        expect(results[i].risk).toBeGreaterThanOrEqual(results[i - 1].risk);
      }
    });

    it('同一リスクレベル内ではRED昇順', () => {
      const results = screenESCRisk(PC_HSP, PC_R0, testSolvents);

      // 同一レベル内のソート確認
      for (let i = 1; i < results.length; i++) {
        if (results[i].risk === results[i - 1].risk) {
          expect(results[i].red).toBeGreaterThanOrEqual(results[i - 1].red);
        }
      }
    });
  });

  describe('エッジケース', () => {
    it('空配列入力で空結果', () => {
      const results = screenESCRisk(PC_HSP, PC_R0, []);
      expect(results).toHaveLength(0);
    });

    it('単一溶媒でも動作する', () => {
      const results = screenESCRisk(PC_HSP, PC_R0, [testSolvents[0]]);
      expect(results).toHaveLength(1);
    });
  });
});

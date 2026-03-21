import { describe, it, expect } from 'vitest';
import { evaluateRubberCompound } from '../../src/core/rubber-compounding-design';
import type { HSPValues } from '../../src/core/types';
import type { FillerInfo, SwellingSolventInfo } from '../../src/core/rubber-compounding-design';

describe('rubber-compounding-design', () => {
  // NR (天然ゴム)
  const nrHSP: HSPValues = { deltaD: 17.4, deltaP: 3.1, deltaH: 4.1 };

  // Carbon Black
  const carbonBlack: FillerInfo = {
    name: 'Carbon Black',
    hsp: { deltaD: 19.5, deltaP: 2.9, deltaH: 3.5 },
  };

  // 溶媒リスト
  const toluene: SwellingSolventInfo = {
    name: 'Toluene',
    hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
    molarVolume: 106.8,
  };
  const hexane: SwellingSolventInfo = {
    name: 'Hexane',
    hsp: { deltaD: 14.9, deltaP: 0.0, deltaH: 0.0 },
    molarVolume: 131.6,
  };
  const acetone: SwellingSolventInfo = {
    name: 'Acetone',
    hsp: { deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 },
    molarVolume: 74.0,
  };

  const crosslinkDensity = 0.0001; // mol/cm³

  describe('evaluateRubberCompound', () => {
    it('NR + Carbon Black + トルエン で計算できる', () => {
      const result = evaluateRubberCompound(
        nrHSP,
        carbonBlack,
        crosslinkDensity,
        [toluene],
      );

      // フィラー分散性
      expect(result.fillerDispersion.fillerName).toBe('Carbon Black');
      expect(result.fillerDispersion.ra).toBeGreaterThan(0);
      expect(result.fillerDispersion.chi).toBeGreaterThan(0);
      expect(['Excellent', 'Good', 'Fair', 'Poor']).toContain(result.fillerDispersion.compatibility);

      // 溶媒膨潤
      expect(result.solventSwelling).toHaveLength(1);
      expect(result.solventSwelling[0].solventName).toBe('Toluene');
      expect(result.solventSwelling[0].swellingRatio).toBeGreaterThan(1);
      expect(['High', 'Moderate', 'Low', 'Negligible']).toContain(
        result.solventSwelling[0].swellingLevel,
      );
    });

    it('複数溶媒で膨潤度を比較できる', () => {
      const result = evaluateRubberCompound(
        nrHSP,
        carbonBlack,
        crosslinkDensity,
        [toluene, hexane, acetone],
      );

      expect(result.solventSwelling).toHaveLength(3);

      // トルエンはNRに近いHSP → chi小さい → 膨潤度高い
      const tolueneResult = result.solventSwelling.find((s) => s.solventName === 'Toluene')!;
      const acetoneResult = result.solventSwelling.find((s) => s.solventName === 'Acetone')!;

      expect(tolueneResult.chi).toBeLessThan(acetoneResult.chi);
    });

    it('Carbon BlackとNRのRaが適切な範囲', () => {
      const result = evaluateRubberCompound(
        nrHSP,
        carbonBlack,
        crosslinkDensity,
        [toluene],
      );

      // Carbon Black と NRのRa ≈ 4.3 (dD差が主因)
      expect(result.fillerDispersion.ra).toBeGreaterThan(2);
      expect(result.fillerDispersion.ra).toBeLessThan(10);
    });

    it('架橋密度が高いと膨潤度が低い', () => {
      const lowCrosslink = evaluateRubberCompound(
        nrHSP,
        carbonBlack,
        0.00005,
        [toluene],
      );
      const highCrosslink = evaluateRubberCompound(
        nrHSP,
        carbonBlack,
        0.001,
        [toluene],
      );

      expect(highCrosslink.solventSwelling[0].swellingRatio).toBeLessThan(
        lowCrosslink.solventSwelling[0].swellingRatio,
      );
    });

    it('シリカフィラーでも計算できる', () => {
      const silica: FillerInfo = {
        name: 'Silica',
        hsp: { deltaD: 15.5, deltaP: 7.0, deltaH: 12.0 },
      };

      const result = evaluateRubberCompound(
        nrHSP,
        silica,
        crosslinkDensity,
        [toluene],
      );

      // シリカはNRからHSPが遠い → chiが大きい
      expect(result.fillerDispersion.chi).toBeGreaterThan(0);
      expect(result.fillerDispersion.ra).toBeGreaterThan(0);
    });

    it('架橋密度が0以下の場合エラー', () => {
      expect(() =>
        evaluateRubberCompound(nrHSP, carbonBlack, 0, [toluene]),
      ).toThrow('Crosslink density');
    });

    it('溶媒リストが空の場合エラー', () => {
      expect(() =>
        evaluateRubberCompound(nrHSP, carbonBlack, crosslinkDensity, []),
      ).toThrow('At least one solvent');
    });

    it('溶媒のモル体積が0以下の場合エラー', () => {
      const badSolvent: SwellingSolventInfo = {
        name: 'Bad',
        hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
        molarVolume: -10,
      };
      expect(() =>
        evaluateRubberCompound(nrHSP, carbonBlack, crosslinkDensity, [badSolvent]),
      ).toThrow('Molar volume');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { calculateHydrogelSwelling } from '../../src/core/hydrogel-swelling-equilibrium';
import type { HSPValues } from '../../src/core/types';

describe('hydrogel-swelling-equilibrium', () => {
  // PAAm (ポリアクリルアミド) ゲル
  const paamHSP: HSPValues = { deltaD: 17.4, deltaP: 14.6, deltaH: 18.0 };
  // 水
  const waterHSP: HSPValues = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };
  // 水のモル体積
  const waterVs = 18.0;

  describe('calculateHydrogelSwelling', () => {
    it('PAAm-gel + 水 で適切な膨潤度が得られる', () => {
      const crosslinkDensity = 0.001; // mol/cm³ (典型的なハイドロゲル)
      const result = calculateHydrogelSwelling(
        paamHSP,
        waterHSP,
        crosslinkDensity,
        waterVs,
      );

      expect(result.chi).toBeGreaterThan(0);
      expect(result.phiP).toBeGreaterThan(0);
      expect(result.phiP).toBeLessThan(1);
      expect(result.swellingRatio).toBeGreaterThan(1);
      // Q = 1/phiP
      expect(result.swellingRatio).toBeCloseTo(1 / result.phiP, 5);
    });

    it('架橋密度が高いと膨潤度が低い', () => {
      const lowCrosslink = calculateHydrogelSwelling(paamHSP, waterHSP, 0.0005, waterVs);
      const highCrosslink = calculateHydrogelSwelling(paamHSP, waterHSP, 0.005, waterVs);

      // 架橋密度 高 → phiP 大 → Q 小
      expect(highCrosslink.phiP).toBeGreaterThan(lowCrosslink.phiP);
      expect(highCrosslink.swellingRatio).toBeLessThan(lowCrosslink.swellingRatio);
    });

    it('HSPが近い溶媒の方が膨潤しやすい（chiが小さい）', () => {
      const crosslinkDensity = 0.001;

      // DMF (HSPがPAAmに近い)
      const dmfHSP: HSPValues = { deltaD: 17.4, deltaP: 13.7, deltaH: 11.3 };
      const dmfVs = 77.0;

      const waterResult = calculateHydrogelSwelling(paamHSP, waterHSP, crosslinkDensity, waterVs);
      const dmfResult = calculateHydrogelSwelling(paamHSP, dmfHSP, crosslinkDensity, dmfVs);

      // DMFの方がHSPが近い → chiが小さい
      expect(dmfResult.chi).toBeLessThan(waterResult.chi);
    });

    it('温度が高いとchiが小さくなる', () => {
      const crosslinkDensity = 0.001;
      const result25C = calculateHydrogelSwelling(paamHSP, waterHSP, crosslinkDensity, waterVs, 298.15);
      const result60C = calculateHydrogelSwelling(paamHSP, waterHSP, crosslinkDensity, waterVs, 333.15);

      // chi ∝ 1/T → 高温でchi小
      expect(result60C.chi).toBeLessThan(result25C.chi);
    });

    it('エタノールでも膨潤計算ができる', () => {
      const ethanolHSP: HSPValues = { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 };
      const ethanolVs = 58.5;
      const crosslinkDensity = 0.001;

      const result = calculateHydrogelSwelling(paamHSP, ethanolHSP, crosslinkDensity, ethanolVs);

      expect(result.chi).toBeGreaterThan(0);
      expect(result.phiP).toBeGreaterThan(0);
      expect(result.swellingRatio).toBeGreaterThan(1);
    });

    it('架橋密度が0以下の場合エラー', () => {
      expect(() =>
        calculateHydrogelSwelling(paamHSP, waterHSP, 0, waterVs),
      ).toThrow('Crosslink density');
    });

    it('溶媒モル体積が0以下の場合エラー', () => {
      expect(() =>
        calculateHydrogelSwelling(paamHSP, waterHSP, 0.001, 0),
      ).toThrow('Solvent molar volume');
    });

    it('温度が0以下の場合エラー', () => {
      expect(() =>
        calculateHydrogelSwelling(paamHSP, waterHSP, 0.001, waterVs, -10),
      ).toThrow('Temperature');
    });
  });
});

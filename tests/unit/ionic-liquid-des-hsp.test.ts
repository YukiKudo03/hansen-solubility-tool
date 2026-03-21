import { describe, it, expect } from 'vitest';
import { estimateILHSP } from '../../src/core/ionic-liquid-des-hsp';
import type { HSPValues } from '../../src/core/types';

describe('ionic-liquid-des-hsp', () => {
  // [BMIM][BF4] — 代表的なイオン液体
  const cationHSP: HSPValues = { deltaD: 18.0, deltaP: 12.0, deltaH: 8.0 };
  const anionHSP: HSPValues = { deltaD: 16.0, deltaP: 15.0, deltaH: 14.0 };

  describe('estimateILHSP', () => {
    it('等モル比で中間のHSPを返す', () => {
      const result = estimateILHSP(cationHSP, anionHSP, [1, 1]);
      expect(result.blendHSP.deltaD).toBeCloseTo(17.0, 1);
      expect(result.blendHSP.deltaP).toBeCloseTo(13.5, 1);
      expect(result.blendHSP.deltaH).toBeCloseTo(11.0, 1);
    });

    it('モル比2:1でカチオン寄りのHSPを返す', () => {
      const result = estimateILHSP(cationHSP, anionHSP, [2, 1]);
      expect(result.blendHSP.deltaD).toBeCloseTo((18.0 * 2 + 16.0) / 3, 1);
      expect(result.blendHSP.deltaP).toBeCloseTo((12.0 * 2 + 15.0) / 3, 1);
    });

    it('全プロパティが返される', () => {
      const result = estimateILHSP(cationHSP, anionHSP);
      expect(result.cationHSP).toEqual(cationHSP);
      expect(result.anionHSP).toEqual(anionHSP);
      expect(result.cationRatio).toBe(1);
      expect(result.anionRatio).toBe(1);
      expect(result.temperatureCorrected).toBe(false);
      expect(result.evaluatedAt).toBeInstanceOf(Date);
    });

    it('温度補正ありの場合dHが変化する', () => {
      const resultNoCorr = estimateILHSP(cationHSP, anionHSP, [1, 1]);
      const resultWithCorr = estimateILHSP(cationHSP, anionHSP, [1, 1], 373.15, 298.15);
      expect(resultWithCorr.temperatureCorrected).toBe(true);
      expect(resultWithCorr.temperature).toBe(373.15);
      // 温度上昇でdHは減少する
      expect(resultWithCorr.blendHSP.deltaH).toBeLessThan(resultNoCorr.blendHSP.deltaH);
    });

    it('基準温度と同じ場合は補正なし', () => {
      const result = estimateILHSP(cationHSP, anionHSP, [1, 1], 298.15, 298.15);
      expect(result.temperatureCorrected).toBe(false);
    });

    it('比率が正でない場合エラー', () => {
      expect(() => estimateILHSP(cationHSP, anionHSP, [0, 1])).toThrow();
      expect(() => estimateILHSP(cationHSP, anionHSP, [1, -1])).toThrow();
    });

    it('デフォルト比率は[1,1]', () => {
      const result = estimateILHSP(cationHSP, anionHSP);
      expect(result.cationRatio).toBe(1);
      expect(result.anionRatio).toBe(1);
    });
  });
});

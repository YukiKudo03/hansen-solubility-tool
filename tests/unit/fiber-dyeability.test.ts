import { describe, it, expect } from 'vitest';
import { screenDyeability, getDyeabilityInfo } from '../../src/core/fiber-dyeability';
import type { HSPValues } from '../../src/core/types';
import type { Dye } from '../../src/core/fiber-dyeability';

describe('fiber-dyeability', () => {
  // PET繊維
  const petHSP: HSPValues = { deltaD: 19.5, deltaP: 3.5, deltaH: 8.6 };
  const petR0 = 7.0;

  // 染料候補
  const disperseRed: Dye = {
    name: 'Disperse Red 1',
    hsp: { deltaD: 19.8, deltaP: 8.5, deltaH: 7.2 },
  };
  const disperseBlue: Dye = {
    name: 'Disperse Blue 56',
    hsp: { deltaD: 20.0, deltaP: 4.0, deltaH: 8.0 },
  };
  const disperseYellow: Dye = {
    name: 'Disperse Yellow 3',
    hsp: { deltaD: 18.5, deltaP: 6.5, deltaH: 9.5 },
  };
  const reactiveBlue: Dye = {
    name: 'Reactive Blue 19',
    hsp: { deltaD: 17.5, deltaP: 14.0, deltaH: 16.0 },
  };

  describe('screenDyeability', () => {
    it('PET繊維 vs 複数染料でスクリーニングできる', () => {
      const results = screenDyeability(petHSP, petR0, [
        disperseRed, disperseBlue, disperseYellow, reactiveBlue,
      ]);

      expect(results).toHaveLength(4);
      results.forEach((r) => {
        expect(r.ra).toBeGreaterThan(0);
        expect(r.red).toBeGreaterThan(0);
        expect(['Excellent', 'Good', 'Moderate', 'Poor']).toContain(r.dyeability);
      });
    });

    it('結果がRED昇順でソートされている', () => {
      const results = screenDyeability(petHSP, petR0, [
        disperseRed, disperseBlue, disperseYellow, reactiveBlue,
      ]);

      for (let i = 1; i < results.length; i++) {
        expect(results[i].red).toBeGreaterThanOrEqual(results[i - 1].red);
      }
    });

    it('Disperse Blue 56はPETに近いHSP → 染色性が高い', () => {
      const results = screenDyeability(petHSP, petR0, [disperseBlue, reactiveBlue]);

      const blueResult = results.find((r) => r.dye.name === 'Disperse Blue 56')!;
      const reactResult = results.find((r) => r.dye.name === 'Reactive Blue 19')!;

      // Disperse Blue 56の方がPETに近い → REDが小さい
      expect(blueResult.red).toBeLessThan(reactResult.red);
    });

    it('Reactive染料はPETに対して染色性が低い（HSP距離大）', () => {
      const results = screenDyeability(petHSP, petR0, [reactiveBlue]);

      // Reactive染料はPET向けではない（高極性・高水素結合）
      expect(results[0].red).toBeGreaterThan(1.0);
      expect(results[0].dyeability).toBe('Poor');
    });

    it('非常に近いHSPの染料はExcellent', () => {
      const closeDye: Dye = {
        name: 'Perfect Match Dye',
        hsp: { deltaD: 19.5, deltaP: 3.5, deltaH: 8.6 },
      };
      const results = screenDyeability(petHSP, petR0, [closeDye]);

      expect(results[0].red).toBeLessThan(0.01);
      expect(results[0].dyeability).toBe('Excellent');
    });

    it('ナイロン繊維でも計算できる', () => {
      const nylonHSP: HSPValues = { deltaD: 17.0, deltaP: 6.8, deltaH: 10.6 };
      const nylonR0 = 6.0;

      const results = screenDyeability(nylonHSP, nylonR0, [disperseRed, disperseBlue]);

      expect(results).toHaveLength(2);
      results.forEach((r) => {
        expect(r.ra).toBeGreaterThan(0);
        expect(r.red).toBeGreaterThan(0);
      });
    });

    it('R0が0以下の場合エラー', () => {
      expect(() =>
        screenDyeability(petHSP, 0, [disperseRed]),
      ).toThrow('Interaction radius');
    });

    it('空の染料リストでエラー', () => {
      expect(() =>
        screenDyeability(petHSP, petR0, []),
      ).toThrow('At least one dye');
    });
  });

  describe('getDyeabilityInfo', () => {
    it('Excellent の情報を取得できる', () => {
      const info = getDyeabilityInfo('Excellent');
      expect(info.level).toBe('Excellent');
      expect(info.label).toBe('優秀');
    });

    it('Good の情報を取得できる', () => {
      const info = getDyeabilityInfo('Good');
      expect(info.level).toBe('Good');
      expect(info.label).toBe('良好');
    });

    it('Moderate の情報を取得できる', () => {
      const info = getDyeabilityInfo('Moderate');
      expect(info.level).toBe('Moderate');
      expect(info.label).toBe('中程度');
    });

    it('Poor の情報を取得できる', () => {
      const info = getDyeabilityInfo('Poor');
      expect(info.level).toBe('Poor');
      expect(info.label).toBe('不良');
    });
  });
});

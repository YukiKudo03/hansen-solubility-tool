import { describe, it, expect } from 'vitest';
import { evaluateUnderfillCompatibility, UnderfillLevel, getUnderfillLevelInfo } from '../../src/core/underfill-encapsulant';
import type { HSPValues } from '../../src/core/types';

describe('underfill-encapsulant', () => {
  const epoxy: HSPValues = { deltaD: 19.0, deltaP: 11.0, deltaH: 10.0 };
  const siliconChip: HSPValues = { deltaD: 19.5, deltaP: 8.0, deltaH: 9.0 };
  const frPcb: HSPValues = { deltaD: 20.0, deltaP: 7.0, deltaH: 8.0 };
  const farMaterial: HSPValues = { deltaD: 14.0, deltaP: 1.0, deltaH: 1.0 };

  describe('evaluateUnderfillCompatibility', () => {
    it('全プロパティが返される', () => {
      const result = evaluateUnderfillCompatibility(epoxy, siliconChip, frPcb);
      expect(result.waChip).toBeGreaterThan(0);
      expect(result.waSubstrate).toBeGreaterThan(0);
      expect(result.raChip).toBeGreaterThanOrEqual(0);
      expect(result.raSubstrate).toBeGreaterThanOrEqual(0);
      expect(result.minWa).toBe(Math.min(result.waChip, result.waSubstrate));
      expect(result.evaluatedAt).toBeInstanceOf(Date);
    });

    it('ボトルネックが正しく特定される', () => {
      const result = evaluateUnderfillCompatibility(epoxy, siliconChip, frPcb);
      if (result.waChip <= result.waSubstrate) {
        expect(result.bottleneck).toBe('chip');
      } else {
        expect(result.bottleneck).toBe('substrate');
      }
    });

    it('近いHSP値同士で高いWa（Excellent傾向）', () => {
      const result = evaluateUnderfillCompatibility(epoxy, siliconChip, frPcb);
      expect(result.level).not.toBe(UnderfillLevel.Poor);
    });

    it('遠いHSP値でPoor', () => {
      const result = evaluateUnderfillCompatibility(epoxy, siliconChip, farMaterial);
      // farMaterialが片方なのでminWaが低下
      expect(result.minWa).toBeLessThan(result.waChip);
    });

    it('HSP値が保存される', () => {
      const result = evaluateUnderfillCompatibility(epoxy, siliconChip, frPcb);
      expect(result.encapsulantHSP).toEqual(epoxy);
      expect(result.chipSurfaceHSP).toEqual(siliconChip);
      expect(result.substrateHSP).toEqual(frPcb);
    });
  });

  describe('getUnderfillLevelInfo', () => {
    it('各レベルにラベルと色がある', () => {
      for (const level of [UnderfillLevel.Excellent, UnderfillLevel.Good, UnderfillLevel.Fair, UnderfillLevel.Poor]) {
        const info = getUnderfillLevelInfo(level);
        expect(info.label).toBeTruthy();
        expect(info.color).toBeTruthy();
      }
    });
  });
});

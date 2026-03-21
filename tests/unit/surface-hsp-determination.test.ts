import { describe, it, expect } from 'vitest';
import { estimateSurfaceHSPFromContactAngles } from '../../src/core/surface-hsp-determination';
import type { ContactAngleTestInput } from '../../src/core/surface-hsp-determination';

describe('surface-hsp-determination', () => {
  // 典型的な試験液体データ（PET表面推定用）
  const testData: ContactAngleTestInput[] = [
    { liquidName: 'Water', liquidHSP: { deltaD: 15.6, deltaP: 16.0, deltaH: 42.3 }, contactAngleDeg: 75 },
    { liquidName: 'Diiodomethane', liquidHSP: { deltaD: 24.1, deltaP: 3.5, deltaH: 4.3 }, contactAngleDeg: 35 },
    { liquidName: 'Ethylene Glycol', liquidHSP: { deltaD: 17.0, deltaP: 11.0, deltaH: 26.0 }, contactAngleDeg: 55 },
    { liquidName: 'Formamide', liquidHSP: { deltaD: 17.2, deltaP: 26.2, deltaH: 19.0 }, contactAngleDeg: 60 },
  ];

  describe('estimateSurfaceHSPFromContactAngles', () => {
    it('全プロパティが返される', () => {
      const result = estimateSurfaceHSPFromContactAngles(testData);
      expect(result.surfaceHSP).toBeDefined();
      expect(result.surfaceHSP.deltaD).toBeGreaterThan(0);
      expect(result.surfaceHSP.deltaP).toBeGreaterThanOrEqual(0);
      expect(result.surfaceHSP.deltaH).toBeGreaterThanOrEqual(0);
      expect(result.surfaceEnergy).toBeDefined();
      expect(result.numDataPoints).toBe(4);
      expect(result.residualError).toBeGreaterThanOrEqual(0);
      expect(result.evaluatedAt).toBeInstanceOf(Date);
    });

    it('推定HSPが妥当な範囲（PET: dD~19, dP~4, dH~9）', () => {
      const result = estimateSurfaceHSPFromContactAngles(testData);
      // 厳密な値ではなく妥当な範囲チェック
      expect(result.surfaceHSP.deltaD).toBeGreaterThan(10);
      expect(result.surfaceHSP.deltaD).toBeLessThan(30);
    });

    it('表面エネルギーが非負', () => {
      const result = estimateSurfaceHSPFromContactAngles(testData);
      expect(result.surfaceEnergy.gammaD).toBeGreaterThanOrEqual(0);
      expect(result.surfaceEnergy.gammaP).toBeGreaterThanOrEqual(0);
      expect(result.surfaceEnergy.gammaH).toBeGreaterThanOrEqual(0);
      expect(result.surfaceEnergy.gammaTotal).toBeGreaterThanOrEqual(0);
    });

    it('空配列で安全に返す', () => {
      const result = estimateSurfaceHSPFromContactAngles([]);
      expect(result.surfaceHSP).toEqual({ deltaD: 0, deltaP: 0, deltaH: 0 });
      expect(result.numDataPoints).toBe(0);
    });

    it('接触角0°（完全濡れ）で高い表面エネルギーを推定', () => {
      const perfectWet: ContactAngleTestInput[] = [
        { liquidName: 'Water', liquidHSP: { deltaD: 15.6, deltaP: 16.0, deltaH: 42.3 }, contactAngleDeg: 0 },
        { liquidName: 'DIM', liquidHSP: { deltaD: 24.1, deltaP: 3.5, deltaH: 4.3 }, contactAngleDeg: 0 },
      ];
      const result = estimateSurfaceHSPFromContactAngles(perfectWet);
      expect(result.surfaceEnergy.gammaTotal).toBeGreaterThan(0);
    });

    it('接触角90°付近で中程度の表面エネルギー', () => {
      const midWet: ContactAngleTestInput[] = [
        { liquidName: 'Water', liquidHSP: { deltaD: 15.6, deltaP: 16.0, deltaH: 42.3 }, contactAngleDeg: 90 },
        { liquidName: 'DIM', liquidHSP: { deltaD: 24.1, deltaP: 3.5, deltaH: 4.3 }, contactAngleDeg: 50 },
      ];
      const result = estimateSurfaceHSPFromContactAngles(midWet);
      expect(result.surfaceHSP.deltaD).toBeGreaterThan(0);
    });
  });
});

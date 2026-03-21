import { describe, it, expect } from 'vitest';
import { bootstrapHSPUncertainty } from '../../src/core/hsp-uncertainty-quantification';
import type { SolventClassification } from '../../src/core/sphere-fitting';

describe('hsp-uncertainty-quantification', () => {
  const classifications: SolventClassification[] = [
    { solvent: { hsp: { deltaD: 18.2, deltaP: 6.3, deltaH: 6.1 }, name: 'DCM' }, isGood: true },
    { solvent: { hsp: { deltaD: 17.8, deltaP: 3.1, deltaH: 5.7 }, name: 'Chloroform' }, isGood: true },
    { solvent: { hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 }, name: 'Toluene' }, isGood: true },
    { solvent: { hsp: { deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 }, name: 'Acetone' }, isGood: true },
    { solvent: { hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 }, name: 'Ethanol' }, isGood: false },
    { solvent: { hsp: { deltaD: 15.6, deltaP: 16.0, deltaH: 42.3 }, name: 'Water' }, isGood: false },
    { solvent: { hsp: { deltaD: 15.1, deltaP: 12.3, deltaH: 22.3 }, name: 'Methanol' }, isGood: false },
  ];

  describe('bootstrapHSPUncertainty', () => {
    it('全プロパティが返される', () => {
      const result = bootstrapHSPUncertainty(classifications, 20);
      expect(result.center).toBeDefined();
      expect(result.r0).toBeGreaterThan(0);
      expect(result.confidence95).toBeDefined();
      expect(result.numSamples).toBe(20);
      expect(result.numClassifications).toBe(7);
      expect(result.evaluatedAt).toBeInstanceOf(Date);
    });

    it('信頼区間が中心値を含む', () => {
      const result = bootstrapHSPUncertainty(classifications, 50);
      expect(result.confidence95.deltaD.low).toBeLessThanOrEqual(result.center.deltaD + 5);
      expect(result.confidence95.deltaD.high).toBeGreaterThanOrEqual(result.center.deltaD - 5);
    });

    it('信頼区間のlow <= high', () => {
      const result = bootstrapHSPUncertainty(classifications, 30);
      expect(result.confidence95.deltaD.low).toBeLessThanOrEqual(result.confidence95.deltaD.high);
      expect(result.confidence95.deltaP.low).toBeLessThanOrEqual(result.confidence95.deltaP.high);
      expect(result.confidence95.deltaH.low).toBeLessThanOrEqual(result.confidence95.deltaH.high);
      expect(result.confidence95.r0.low).toBeLessThanOrEqual(result.confidence95.r0.high);
    });

    it('空配列で安全に返す', () => {
      const result = bootstrapHSPUncertainty([], 10);
      expect(result.center).toEqual({ deltaD: 0, deltaP: 0, deltaH: 0 });
      expect(result.r0).toBe(0);
      expect(result.numClassifications).toBe(0);
    });

    it('サンプル数1でも動作', () => {
      const result = bootstrapHSPUncertainty(classifications, 1);
      expect(result.numSamples).toBe(1);
      expect(result.center.deltaD).toBeGreaterThan(0);
    });
  });
});

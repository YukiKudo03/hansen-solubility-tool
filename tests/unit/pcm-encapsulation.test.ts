import { describe, it, expect } from 'vitest';
import { screenPCMEncapsulation, classifyPCMEncapsulation, PCMEncapsulationLevel, getPCMEncapsulationLevelInfo } from '../../src/core/pcm-encapsulation';
import type { HSPValues } from '../../src/core/types';

describe('pcm-encapsulation', () => {
  // パラフィンワックスPCM
  const pcmHSP: HSPValues = { deltaD: 16.0, deltaP: 0.0, deltaH: 0.0 };
  const pcmR0 = 5.0;

  const shellMaterials = [
    { name: 'Melamine-formaldehyde', hsp: { deltaD: 20.0, deltaP: 12.0, deltaH: 10.0 } },
    { name: 'PMMA', hsp: { deltaD: 18.6, deltaP: 10.5, deltaH: 7.5 } },
    { name: 'PE', hsp: { deltaD: 16.6, deltaP: 0.4, deltaH: 2.8 } },
    { name: 'PS', hsp: { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 } },
  ];

  describe('classifyPCMEncapsulation', () => {
    it('RED < 1.0 → Poor', () => {
      expect(classifyPCMEncapsulation(0.5)).toBe(PCMEncapsulationLevel.Poor);
    });
    it('RED = 1.2 → Good', () => {
      expect(classifyPCMEncapsulation(1.2)).toBe(PCMEncapsulationLevel.Good);
    });
    it('RED = 2.0 → Excellent', () => {
      expect(classifyPCMEncapsulation(2.0)).toBe(PCMEncapsulationLevel.Excellent);
    });
    it('負のREDでエラー', () => {
      expect(() => classifyPCMEncapsulation(-1)).toThrow();
    });
  });

  describe('screenPCMEncapsulation', () => {
    it('全シェル材の結果を返す', () => {
      const results = screenPCMEncapsulation(pcmHSP, pcmR0, shellMaterials);
      expect(results).toHaveLength(4);
    });

    it('RED降順（安定性高い順）にソートされる', () => {
      const results = screenPCMEncapsulation(pcmHSP, pcmR0, shellMaterials);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].red).toBeLessThanOrEqual(results[i - 1].red);
      }
    });

    it('Melamine-formaldehydeが最もRED大（カプセル安定）', () => {
      const results = screenPCMEncapsulation(pcmHSP, pcmR0, shellMaterials);
      // MEF: HSPがPCMから遠い → RED大
      const mef = results.find(r => r.shellMaterialName === 'Melamine-formaldehyde');
      const pe = results.find(r => r.shellMaterialName === 'PE');
      expect(mef!.red).toBeGreaterThan(pe!.red);
    });

    it('PEが最もRED小（PCMに近い → 透過しやすい）', () => {
      const results = screenPCMEncapsulation(pcmHSP, pcmR0, shellMaterials);
      const pe = results.find(r => r.shellMaterialName === 'PE');
      expect(pe!.red).toBeLessThan(2.0);
    });

    it('空配列で空結果', () => {
      const results = screenPCMEncapsulation(pcmHSP, pcmR0, []);
      expect(results).toHaveLength(0);
    });
  });

  describe('getPCMEncapsulationLevelInfo', () => {
    it('各レベルにラベルがある', () => {
      for (const level of [1, 2, 3] as PCMEncapsulationLevel[]) {
        const info = getPCMEncapsulationLevelInfo(level);
        expect(info.label).toBeTruthy();
        expect(info.color).toBeTruthy();
      }
    });
  });
});

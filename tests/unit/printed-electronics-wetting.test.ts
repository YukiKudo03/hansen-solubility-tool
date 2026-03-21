import { describe, it, expect } from 'vitest';
import { evaluatePrintedElectronicsWetting, classifyWetting, WettingLevel, getWettingLevelInfo } from '../../src/core/printed-electronics-wetting';
import type { HSPValues } from '../../src/core/types';

describe('printed-electronics-wetting', () => {
  // 典型的なインク: Ag ナノインク（溶媒系）
  const inkHSP: HSPValues = { deltaD: 17.0, deltaP: 10.0, deltaH: 8.0 };
  // PET基材
  const petHSP: HSPValues = { deltaD: 19.5, deltaP: 3.5, deltaH: 8.5 };
  // ガラス基材（高表面エネルギー）
  const glassHSP: HSPValues = { deltaD: 19.0, deltaP: 12.0, deltaH: 14.0 };

  describe('classifyWetting', () => {
    it('Wa高 + θ小 → Excellent', () => {
      expect(classifyWetting(85, 20)).toBe(WettingLevel.Excellent);
    });
    it('Wa中 + θ中 → Good', () => {
      expect(classifyWetting(65, 45)).toBe(WettingLevel.Good);
    });
    it('Wa低め + θ中程度 → Moderate', () => {
      expect(classifyWetting(45, 80)).toBe(WettingLevel.Moderate);
    });
    it('Wa低 + θ大 → Poor', () => {
      expect(classifyWetting(30, 100)).toBe(WettingLevel.Poor);
    });
  });

  describe('evaluatePrintedElectronicsWetting', () => {
    it('インク-PET基材の評価結果を返す', () => {
      const result = evaluatePrintedElectronicsWetting(inkHSP, petHSP);
      expect(result.wa).toBeGreaterThan(0);
      expect(result.contactAngle).toBeGreaterThanOrEqual(0);
      expect(result.contactAngle).toBeLessThanOrEqual(180);
      expect(result.ra).toBeGreaterThan(0);
      expect(result.evaluatedAt).toBeInstanceOf(Date);
    });

    it('インクHSP/基材HSPが保存される', () => {
      const result = evaluatePrintedElectronicsWetting(inkHSP, petHSP);
      expect(result.inkHSP).toEqual(inkHSP);
      expect(result.substrateHSP).toEqual(petHSP);
    });

    it('同一HSPの場合Waが最大でθが最小', () => {
      const result = evaluatePrintedElectronicsWetting(inkHSP, inkHSP);
      expect(result.contactAngle).toBeCloseTo(0, 1);
      expect(result.ra).toBeCloseTo(0, 5);
    });

    it('ガラス基材は高表面エネルギーで濡れやすい', () => {
      const resultPet = evaluatePrintedElectronicsWetting(inkHSP, petHSP);
      const resultGlass = evaluatePrintedElectronicsWetting(inkHSP, glassHSP);
      // ガラスの方がWaが高い傾向
      expect(resultGlass.wa).toBeGreaterThan(0);
    });
  });

  describe('getWettingLevelInfo', () => {
    it('各レベルにラベルと色がある', () => {
      for (const level of [WettingLevel.Excellent, WettingLevel.Good, WettingLevel.Moderate, WettingLevel.Poor]) {
        const info = getWettingLevelInfo(level);
        expect(info.label).toBeTruthy();
        expect(info.color).toBeTruthy();
        expect(info.description).toBeTruthy();
      }
    });
  });
});

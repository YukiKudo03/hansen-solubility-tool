import { describe, it, expect } from 'vitest';
import {
  classifyPrimerlessAdhesion,
  optimizePrimerlessAdhesion,
  getPrimerlessAdhesionLevelInfo,
  PrimerlessAdhesionLevel,
} from '../../src/core/primerless-adhesion';

describe('classifyPrimerlessAdhesion', () => {
  it('Wa > 80 → Excellent', () => {
    expect(classifyPrimerlessAdhesion(81)).toBe(PrimerlessAdhesionLevel.Excellent);
    expect(classifyPrimerlessAdhesion(100)).toBe(PrimerlessAdhesionLevel.Excellent);
  });

  it('60 < Wa ≤ 80 → Good', () => {
    expect(classifyPrimerlessAdhesion(61)).toBe(PrimerlessAdhesionLevel.Good);
    expect(classifyPrimerlessAdhesion(80)).toBe(PrimerlessAdhesionLevel.Good);
  });

  it('40 < Wa ≤ 60 → Fair', () => {
    expect(classifyPrimerlessAdhesion(41)).toBe(PrimerlessAdhesionLevel.Fair);
    expect(classifyPrimerlessAdhesion(60)).toBe(PrimerlessAdhesionLevel.Fair);
  });

  it('Wa ≤ 40 → Poor', () => {
    expect(classifyPrimerlessAdhesion(40)).toBe(PrimerlessAdhesionLevel.Poor);
    expect(classifyPrimerlessAdhesion(0)).toBe(PrimerlessAdhesionLevel.Poor);
  });
});

describe('getPrimerlessAdhesionLevelInfo', () => {
  it('各レベルの情報を返す', () => {
    for (const level of [PrimerlessAdhesionLevel.Excellent, PrimerlessAdhesionLevel.Good, PrimerlessAdhesionLevel.Fair, PrimerlessAdhesionLevel.Poor]) {
      const info = getPrimerlessAdhesionLevelInfo(level);
      expect(info.label).toBeDefined();
      expect(info.labelEn).toBeDefined();
      expect(info.description).toBeDefined();
    }
  });
});

describe('optimizePrimerlessAdhesion', () => {
  // エポキシ接着剤
  const adhesiveHSP = { deltaD: 18.0, deltaP: 10.0, deltaH: 8.0 };
  // PP基材（低極性）
  const substrateHSP = { deltaD: 16.0, deltaP: 0.0, deltaH: 2.0 };

  it('結果に全フィールドが含まれる', () => {
    const result = optimizePrimerlessAdhesion(adhesiveHSP, substrateHSP);
    expect(result.adhesiveHSP).toEqual(adhesiveHSP);
    expect(result.substrateHSP).toEqual(substrateHSP);
    expect(result.wa).toBeGreaterThanOrEqual(0);
    expect(result.ra).toBeGreaterThanOrEqual(0);
    expect(result.level).toBeDefined();
    expect(result.optimalAdhesiveHSP).toBeDefined();
    expect(result.optimalWa).toBeGreaterThanOrEqual(0);
    expect(result.optimalRa).toBeGreaterThanOrEqual(0);
    expect(result.improvementPotential).toBeDefined();
    expect(result.evaluatedAt).toBeInstanceOf(Date);
  });

  it('最適HSPは基材HSPと一致する', () => {
    const result = optimizePrimerlessAdhesion(adhesiveHSP, substrateHSP);
    expect(result.optimalAdhesiveHSP.deltaD).toBeCloseTo(substrateHSP.deltaD, 6);
    expect(result.optimalAdhesiveHSP.deltaP).toBeCloseTo(substrateHSP.deltaP, 6);
    expect(result.optimalAdhesiveHSP.deltaH).toBeCloseTo(substrateHSP.deltaH, 6);
  });

  it('最適HSPでのRaは0', () => {
    const result = optimizePrimerlessAdhesion(adhesiveHSP, substrateHSP);
    expect(result.optimalRa).toBeCloseTo(0, 6);
  });

  it('最適HSPでのRaは最小(0)', () => {
    // Wa最大ではなくRa最小が最適条件
    const result = optimizePrimerlessAdhesion(adhesiveHSP, substrateHSP);
    expect(result.optimalRa).toBeLessThanOrEqual(result.ra);
  });

  it('改善余地が計算される（正負どちらも可）', () => {
    const result = optimizePrimerlessAdhesion(adhesiveHSP, substrateHSP);
    expect(Number.isFinite(result.improvementPotential)).toBe(true);
  });

  it('接着剤HSPが基材と同一なら改善余地0%', () => {
    const result = optimizePrimerlessAdhesion(substrateHSP, substrateHSP);
    expect(result.ra).toBeCloseTo(0, 6);
    expect(result.improvementPotential).toBeCloseTo(0, 1);
  });

  it('HSP距離が大きいほどWaが小さい', () => {
    const closeAdhesive = { deltaD: 16.5, deltaP: 0.5, deltaH: 2.5 };
    const farAdhesive = { deltaD: 20.0, deltaP: 15.0, deltaH: 15.0 };
    const resultClose = optimizePrimerlessAdhesion(closeAdhesive, substrateHSP);
    const resultFar = optimizePrimerlessAdhesion(farAdhesive, substrateHSP);
    expect(resultClose.ra).toBeLessThan(resultFar.ra);
  });
});

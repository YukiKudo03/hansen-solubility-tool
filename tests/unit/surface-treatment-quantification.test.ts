/**
 * 表面処理効果定量化のテスト
 *
 * 文献参考:
 * - PP (polypropylene) コロナ/プラズマ処理による表面エネルギー変化
 * - HSPiP database polymer values
 */
import { describe, it, expect } from 'vitest';

import {
  quantifySurfaceTreatment,
} from '../../src/core/surface-treatment-quantification';

describe('quantifySurfaceTreatment', () => {
  it('PP未処理 → PP処理後 + Epoxy接着剤: Wa改善を検出', () => {
    // PP未処理: dD=16.4, dP=0, dH=1
    // PP処理後: dD=16.4, dP=5, dH=3
    // Epoxy adhesive: dD=18.5, dP=10, dH=9
    const result = quantifySurfaceTreatment(
      { deltaD: 16.4, deltaP: 0, deltaH: 1 },
      { deltaD: 16.4, deltaP: 5, deltaH: 3 },
      { deltaD: 18.5, deltaP: 10, deltaH: 9 },
    );

    expect(result.waAfter).toBeGreaterThan(result.waBefore);
    expect(result.improvementRatio).toBeGreaterThan(1);
    expect(result.isImproved).toBe(true);
    // Ra should decrease after treatment (closer to target)
    expect(result.raAfter).toBeLessThan(result.raBefore);
    expect(result.raReduction).toBeGreaterThan(0);
  });

  it('PP表面処理でimprovementRatioが合理的範囲', () => {
    const result = quantifySurfaceTreatment(
      { deltaD: 16.4, deltaP: 0, deltaH: 1 },
      { deltaD: 16.4, deltaP: 5, deltaH: 3 },
      { deltaD: 18.5, deltaP: 10, deltaH: 9 },
    );

    // Wa_before ≈ 57.9, Wa_after ≈ 61.9 → ratio ≈ 1.07
    expect(result.improvementRatio).toBeGreaterThan(1.0);
    expect(result.improvementRatio).toBeLessThan(2.0);
  });

  it('強い表面処理（PE処理前後）でより大きな改善', () => {
    // PE untreated: dD=16.8, dP=0.5, dH=2
    // PE plasma treated: dD=16.8, dP=8, dH=6
    // UV-cure ink: dD=18, dP=10, dH=8
    const result = quantifySurfaceTreatment(
      { deltaD: 16.8, deltaP: 0.5, deltaH: 2 },
      { deltaD: 16.8, deltaP: 8, deltaH: 6 },
      { deltaD: 18, deltaP: 10, deltaH: 8 },
    );

    expect(result.isImproved).toBe(true);
    expect(result.improvementRatio).toBeGreaterThan(1.05);
    expect(result.raReduction).toBeGreaterThan(0);
  });

  it('処理が逆効果の場合 isImproved=false', () => {
    // 処理によってターゲットから離れるケース
    // Before: close to target
    // After: moved away from target
    const result = quantifySurfaceTreatment(
      { deltaD: 18, deltaP: 10, deltaH: 8 },     // close to target
      { deltaD: 18, deltaP: 2, deltaH: 2 },       // treated: moved away
      { deltaD: 18.5, deltaP: 10, deltaH: 9 },    // target
    );

    expect(result.waAfter).toBeLessThan(result.waBefore);
    expect(result.improvementRatio).toBeLessThan(1);
    expect(result.isImproved).toBe(false);
  });

  it('処理前後が同一の場合 improvementRatio=1', () => {
    const sameHSP = { deltaD: 17, deltaP: 5, deltaH: 4 };
    const targetHSP = { deltaD: 18, deltaP: 10, deltaH: 8 };

    const result = quantifySurfaceTreatment(sameHSP, sameHSP, targetHSP);

    expect(result.improvementRatio).toBeCloseTo(1.0, 10);
    expect(result.raReduction).toBeCloseTo(0, 10);
    expect(result.isImproved).toBe(false);
  });

  it('Wa値の妥当性チェック', () => {
    const result = quantifySurfaceTreatment(
      { deltaD: 16.4, deltaP: 0, deltaH: 1 },
      { deltaD: 16.4, deltaP: 5, deltaH: 3 },
      { deltaD: 18.5, deltaP: 10, deltaH: 9 },
    );

    expect(result.waBefore).toBeGreaterThan(0);
    expect(result.waAfter).toBeGreaterThan(0);
    expect(result.waBefore).toBeLessThan(200);
    expect(result.waAfter).toBeLessThan(200);
  });
});

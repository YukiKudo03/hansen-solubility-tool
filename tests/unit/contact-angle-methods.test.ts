import { describe, it, expect } from 'vitest';
import {
  owensWendtContactAngle,
  splitHSPToSurfaceComponents,
} from '../../src/core/contact-angle-methods';
import type { HSPValues } from '../../src/core/types';

// テスト用HSP値
const PTFE: HSPValues = { deltaD: 16.2, deltaP: 1.8, deltaH: 0.0 };
const PE: HSPValues = { deltaD: 18.0, deltaP: 0.0, deltaH: 0.0 };
const PS: HSPValues = { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 };
const PMMA: HSPValues = { deltaD: 17.5, deltaP: 5.5, deltaH: 5.2 };
const WATER: HSPValues = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };
const TOLUENE: HSPValues = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };

describe('splitHSPToSurfaceComponents', () => {
  it('分散成分が非負', () => {
    const { dispersive, polar } = splitHSPToSurfaceComponents(PS);
    expect(dispersive).toBeGreaterThanOrEqual(0);
    expect(polar).toBeGreaterThanOrEqual(0);
  });

  it('水のpolar成分が大きい', () => {
    const { dispersive, polar } = splitHSPToSurfaceComponents(WATER);
    expect(polar).toBeGreaterThan(dispersive);
  });

  it('トルエンのdispersive成分が支配的', () => {
    const { dispersive, polar } = splitHSPToSurfaceComponents(TOLUENE);
    expect(dispersive).toBeGreaterThan(polar);
  });
});

describe('owensWendtContactAngle', () => {
  it('PTFEと水で接触角 > 90°（疎水性）', () => {
    const theta = owensWendtContactAngle(PTFE, WATER);
    expect(theta).toBeGreaterThan(90);
  });

  it('PMMAと水で接触角が妥当な範囲（HSP法の限界: 表面再配向を反映不可）', () => {
    const theta = owensWendtContactAngle(PMMA, WATER);
    // 文献値68°だが、バルクHSPでは表面再配向を反映できないため90°付近
    // Nakamoto-Yamamoto法(84.6°)と同程度の精度
    expect(theta).toBeGreaterThan(60);
    expect(theta).toBeLessThan(100);
  });

  it('疎水性序列: PTFE > PE > PS > PMMA', () => {
    const thetaPTFE = owensWendtContactAngle(PTFE, WATER);
    const thetaPE = owensWendtContactAngle(PE, WATER);
    const thetaPS = owensWendtContactAngle(PS, WATER);
    const thetaPMMA = owensWendtContactAngle(PMMA, WATER);

    expect(thetaPTFE).toBeGreaterThan(thetaPE);
    expect(thetaPE).toBeGreaterThan(thetaPS);
    expect(thetaPS).toBeGreaterThan(thetaPMMA);
  });

  it('同一材料で接触角 = 0°', () => {
    const theta = owensWendtContactAngle(PS, PS);
    expect(theta).toBeCloseTo(0, 0);
  });

  it('低表面張力液体で接触角が小さい', () => {
    const thetaWater = owensWendtContactAngle(PS, WATER);
    const thetaToluene = owensWendtContactAngle(PS, TOLUENE);
    expect(thetaToluene).toBeLessThan(thetaWater);
  });
});

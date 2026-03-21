/**
 * 多成分溶媒最適化ビューのテスト
 * - PS-like targetにtoluene主成分の結果が出ることを確認
 */
import { describe, it, expect } from 'vitest';
import {
  optimizeMultiComponentBlend,
} from '../../src/core/multicomponent-optimizer';

describe('multicomponent optimization view integration', () => {
  const PS_TARGET = { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 };

  const SOLVENTS = [
    { id: 1, name: 'Toluene', hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 }, molarVolume: 106.8 },
    { id: 2, name: 'Acetone', hsp: { deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 }, molarVolume: 74.0 },
    { id: 3, name: 'Ethanol', hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 }, molarVolume: 58.5 },
    { id: 4, name: 'n-Hexane', hsp: { deltaD: 14.9, deltaP: 0.0, deltaH: 0.0 }, molarVolume: 131.6 },
    { id: 5, name: 'MEK', hsp: { deltaD: 16.0, deltaP: 9.0, deltaH: 5.1 }, molarVolume: 90.1 },
    { id: 6, name: 'Ethyl Acetate', hsp: { deltaD: 15.8, deltaP: 5.3, deltaH: 7.2 }, molarVolume: 98.5 },
  ];

  it('PS targetに対してtolueneが主成分として選ばれる', () => {
    const result = optimizeMultiComponentBlend({
      targetHSP: PS_TARGET,
      candidates: SOLVENTS,
      numComponents: 4,
      maxIterations: 200,
      populationSize: 50,
    });

    const toluene = result.components.find((c) => c.name === 'Toluene');
    expect(toluene).toBeDefined();
    // Tolueneが最大分率
    const maxFrac = Math.max(...result.components.map((c) => c.fraction));
    expect(toluene!.fraction).toBeCloseTo(maxFrac, 1);
  });

  it('6成分で最適化しても有効', () => {
    const result = optimizeMultiComponentBlend({
      targetHSP: PS_TARGET,
      candidates: SOLVENTS,
      numComponents: 6,
      maxIterations: 200,
      populationSize: 50,
    });

    expect(result.ra).toBeLessThan(5);
    expect(result.components.length).toBeGreaterThan(0);
    const totalFraction = result.components.reduce((sum, c) => sum + c.fraction, 0);
    expect(totalFraction).toBeCloseTo(1.0, 5);
  });
});

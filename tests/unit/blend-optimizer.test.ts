import { describe, it, expect } from 'vitest';
import { optimizeBlend, blendHSP } from '../../src/core/blend-optimizer';
import type { Solvent, HSPValues, BlendOptimizationInput } from '../../src/core/types';

function makeSolvent(id: number, name: string, deltaD: number, deltaP: number, deltaH: number): Solvent {
  return {
    id, name, nameEn: null, casNumber: null,
    hsp: { deltaD, deltaP, deltaH },
    molarVolume: null, molWeight: null, boilingPoint: null,
    viscosity: null, specificGravity: null, surfaceTension: null, notes: null,
  };
}

describe('blendHSP', () => {
  it('単一溶媒の場合、そのHSPを返す', () => {
    const solvents: Solvent[] = [makeSolvent(1, 'A', 15.0, 5.0, 7.0)];
    const fractions = [1.0];
    const result = blendHSP(solvents, fractions);
    expect(result.deltaD).toBeCloseTo(15.0);
    expect(result.deltaP).toBeCloseTo(5.0);
    expect(result.deltaH).toBeCloseTo(7.0);
  });

  it('2溶媒の50:50混合', () => {
    const solvents = [
      makeSolvent(1, 'A', 16.0, 4.0, 6.0),
      makeSolvent(2, 'B', 14.0, 8.0, 10.0),
    ];
    const fractions = [0.5, 0.5];
    const result = blendHSP(solvents, fractions);
    expect(result.deltaD).toBeCloseTo(15.0);
    expect(result.deltaP).toBeCloseTo(6.0);
    expect(result.deltaH).toBeCloseTo(8.0);
  });

  it('3溶媒の体積分率加重平均', () => {
    const solvents = [
      makeSolvent(1, 'A', 15.0, 3.0, 6.0),
      makeSolvent(2, 'B', 18.0, 6.0, 9.0),
      makeSolvent(3, 'C', 12.0, 9.0, 12.0),
    ];
    const fractions = [0.5, 0.3, 0.2];
    const result = blendHSP(solvents, fractions);
    expect(result.deltaD).toBeCloseTo(15.3);
  });
});

describe('optimizeBlend', () => {
  const solventA = makeSolvent(1, 'Toluene', 18.0, 1.4, 2.0);
  const solventB = makeSolvent(2, 'Ethanol', 15.8, 8.8, 19.4);
  const solventC = makeSolvent(3, 'Acetone', 15.5, 10.4, 7.0);

  it('2成分探索で結果がRa昇順', () => {
    const input: BlendOptimizationInput = {
      targetHSP: { deltaD: 17.0, deltaP: 5.0, deltaH: 10.0 },
      candidateSolvents: [solventA, solventB, solventC],
      maxComponents: 2, stepSize: 0.1, topN: 5,
    };
    const result = optimizeBlend(input);
    expect(result.topResults.length).toBeGreaterThan(0);
    expect(result.topResults.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < result.topResults.length; i++) {
      expect(result.topResults[i].ra).toBeGreaterThanOrEqual(result.topResults[i - 1].ra);
    }
  });

  it('3成分探索で結果が返る', () => {
    const input: BlendOptimizationInput = {
      targetHSP: { deltaD: 16.0, deltaP: 6.0, deltaH: 8.0 },
      candidateSolvents: [solventA, solventB, solventC],
      maxComponents: 3, stepSize: 0.2, topN: 3,
    };
    const result = optimizeBlend(input);
    expect(result.topResults.length).toBeGreaterThan(0);
    expect(result.topResults.length).toBeLessThanOrEqual(3);
  });

  it('各結果のcomponentsの体積分率合計が1.0', () => {
    const input: BlendOptimizationInput = {
      targetHSP: { deltaD: 17.0, deltaP: 5.0, deltaH: 10.0 },
      candidateSolvents: [solventA, solventB, solventC],
      maxComponents: 2, stepSize: 0.1, topN: 10,
    };
    const result = optimizeBlend(input);
    for (const r of result.topResults) {
      const total = r.components.reduce((sum, c) => sum + c.volumeFraction, 0);
      expect(total).toBeCloseTo(1.0);
    }
  });

  it('topNで結果数が制限される', () => {
    const input: BlendOptimizationInput = {
      targetHSP: { deltaD: 17.0, deltaP: 5.0, deltaH: 10.0 },
      candidateSolvents: [solventA, solventB, solventC],
      maxComponents: 2, stepSize: 0.1, topN: 2,
    };
    const result = optimizeBlend(input);
    expect(result.topResults.length).toBeLessThanOrEqual(2);
  });

  it('候補溶媒が2つで2成分探索が動作する', () => {
    const input: BlendOptimizationInput = {
      targetHSP: { deltaD: 17.0, deltaP: 5.0, deltaH: 10.0 },
      candidateSolvents: [solventA, solventB],
      maxComponents: 2, stepSize: 0.1, topN: 5,
    };
    const result = optimizeBlend(input);
    expect(result.topResults.length).toBeGreaterThan(0);
  });

  it('evaluatedAtが設定される', () => {
    const before = new Date();
    const input: BlendOptimizationInput = {
      targetHSP: { deltaD: 17.0, deltaP: 5.0, deltaH: 10.0 },
      candidateSolvents: [solventA, solventB],
      maxComponents: 2, stepSize: 0.5, topN: 1,
    };
    const result = optimizeBlend(input);
    expect(result.evaluatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});

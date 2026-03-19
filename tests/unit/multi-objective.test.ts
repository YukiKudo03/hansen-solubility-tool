import { describe, it, expect } from 'vitest';
import { screenMultiObjective, DEFAULT_OBJECTIVE_WEIGHTS } from '../../src/core/multi-objective';
import type { Solvent } from '../../src/core/types';

function makeSolvent(overrides: Partial<Solvent> & { id: number; name: string }): Solvent {
  return {
    nameEn: null,
    casNumber: null,
    hsp: { deltaD: 18, deltaP: 1.4, deltaH: 2 },
    molarVolume: null,
    molWeight: null,
    boilingPoint: null,
    viscosity: null,
    specificGravity: null,
    surfaceTension: null,
    notes: null,
    ...overrides,
  };
}

describe('screenMultiObjective', () => {
  const solvents = [
    makeSolvent({ id: 1, name: 'Close', hsp: { deltaD: 18, deltaP: 1.4, deltaH: 2 } }),
    makeSolvent({ id: 2, name: 'Far', hsp: { deltaD: 15, deltaP: 10, deltaH: 20 } }),
  ];
  const targets = { targetHSP: { deltaD: 18, deltaP: 1.4, deltaH: 2 }, r0: 8 };

  it('結果構造が { results, weights, evaluatedAt }', () => {
    const result = screenMultiObjective(targets, solvents);
    expect(result).toHaveProperty('results');
    expect(result).toHaveProperty('weights');
    expect(result).toHaveProperty('evaluatedAt');
    expect(result.evaluatedAt).toBeInstanceOf(Date);
  });

  it('各結果に scores.hspMatch, scores.overall, solvent, red, ra がある', () => {
    const result = screenMultiObjective(targets, solvents);
    for (const r of result.results) {
      expect(r).toHaveProperty('solvent');
      expect(r).toHaveProperty('red');
      expect(r).toHaveProperty('ra');
      expect(r.scores).toHaveProperty('hspMatch');
      expect(r.scores).toHaveProperty('overall');
      expect(r.scores).toHaveProperty('boilingPoint');
      expect(r.scores).toHaveProperty('viscosity');
      expect(r.scores).toHaveProperty('surfaceTension');
      expect(r.scores).toHaveProperty('safety');
    }
  });

  it('デフォルト重みが適用される', () => {
    const result = screenMultiObjective(targets, solvents);
    expect(result.weights).toEqual(DEFAULT_OBJECTIVE_WEIGHTS);
  });

  it('カスタム重みが適用される', () => {
    const customWeights = { hspMatch: 1, boilingPoint: 0, viscosity: 0, surfaceTension: 0, safety: 0, cost: 0 };
    const result = screenMultiObjective(targets, solvents, customWeights);
    expect(result.weights).toEqual(customWeights);
  });

  it('overall 降順でソートされている', () => {
    const result = screenMultiObjective(targets, solvents);
    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i].scores.overall).toBeLessThanOrEqual(result.results[i - 1].scores.overall);
    }
  });

  it('HSPが一致する溶媒は hspMatch が高い', () => {
    const result = screenMultiObjective(targets, solvents);
    const close = result.results.find((r) => r.solvent.name === 'Close');
    const far = result.results.find((r) => r.solvent.name === 'Far');
    expect(close!.scores.hspMatch).toBeGreaterThan(far!.scores.hspMatch);
  });

  it.todo('cost 目的関数の実装（現在は0.5固定）');
});

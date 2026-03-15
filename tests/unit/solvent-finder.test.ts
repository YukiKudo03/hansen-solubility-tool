import { describe, it, expect } from 'vitest';
import { screenSolvents, filterByConstraints } from '../../src/core/solvent-finder';
import type { NanoParticle, Solvent } from '../../src/core/types';
import { DispersibilityLevel } from '../../src/core/types';

const makeParticle = (overrides: Partial<NanoParticle> = {}): NanoParticle => ({
  id: 1,
  name: 'Test NP',
  nameEn: null,
  category: 'metal',
  coreMaterial: 'Ag',
  surfaceLigand: null,
  hsp: { deltaD: 16.5, deltaP: 2.7, deltaH: 0.01 },
  r0: 4.8,
  particleSize: null,
  notes: null,
  ...overrides,
});

const makeSolvent = (id: number, name: string, deltaD: number, deltaP: number, deltaH: number, extras: Partial<Solvent> = {}): Solvent => ({
  id,
  name,
  nameEn: null,
  casNumber: null,
  hsp: { deltaD, deltaP, deltaH },
  molarVolume: null,
  molWeight: null,
  boilingPoint: null,
  viscosity: null,
  specificGravity: null,
  surfaceTension: null,
  notes: null,
  ...extras,
});

describe('screenSolvents', () => {
  it('REDの昇順でソートされる', () => {
    const particle = makeParticle();
    const solvents = [
      makeSolvent(1, '遠い溶媒', 14.0, 10.0, 10.0),
      makeSolvent(2, '近い溶媒', 16.5, 2.5, 0.0),
      makeSolvent(3, '中間溶媒', 15.5, 5.0, 3.0),
    ];

    const results = screenSolvents(particle, solvents);
    expect(results).toHaveLength(3);
    expect(results[0].solvent.name).toBe('近い溶媒');
    expect(results[0].red).toBeLessThan(results[1].red);
    expect(results[1].red).toBeLessThan(results[2].red);
  });

  it('空の溶媒リストでも動作', () => {
    const results = screenSolvents(makeParticle(), []);
    expect(results).toHaveLength(0);
  });

  it('RED < 1.0 の溶媒は Fair 以上', () => {
    const particle = makeParticle();
    const nearSolvent = makeSolvent(1, 'Near', 16.5, 2.7, 0.01);
    const results = screenSolvents(particle, [nearSolvent]);
    expect(results[0].red).toBeCloseTo(0, 1);
    expect(results[0].dispersibility).toBe(DispersibilityLevel.Excellent);
  });

  it('Ra/RED値が正しく計算される', () => {
    const particle = makeParticle({ hsp: { deltaD: 18.0, deltaP: 9.3, deltaH: 7.7 }, r0: 5.5 });
    const nmp = makeSolvent(1, 'NMP', 18.0, 12.3, 7.2);
    const results = screenSolvents(particle, [nmp]);
    // Ra = sqrt(4*(0)^2 + (3)^2 + (0.5)^2) = sqrt(9.25) ≈ 3.041
    expect(results[0].ra).toBeCloseTo(3.041, 2);
    // RED = 3.041 / 5.5 ≈ 0.553
    expect(results[0].red).toBeCloseTo(0.553, 2);
  });
});

describe('filterByConstraints', () => {
  const particle = makeParticle();

  const makeResult = (solvent: Solvent) => ({
    nanoParticle: particle,
    solvent,
    ra: 1.0,
    red: 0.5,
    dispersibility: DispersibilityLevel.Excellent as const,
  });

  it('沸点上限フィルタ', () => {
    const results = [
      makeResult(makeSolvent(1, 'Low BP', 16, 2, 0, { boilingPoint: 80 })),
      makeResult(makeSolvent(2, 'High BP', 16, 2, 0, { boilingPoint: 250 })),
    ];
    const filtered = filterByConstraints(results, { maxBoilingPoint: 200 });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].solvent.name).toBe('Low BP');
  });

  it('沸点下限フィルタ', () => {
    const results = [
      makeResult(makeSolvent(1, 'Low BP', 16, 2, 0, { boilingPoint: 40 })),
      makeResult(makeSolvent(2, 'High BP', 16, 2, 0, { boilingPoint: 150 })),
    ];
    const filtered = filterByConstraints(results, { minBoilingPoint: 60 });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].solvent.name).toBe('High BP');
  });

  it('粘度フィルタ', () => {
    const results = [
      makeResult(makeSolvent(1, 'Low Visc', 16, 2, 0, { viscosity: 0.5 })),
      makeResult(makeSolvent(2, 'High Visc', 16, 2, 0, { viscosity: 5.0 })),
    ];
    const filtered = filterByConstraints(results, { maxViscosity: 2.0 });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].solvent.name).toBe('Low Visc');
  });

  it('表面張力フィルタ', () => {
    const results = [
      makeResult(makeSolvent(1, 'Low ST', 16, 2, 0, { surfaceTension: 20 })),
      makeResult(makeSolvent(2, 'High ST', 16, 2, 0, { surfaceTension: 45 })),
    ];
    const filtered = filterByConstraints(results, { maxSurfaceTension: 30 });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].solvent.name).toBe('Low ST');
  });

  it('null物性値は制約適用時にフィルタ除外', () => {
    const results = [
      makeResult(makeSolvent(1, 'No Data', 16, 2, 0)),
    ];
    const filtered = filterByConstraints(results, { maxBoilingPoint: 100, maxViscosity: 1 });
    expect(filtered).toHaveLength(0);
  });

  it('null物性値は制約なしならフィルタ通過', () => {
    const results = [
      makeResult(makeSolvent(1, 'No Data', 16, 2, 0)),
    ];
    const filtered = filterByConstraints(results, {});
    expect(filtered).toHaveLength(1);
  });

  it('制約なしは全件返却', () => {
    const results = [
      makeResult(makeSolvent(1, 'A', 16, 2, 0, { boilingPoint: 300 })),
      makeResult(makeSolvent(2, 'B', 16, 2, 0, { boilingPoint: 50 })),
    ];
    const filtered = filterByConstraints(results, {});
    expect(filtered).toHaveLength(2);
  });

  it('複数制約の組み合わせ', () => {
    const results = [
      makeResult(makeSolvent(1, 'Perfect', 16, 2, 0, { boilingPoint: 100, viscosity: 0.5, surfaceTension: 25 })),
      makeResult(makeSolvent(2, 'Too viscous', 16, 2, 0, { boilingPoint: 100, viscosity: 5.0, surfaceTension: 25 })),
      makeResult(makeSolvent(3, 'Too hot', 16, 2, 0, { boilingPoint: 300, viscosity: 0.5, surfaceTension: 25 })),
    ];
    const filtered = filterByConstraints(results, { maxBoilingPoint: 200, maxViscosity: 2.0 });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].solvent.name).toBe('Perfect');
  });
});

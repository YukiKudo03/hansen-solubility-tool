import { describe, it, expect } from 'vitest';
import { findGreenAlternatives, GREEN_SOLVENT_DATABASE } from '../../src/core/green-solvent';
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

describe('findGreenAlternatives', () => {
  const target = makeSolvent({ id: 1, name: 'Target', hsp: { deltaD: 18, deltaP: 1.4, deltaH: 2 } });
  const candidates = [
    target,
    makeSolvent({ id: 2, name: 'Close', hsp: { deltaD: 18.5, deltaP: 1.0, deltaH: 2.5 } }),
    makeSolvent({ id: 3, name: 'Far', hsp: { deltaD: 15, deltaP: 10, deltaH: 20 } }),
    makeSolvent({ id: 4, name: 'Ethanol', casNumber: '64-17-5', hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 } }),
  ];

  it('SubstitutionResult の構造が正しい', () => {
    const result = findGreenAlternatives(target, candidates);
    expect(result).toHaveProperty('targetSolvent');
    expect(result).toHaveProperty('candidates');
    expect(result).toHaveProperty('evaluatedAt');
    expect(result.targetSolvent.id).toBe(1);
    expect(result.evaluatedAt).toBeInstanceOf(Date);
  });

  it('ターゲット自身は候補から除外される', () => {
    const result = findGreenAlternatives(target, candidates);
    expect(result.candidates.every((c) => c.solvent.id !== target.id)).toBe(true);
  });

  it('maxResults で結果が切り詰められる', () => {
    const result = findGreenAlternatives(target, candidates, 1);
    expect(result.candidates.length).toBe(1);
  });

  it('overallScore 昇順でソートされている', () => {
    const result = findGreenAlternatives(target, candidates);
    for (let i = 1; i < result.candidates.length; i++) {
      expect(result.candidates[i].overallScore).toBeGreaterThanOrEqual(result.candidates[i - 1].overallScore);
    }
  });

  it('既知のCAS番号の溶媒には safetyInfo がある', () => {
    const result = findGreenAlternatives(target, candidates);
    const ethanol = result.candidates.find((c) => c.solvent.name === 'Ethanol');
    expect(ethanol).toBeDefined();
    expect(ethanol!.safetyInfo).not.toBeNull();
    expect(ethanol!.safetyInfo!.safetyRating).toBe('recommended');
  });

  it('CAS番号がない溶媒は safetyInfo が null', () => {
    const result = findGreenAlternatives(target, candidates);
    const close = result.candidates.find((c) => c.solvent.name === 'Close');
    expect(close).toBeDefined();
    expect(close!.safetyInfo).toBeNull();
  });

  it('各候補に ra と overallScore がある', () => {
    const result = findGreenAlternatives(target, candidates);
    for (const c of result.candidates) {
      expect(typeof c.ra).toBe('number');
      expect(typeof c.overallScore).toBe('number');
      expect(c.ra).toBeGreaterThanOrEqual(0);
    }
  });

  it.todo('GREEN_SOLVENT_DATABASE のDB化・ユーザー拡張対応');
});

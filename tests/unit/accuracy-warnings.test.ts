import { describe, it, expect } from 'vitest';
import {
  getContactAngleWarnings,
  getDispersionWarnings,
  getRedBoundaryWarnings,
} from '../../src/core/accuracy-warnings';
import type {
  ContactAngleResult,
  Part,
  Solvent,
  SolventDispersibilityResult,
  NanoParticle,
} from '../../src/core/types';

// ─── ヘルパー ────────────────────────────────

function makePart(overrides: Partial<Part> = {}): Part {
  return {
    id: 1,
    groupId: 1,
    name: 'TestPart',
    materialType: null,
    hsp: { deltaD: 17.0, deltaP: 5.0, deltaH: 4.0 },
    r0: 5.0,
    notes: null,
    ...overrides,
  };
}

function makeSolvent(overrides: Partial<Solvent> = {}): Solvent {
  return {
    id: 1,
    name: 'TestSolvent',
    nameEn: null,
    casNumber: null,
    hsp: { deltaD: 15.0, deltaP: 5.0, deltaH: 5.0 },
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

function makeContactAngleResult(
  part: Partial<Part> = {},
  solvent: Partial<Solvent> = {}
): ContactAngleResult {
  return {
    part: makePart(part),
    solvent: makeSolvent(solvent),
    surfaceTensionLV: 30.0,
    surfaceEnergySV: 40.0,
    interfacialTension: 5.0,
    cosTheta: 0.5,
    contactAngle: 60.0,
    wettability: 3,
  };
}

function makeNanoParticle(overrides: Partial<NanoParticle> = {}): NanoParticle {
  return {
    id: 1,
    name: 'TestParticle',
    nameEn: null,
    category: 'carbon',
    coreMaterial: 'Graphene',
    surfaceLigand: null,
    hsp: { deltaD: 18.0, deltaP: 9.8, deltaH: 7.7 },
    r0: 3.5,
    particleSize: null,
    notes: null,
    ...overrides,
  };
}

function makeDispersionResult(
  red: number,
  solventName: string = 'TestSolvent'
): SolventDispersibilityResult {
  return {
    nanoParticle: makeNanoParticle(),
    solvent: makeSolvent({ name: solventName }),
    ra: red * 3.5,
    red,
    dispersibility: red < 1.0 ? 1 : 4,
  };
}

// ─── getContactAngleWarnings ────────────────

describe('getContactAngleWarnings', () => {
  it('空の結果では警告なし', () => {
    expect(getContactAngleWarnings([])).toEqual([]);
  });

  it('通常の溶媒・ポリマーでは警告なし', () => {
    const results = [
      makeContactAngleResult(
        { hsp: { deltaD: 17.0, deltaP: 5.0, deltaH: 4.0 } },
        { hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 4.1 } }
      ),
    ];
    expect(getContactAngleWarnings(results)).toEqual([]);
  });

  it('アルコール溶媒（δH>14, δP>5）で警告が出る', () => {
    const results = [
      makeContactAngleResult(
        {},
        {
          name: 'Ethanol',
          hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 },
        }
      ),
    ];
    const warnings = getContactAngleWarnings(results);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('アルコール類');
    expect(warnings[0]).toContain('+13 mN/m');
  });

  it('多価アルコール溶媒（δH>20, δP>10）で警告が出る', () => {
    const results = [
      makeContactAngleResult(
        {},
        {
          name: 'Glycerol',
          hsp: { deltaD: 17.4, deltaP: 12.1, deltaH: 29.3 },
        }
      ),
    ];
    const warnings = getContactAngleWarnings(results);
    // 多価アルコールはアルコール条件も満たすため2件
    expect(warnings.length).toBeGreaterThanOrEqual(1);
    expect(warnings.some((w) => w.includes('多価アルコール'))).toBe(true);
  });

  it('親水性ポリマー（δP>8, δH>6）+ 水で警告が出る', () => {
    const results = [
      makeContactAngleResult(
        {
          name: 'PMMA',
          hsp: { deltaD: 18.6, deltaP: 10.5, deltaH: 7.5 },
        },
        {
          name: 'Water',
          hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 },
        }
      ),
    ];
    const warnings = getContactAngleWarnings(results);
    expect(warnings.some((w) => w.includes('親水性ポリマー'))).toBe(true);
  });

  it('親水性ポリマーでも水以外の溶媒では親水性ポリマー警告が出ない', () => {
    const results = [
      makeContactAngleResult(
        {
          name: 'PMMA',
          hsp: { deltaD: 18.6, deltaP: 10.5, deltaH: 7.5 },
        },
        {
          name: 'Toluene',
          hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
        }
      ),
    ];
    const warnings = getContactAngleWarnings(results);
    expect(warnings.some((w) => w.includes('親水性ポリマー'))).toBe(false);
  });

  it('複数の警告条件が同時に出る', () => {
    const results = [
      makeContactAngleResult(
        { name: 'PMMA', hsp: { deltaD: 18.6, deltaP: 10.5, deltaH: 7.5 } },
        { name: 'Water', hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 } }
      ),
      makeContactAngleResult(
        {},
        { name: 'Ethanol', hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 } }
      ),
    ];
    const warnings = getContactAngleWarnings(results);
    expect(warnings.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── getRedBoundaryWarnings ────────────────

describe('getRedBoundaryWarnings', () => {
  it('空の結果では警告なし', () => {
    expect(getRedBoundaryWarnings([])).toEqual([]);
  });

  it('RED値が境界外（全て0.5未満）では警告なし', () => {
    const results = [
      { red: 0.3, name: 'DMF' },
      { red: 0.5, name: 'NMP' },
      { red: 0.79, name: 'THF' },
    ];
    expect(getRedBoundaryWarnings(results)).toEqual([]);
  });

  it('RED値が境界外（全て1.3以上）では警告なし', () => {
    const results = [
      { red: 1.3, name: 'Water' },
      { red: 2.0, name: 'Hexane' },
    ];
    expect(getRedBoundaryWarnings(results)).toEqual([]);
  });

  it('RED=0.8 の結果で警告が出る（下限境界）', () => {
    const results = [{ red: 0.8, name: 'Solvent1' }];
    const warnings = getRedBoundaryWarnings(results);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('0.8〜1.2');
    expect(warnings[0]).toContain('R₀');
  });

  it('RED=1.2 の結果で警告が出る（上限境界）', () => {
    const results = [{ red: 1.2, name: 'Solvent2' }];
    expect(getRedBoundaryWarnings(results)).toHaveLength(1);
  });

  it('RED=1.056 (Graphene vs DMF的なケース) で警告が出る', () => {
    const results = [
      { red: 0.3, name: 'NMP' },
      { red: 1.056, name: 'DMF' },
      { red: 2.5, name: 'Water' },
    ];
    const warnings = getRedBoundaryWarnings(results);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('Hansen球の境界付近');
  });
});

// ─── getDispersionWarnings ────────────────

describe('getDispersionWarnings', () => {
  it('空の結果では警告なし', () => {
    expect(getDispersionWarnings([])).toEqual([]);
  });

  it('RED境界付近の分散結果で警告が出る', () => {
    const results = [
      makeDispersionResult(0.5, 'NMP'),
      makeDispersionResult(1.05, 'DMF'),
    ];
    const warnings = getDispersionWarnings(results);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('R₀');
  });

  it('全てRED < 0.8 では警告なし', () => {
    const results = [
      makeDispersionResult(0.3, 'NMP'),
      makeDispersionResult(0.5, 'DMF'),
      makeDispersionResult(0.79, 'Cyclohexanone'),
    ];
    expect(getDispersionWarnings(results)).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import { getNanoParticleModificationWarnings } from '../../src/core/accuracy-warnings';
import type { NanoParticle } from '../../src/core/types';

const makeNP = (overrides: Partial<NanoParticle> = {}): NanoParticle => ({
  id: 1, name: 'Test NP', nameEn: null, category: 'metal',
  coreMaterial: 'Ag', surfaceLigand: null,
  hsp: { deltaD: 17, deltaP: 5, deltaH: 10 }, r0: 3.5,
  particleSize: 10, notes: null,
  ...overrides,
});

describe('getNanoParticleModificationWarnings', () => {
  it('surfaceLigand なしでは警告なし', () => {
    const np = makeNP({ surfaceLigand: null });
    const warnings = getNanoParticleModificationWarnings(np);
    expect(warnings).toHaveLength(0);
  });

  it('surfaceLigand ありで表面修飾の注意警告を返す', () => {
    const np = makeNP({ surfaceLigand: 'oleylamine' });
    const warnings = getNanoParticleModificationWarnings(np);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain('表面修飾');
  });

  it('警告にR₀のばらつきへの言及がある', () => {
    const np = makeNP({ surfaceLigand: 'PEG' });
    const warnings = getNanoParticleModificationWarnings(np);
    expect(warnings.some(w => w.includes('R₀') || w.includes('相互作用半径'))).toBe(true);
  });

  it('粒子径が非常に小さい(<5nm)場合に量子効果の注意を返す', () => {
    const np = makeNP({ particleSize: 3, surfaceLigand: null });
    const warnings = getNanoParticleModificationWarnings(np);
    expect(warnings.some(w => w.includes('量子') || w.includes('nm'))).toBe(true);
  });

  it('粒子径が通常(>5nm)かつ修飾なしで警告なし', () => {
    const np = makeNP({ particleSize: 50, surfaceLigand: null });
    const warnings = getNanoParticleModificationWarnings(np);
    expect(warnings).toHaveLength(0);
  });
});

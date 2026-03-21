import { describe, it, expect } from 'vitest';
import { screenCompatibilizers } from '../../src/core/compatibilizer-selection';

describe('screenCompatibilizers', () => {
  // PE/PSブレンドの相溶化剤スクリーニング
  const PE_polymer = {
    hsp: { deltaD: 17.1, deltaP: 0.0, deltaH: 2.0 },
    r0: 6.0,
  };
  const PS_polymer = {
    hsp: { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 },
    r0: 5.0,
  };

  // PE-b-PS: blockAがPE-like、blockBがPS-like → 高効果
  const PE_b_PS = {
    name: 'PE-b-PS',
    blockA_hsp: { deltaD: 17.0, deltaP: 0.0, deltaH: 2.0 },  // PE-like
    blockB_hsp: { deltaD: 18.6, deltaP: 4.5, deltaH: 3.0 },  // PS-like
  };

  // PP-b-PMMA: HSPがPE/PSどちらとも合わない → 低効果
  const PP_b_PMMA = {
    name: 'PP-b-PMMA',
    blockA_hsp: { deltaD: 16.4, deltaP: 0.0, deltaH: 1.0 },  // PP-like
    blockB_hsp: { deltaD: 18.6, deltaP: 10.5, deltaH: 5.1 }, // PMMA-like
  };

  it('PE-b-PS should rank higher (lower effectivenessScore) than PP-b-PMMA for PE/PS blend', () => {
    const results = screenCompatibilizers(PE_polymer, PS_polymer, [PE_b_PS, PP_b_PMMA]);

    expect(results).toHaveLength(2);
    // Results sorted by effectivenessScore ascending
    expect(results[0].compatibilizer.name).toBe('PE-b-PS');
    expect(results[1].compatibilizer.name).toBe('PP-b-PMMA');
    expect(results[0].effectivenessScore).toBeLessThan(results[1].effectivenessScore);
  });

  it('PE-b-PS should have low RED values for PE/PS blend', () => {
    const results = screenCompatibilizers(PE_polymer, PS_polymer, [PE_b_PS]);

    const r = results[0];
    // BlockA (PE-like) should be close to PE polymer → low RED
    expect(r.redBlockA).toBeLessThan(1.0);
    // BlockB (PS-like) should be close to PS polymer → low RED
    expect(r.redBlockB).toBeLessThan(1.0);
  });

  it('should calculate effectivenessScore as geometric mean of REDs', () => {
    const results = screenCompatibilizers(PE_polymer, PS_polymer, [PE_b_PS]);

    const r = results[0];
    const expected = Math.sqrt(r.redBlockA * r.redBlockB);
    expect(r.effectivenessScore).toBeCloseTo(expected, 10);
  });

  it('should return results sorted by effectivenessScore ascending', () => {
    const candidates = [PP_b_PMMA, PE_b_PS]; // Intentionally reversed
    const results = screenCompatibilizers(PE_polymer, PS_polymer, candidates);

    for (let i = 1; i < results.length; i++) {
      expect(results[i].effectivenessScore).toBeGreaterThanOrEqual(
        results[i - 1].effectivenessScore
      );
    }
  });

  it('should return correct structure', () => {
    const results = screenCompatibilizers(PE_polymer, PS_polymer, [PE_b_PS]);

    const r = results[0];
    expect(r).toHaveProperty('compatibilizer');
    expect(r).toHaveProperty('raBlockA_Polymer1');
    expect(r).toHaveProperty('raBlockB_Polymer2');
    expect(r).toHaveProperty('redBlockA');
    expect(r).toHaveProperty('redBlockB');
    expect(r).toHaveProperty('effectivenessScore');
    expect(typeof r.raBlockA_Polymer1).toBe('number');
    expect(typeof r.effectivenessScore).toBe('number');
  });

  it('should handle empty candidates list', () => {
    const results = screenCompatibilizers(PE_polymer, PS_polymer, []);
    expect(results).toHaveLength(0);
  });

  it('should throw error for non-positive R0', () => {
    const bad = { hsp: { deltaD: 17.0, deltaP: 0.0, deltaH: 2.0 }, r0: 0 };
    expect(() => screenCompatibilizers(bad, PS_polymer, [PE_b_PS])).toThrow(
      'Interaction radius R₀ must be positive'
    );
  });

  it('Ra values should be positive for different HSP values', () => {
    const results = screenCompatibilizers(PE_polymer, PS_polymer, [PE_b_PS, PP_b_PMMA]);

    for (const r of results) {
      expect(r.raBlockA_Polymer1).toBeGreaterThanOrEqual(0);
      expect(r.raBlockB_Polymer2).toBeGreaterThanOrEqual(0);
    }
  });
});

import { describe, it, expect } from 'vitest';
import { estimateCopolymerHSP } from '../../src/core/copolymer-hsp-estimation';

describe('estimateCopolymerHSP', () => {
  // スチレン/アクリロニトリル = SAN
  const styrene = { name: 'Styrene', hsp: { deltaD: 18.6, deltaP: 1.0, deltaH: 4.1 }, fraction: 0.5 };
  const acrylonitrile = { name: 'Acrylonitrile', hsp: { deltaD: 17.8, deltaP: 15.5, deltaH: 3.9 }, fraction: 0.5 };

  it('should estimate SAN copolymer HSP from styrene/acrylonitrile 50:50', () => {
    const result = estimateCopolymerHSP([styrene, acrylonitrile]);

    // 体積分率加重平均: dD = 0.5*18.6 + 0.5*17.8 = 18.2
    expect(result.blendHSP.deltaD).toBeCloseTo(18.2, 1);
    // dP = 0.5*1.0 + 0.5*15.5 = 8.25
    expect(result.blendHSP.deltaP).toBeCloseTo(8.25, 1);
    // dH = 0.5*4.1 + 0.5*3.9 = 4.0
    expect(result.blendHSP.deltaH).toBeCloseTo(4.0, 1);

    // 文献近似値: dD≈18.2, dP≈8.3, dH≈4.0
    expect(result.blendHSP.deltaD).toBeCloseTo(18.2, 0);
    expect(result.blendHSP.deltaP).toBeCloseTo(8.3, 0);
    expect(result.blendHSP.deltaH).toBeCloseTo(4.0, 0);
  });

  it('should return components information', () => {
    const result = estimateCopolymerHSP([styrene, acrylonitrile]);

    expect(result.components).toHaveLength(2);
    expect(result.components[0].name).toBe('Styrene');
    expect(result.components[0].fraction).toBe(0.5);
    expect(result.components[1].name).toBe('Acrylonitrile');
    expect(result.components[1].fraction).toBe(0.5);
  });

  it('should return the monomer HSP as-is for a single monomer', () => {
    const single = { name: 'Styrene', hsp: { deltaD: 18.6, deltaP: 1.0, deltaH: 4.1 }, fraction: 1.0 };
    const result = estimateCopolymerHSP([single]);

    expect(result.blendHSP.deltaD).toBeCloseTo(18.6, 5);
    expect(result.blendHSP.deltaP).toBeCloseTo(1.0, 5);
    expect(result.blendHSP.deltaH).toBeCloseTo(4.1, 5);
    expect(result.components).toHaveLength(1);
  });

  it('should handle three monomers (terpolymer)', () => {
    const monomers = [
      { name: 'A', hsp: { deltaD: 18.0, deltaP: 2.0, deltaH: 4.0 }, fraction: 0.5 },
      { name: 'B', hsp: { deltaD: 16.0, deltaP: 6.0, deltaH: 8.0 }, fraction: 0.3 },
      { name: 'C', hsp: { deltaD: 20.0, deltaP: 10.0, deltaH: 2.0 }, fraction: 0.2 },
    ];
    const result = estimateCopolymerHSP(monomers);

    // dD = 0.5*18 + 0.3*16 + 0.2*20 = 9 + 4.8 + 4 = 17.8
    expect(result.blendHSP.deltaD).toBeCloseTo(17.8, 5);
    // dP = 0.5*2 + 0.3*6 + 0.2*10 = 1 + 1.8 + 2 = 4.8
    expect(result.blendHSP.deltaP).toBeCloseTo(4.8, 5);
    // dH = 0.5*4 + 0.3*8 + 0.2*2 = 2 + 2.4 + 0.4 = 4.8
    expect(result.blendHSP.deltaH).toBeCloseTo(4.8, 5);
  });

  it('should throw error when fractions do not sum to 1.0', () => {
    const bad = [
      { name: 'A', hsp: { deltaD: 18.0, deltaP: 2.0, deltaH: 4.0 }, fraction: 0.3 },
      { name: 'B', hsp: { deltaD: 16.0, deltaP: 6.0, deltaH: 8.0 }, fraction: 0.3 },
    ];
    expect(() => estimateCopolymerHSP(bad)).toThrow('Sum of fractions must equal 1.0');
  });

  it('should throw error when no monomers provided', () => {
    expect(() => estimateCopolymerHSP([])).toThrow('At least one monomer is required');
  });

  it('should throw error for negative fraction', () => {
    const bad = [
      { name: 'A', hsp: { deltaD: 18.0, deltaP: 2.0, deltaH: 4.0 }, fraction: -0.2 },
      { name: 'B', hsp: { deltaD: 16.0, deltaP: 6.0, deltaH: 8.0 }, fraction: 1.2 },
    ];
    expect(() => estimateCopolymerHSP(bad)).toThrow('Fraction must be non-negative');
  });

  it('should allow small floating-point tolerance in fraction sum', () => {
    // 0.1 + 0.2 + 0.7 can have floating-point imprecision
    const monomers = [
      { name: 'A', hsp: { deltaD: 18.0, deltaP: 2.0, deltaH: 4.0 }, fraction: 0.1 },
      { name: 'B', hsp: { deltaD: 16.0, deltaP: 6.0, deltaH: 8.0 }, fraction: 0.2 },
      { name: 'C', hsp: { deltaD: 20.0, deltaP: 10.0, deltaH: 2.0 }, fraction: 0.7 },
    ];
    expect(() => estimateCopolymerHSP(monomers)).not.toThrow();
  });
});

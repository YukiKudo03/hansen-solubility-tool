import { describe, it, expect } from 'vitest';
import { evaluateRecyclingCompatibilityMatrix } from '../../src/core/polymer-recycling-compatibility';

describe('evaluateRecyclingCompatibilityMatrix', () => {
  // 5大汎用プラスチック
  const PE = { name: 'PE', hsp: { deltaD: 17.1, deltaP: 0.0, deltaH: 2.0 }, degreeOfPolymerization: 1000 };
  const PP = { name: 'PP', hsp: { deltaD: 16.4, deltaP: 0.0, deltaH: 1.0 }, degreeOfPolymerization: 800 };
  const PS = { name: 'PS', hsp: { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 }, degreeOfPolymerization: 500 };
  const PET = { name: 'PET', hsp: { deltaD: 19.5, deltaP: 3.5, deltaH: 8.6 }, degreeOfPolymerization: 200 };
  const PVC = { name: 'PVC', hsp: { deltaD: 19.2, deltaP: 7.9, deltaH: 3.4 }, degreeOfPolymerization: 400 };

  const polymers = [PE, PP, PS, PET, PVC];
  const refVolume = 100; // cm³/mol

  it('should generate N*(N-1)/2 pairs for 5 polymers = 10 pairs', () => {
    const results = evaluateRecyclingCompatibilityMatrix(polymers, refVolume);
    expect(results).toHaveLength(10); // C(5,2) = 10
  });

  it('PE/PP should have the lowest Ra (closest HSP values)', () => {
    const results = evaluateRecyclingCompatibilityMatrix(polymers, refVolume);

    const pePp = results.find(
      (r) =>
        (r.polymer1Name === 'PE' && r.polymer2Name === 'PP') ||
        (r.polymer1Name === 'PP' && r.polymer2Name === 'PE')
    );
    expect(pePp).toBeDefined();

    // PE/PP should have the smallest Ra among all pairs
    const minRa = Math.min(...results.map((r) => r.ra));
    expect(pePp!.ra).toBe(minRa);
  });

  it('PE/PP pair should have the smallest chi (most compatible)', () => {
    const results = evaluateRecyclingCompatibilityMatrix(polymers, refVolume);

    const pePp = results.find(
      (r) => r.polymer1Name === 'PE' && r.polymer2Name === 'PP'
    );
    expect(pePp).toBeDefined();

    const minChi = Math.min(...results.map((r) => r.chi));
    expect(pePp!.chi).toBe(minChi);
  });

  it('each result should have the expected structure', () => {
    const results = evaluateRecyclingCompatibilityMatrix(polymers, refVolume);

    for (const r of results) {
      expect(r).toHaveProperty('polymer1Name');
      expect(r).toHaveProperty('polymer2Name');
      expect(r).toHaveProperty('ra');
      expect(r).toHaveProperty('chi');
      expect(r).toHaveProperty('chiCritical');
      expect(r).toHaveProperty('miscibility');
      expect(['miscible', 'immiscible', 'partial']).toContain(r.miscibility);
    }
  });

  it('should contain all expected polymer pair names', () => {
    const results = evaluateRecyclingCompatibilityMatrix(polymers, refVolume);

    const pairNames = results.map((r) => `${r.polymer1Name}-${r.polymer2Name}`);
    expect(pairNames).toContain('PE-PP');
    expect(pairNames).toContain('PE-PS');
    expect(pairNames).toContain('PE-PET');
    expect(pairNames).toContain('PE-PVC');
    expect(pairNames).toContain('PP-PS');
  });

  it('should throw error for less than 2 polymers', () => {
    expect(() => evaluateRecyclingCompatibilityMatrix([PE], refVolume)).toThrow(
      'At least 2 polymers are required'
    );
  });

  it('should work with exactly 2 polymers', () => {
    const results = evaluateRecyclingCompatibilityMatrix([PE, PP], refVolume);
    expect(results).toHaveLength(1);
    expect(results[0].polymer1Name).toBe('PE');
    expect(results[0].polymer2Name).toBe('PP');
  });

  it('most pairs of commodity plastics should be immiscible', () => {
    const results = evaluateRecyclingCompatibilityMatrix(polymers, refVolume);

    // 汎用プラスチック同士は大半が非相溶
    const immiscibleCount = results.filter((r) => r.miscibility === 'immiscible').length;
    expect(immiscibleCount).toBeGreaterThanOrEqual(5); // 10ペア中半数以上
  });
});

import { describe, it, expect } from 'vitest';
import { fitHSPSphere, type SphereFitResult, type SolventClassification } from '../../src/core/sphere-fitting';

describe('fitHSPSphere', () => {
  it('空入力でゼロ結果を返す', () => {
    const result = fitHSPSphere([]);
    expect(result.center.deltaD).toBe(0);
    expect(result.center.deltaP).toBe(0);
    expect(result.center.deltaH).toBe(0);
    expect(result.r0).toBe(0);
    expect(result.correctCount).toBe(0);
    expect(result.totalCount).toBe(0);
    expect(result.misclassified).toHaveLength(0);
  });

  it('結果の型が correctCount, totalCount を持つ', () => {
    const data: SolventClassification[] = [
      { solvent: { hsp: { deltaD: 18, deltaP: 1.4, deltaH: 2 }, name: 'トルエン' }, isGood: true },
      { solvent: { hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 }, name: 'エタノール' }, isGood: false },
      { solvent: { hsp: { deltaD: 17.4, deltaP: 6.1, deltaH: 4.7 }, name: 'THF' }, isGood: true },
    ];
    const result = fitHSPSphere(data);
    expect(result).toHaveProperty('correctCount');
    expect(result).toHaveProperty('totalCount');
    expect(result).not.toHaveProperty('correct');
    expect(result).not.toHaveProperty('total');
    expect(result.totalCount).toBe(3);
  });

  it('全良溶媒でも妥当な結果を返す', () => {
    const data: SolventClassification[] = [
      { solvent: { hsp: { deltaD: 18, deltaP: 1.4, deltaH: 2 }, name: 'トルエン' }, isGood: true },
      { solvent: { hsp: { deltaD: 18.6, deltaP: 0, deltaH: 0 }, name: 'ヘキサン' }, isGood: true },
      { solvent: { hsp: { deltaD: 17.4, deltaP: 6.1, deltaH: 4.7 }, name: 'THF' }, isGood: true },
      { solvent: { hsp: { deltaD: 15, deltaP: 10, deltaH: 20 }, name: '水' }, isGood: false },
    ];
    const result = fitHSPSphere(data);
    expect(result.center.deltaD).toBeGreaterThan(0);
    expect(result.r0).toBeGreaterThan(0);
    expect(result.correctCount).toBeGreaterThanOrEqual(0);
    expect(result.correctCount).toBeLessThanOrEqual(result.totalCount);
  });

  it('混合データで misclassified の形状が正しい', () => {
    const data: SolventClassification[] = [
      { solvent: { hsp: { deltaD: 18, deltaP: 1.4, deltaH: 2 }, name: 'トルエン' }, isGood: true },
      { solvent: { hsp: { deltaD: 15.1, deltaP: 5.3, deltaH: 5.1 }, name: 'MEK' }, isGood: true },
      { solvent: { hsp: { deltaD: 17.4, deltaP: 6.1, deltaH: 4.7 }, name: 'THF' }, isGood: true },
      { solvent: { hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 }, name: 'エタノール' }, isGood: false },
      { solvent: { hsp: { deltaD: 15.5, deltaP: 16, deltaH: 42.3 }, name: '水' }, isGood: false },
    ];
    const result = fitHSPSphere(data);
    expect(result.totalCount).toBe(5);
    expect(result.correctCount + result.misclassified.length).toBe(5);

    for (const m of result.misclassified) {
      expect(m).toHaveProperty('name');
      expect(m).toHaveProperty('isGood');
      expect(m).toHaveProperty('ra');
      expect(m).toHaveProperty('red');
      expect(typeof m.name).toBe('string');
      expect(typeof m.isGood).toBe('boolean');
      expect(typeof m.ra).toBe('number');
      expect(typeof m.red).toBe('number');
    }
  });

  it('fitness は数値', () => {
    const data: SolventClassification[] = [
      { solvent: { hsp: { deltaD: 18, deltaP: 1.4, deltaH: 2 }, name: 'A' }, isGood: true },
      { solvent: { hsp: { deltaD: 15.5, deltaP: 16, deltaH: 42.3 }, name: 'B' }, isGood: false },
    ];
    const result = fitHSPSphere(data);
    expect(typeof result.fitness).toBe('number');
    expect(isFinite(result.fitness)).toBe(true);
  });
});

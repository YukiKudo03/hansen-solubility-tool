import { describe, it, expect } from 'vitest';
import {
  estimateSolubility,
  solubilityToLabel,
} from '../../src/core/solubility-estimation';

describe('estimateSolubility', () => {
  it('RED < 0.5 で高い溶解度を推定', () => {
    const result = estimateSolubility(0.3, 2.0);
    expect(result.mgPerMl).toBeGreaterThan(10);
  });

  it('RED > 2.0 で低い溶解度を推定', () => {
    const result = estimateSolubility(2.5, 2.0);
    expect(result.mgPerMl).toBeLessThan(1);
  });

  it('RED = 1.0 で低〜中程度の溶解度', () => {
    const result = estimateSolubility(1.0, 2.0);
    // log₁₀(S) = 2.0 - 2.5×1 - 0.3×2 = -1.1 → S ≈ 0.08 mg/mL
    expect(result.mgPerMl).toBeGreaterThan(0.01);
    expect(result.mgPerMl).toBeLessThan(10);
  });

  it('logP未設定(null)でもフォールバック推定', () => {
    const result = estimateSolubility(0.5, null);
    expect(result.mgPerMl).toBeGreaterThan(0);
    expect(result.confidence).toBe('low');
  });

  it('logP設定時はconfidence=mediumを返す', () => {
    const result = estimateSolubility(0.5, 2.0);
    expect(result.confidence).toBe('medium');
  });

  it('REDが0の場合に高い溶解度', () => {
    const result = estimateSolubility(0, 2.0);
    // log₁₀(S) = 2.0 - 0 - 0.6 = 1.4 → S ≈ 25 mg/mL
    expect(result.mgPerMl).toBeGreaterThan(10);
  });

  it('負のREDでも例外なし', () => {
    expect(() => estimateSolubility(-1, 2.0)).not.toThrow();
  });
});

describe('solubilityToLabel', () => {
  it('> 100 mg/mL で「高溶解性」', () => {
    expect(solubilityToLabel(150)).toBe('高溶解性');
  });

  it('10-100 mg/mL で「溶解性あり」', () => {
    expect(solubilityToLabel(50)).toBe('溶解性あり');
  });

  it('1-10 mg/mL で「やや難溶」', () => {
    expect(solubilityToLabel(5)).toBe('やや難溶');
  });

  it('< 1 mg/mL で「難溶」', () => {
    expect(solubilityToLabel(0.5)).toBe('難溶');
  });

  it('< 0.01 mg/mL で「不溶」', () => {
    expect(solubilityToLabel(0.005)).toBe('不溶');
  });
});

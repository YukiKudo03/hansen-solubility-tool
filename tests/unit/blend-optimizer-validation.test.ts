import { describe, it, expect } from 'vitest';
import { validateBlendOptimizationInput } from '../../src/core/validation';

describe('validateBlendOptimizationInput', () => {
  it('有効な入力でnull', () => {
    expect(validateBlendOptimizationInput({
      targetDeltaD: 17.0, targetDeltaP: 5.0, targetDeltaH: 10.0,
      candidateCount: 3, maxComponents: 2, stepSize: 0.05, topN: 20,
    })).toBeNull();
  });

  it('stepSize=0でエラー', () => {
    expect(validateBlendOptimizationInput({
      targetDeltaD: 17.0, targetDeltaP: 5.0, targetDeltaH: 10.0,
      candidateCount: 3, maxComponents: 2, stepSize: 0, topN: 20,
    })).toBeTruthy();
  });

  it('stepSize>1でエラー', () => {
    expect(validateBlendOptimizationInput({
      targetDeltaD: 17.0, targetDeltaP: 5.0, targetDeltaH: 10.0,
      candidateCount: 3, maxComponents: 2, stepSize: 1.5, topN: 20,
    })).toBeTruthy();
  });

  it('負のstepSizeでエラー', () => {
    expect(validateBlendOptimizationInput({
      targetDeltaD: 17.0, targetDeltaP: 5.0, targetDeltaH: 10.0,
      candidateCount: 3, maxComponents: 2, stepSize: -0.1, topN: 20,
    })).toBeTruthy();
  });

  it('topN=0でエラー', () => {
    expect(validateBlendOptimizationInput({
      targetDeltaD: 17.0, targetDeltaP: 5.0, targetDeltaH: 10.0,
      candidateCount: 3, maxComponents: 2, stepSize: 0.05, topN: 0,
    })).toBeTruthy();
  });

  it('候補数 < maxComponentsでエラー', () => {
    expect(validateBlendOptimizationInput({
      targetDeltaD: 17.0, targetDeltaP: 5.0, targetDeltaH: 10.0,
      candidateCount: 2, maxComponents: 3, stepSize: 0.05, topN: 20,
    })).toBeTruthy();
  });

  it('負のターゲットHSPでエラー', () => {
    expect(validateBlendOptimizationInput({
      targetDeltaD: -1, targetDeltaP: 5.0, targetDeltaH: 10.0,
      candidateCount: 3, maxComponents: 2, stepSize: 0.05, topN: 20,
    })).toBeTruthy();
  });
});

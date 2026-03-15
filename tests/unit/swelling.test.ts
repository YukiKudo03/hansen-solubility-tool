import { describe, it, expect } from 'vitest';
import { classifySwelling, DEFAULT_SWELLING_THRESHOLDS, getSwellingLevelInfo } from '../../src/core/swelling';
import { SwellingLevel } from '../../src/core/types';

describe('classifySwelling', () => {
  it('RED < 0.5 → Severe', () => {
    expect(classifySwelling(0.3)).toBe(SwellingLevel.Severe);
  });
  it('RED = 0.0 → Severe', () => {
    expect(classifySwelling(0.0)).toBe(SwellingLevel.Severe);
  });
  it('RED = 0.5 → High (境界)', () => {
    expect(classifySwelling(0.5)).toBe(SwellingLevel.High);
  });
  it('RED = 0.7 → High', () => {
    expect(classifySwelling(0.7)).toBe(SwellingLevel.High);
  });
  it('RED = 0.8 → Moderate (境界)', () => {
    expect(classifySwelling(0.8)).toBe(SwellingLevel.Moderate);
  });
  it('RED = 0.95 → Moderate', () => {
    expect(classifySwelling(0.95)).toBe(SwellingLevel.Moderate);
  });
  it('RED = 1.0 → Low (境界)', () => {
    expect(classifySwelling(1.0)).toBe(SwellingLevel.Low);
  });
  it('RED = 1.3 → Low', () => {
    expect(classifySwelling(1.3)).toBe(SwellingLevel.Low);
  });
  it('RED = 1.5 → Negligible (境界)', () => {
    expect(classifySwelling(1.5)).toBe(SwellingLevel.Negligible);
  });
  it('RED = 3.0 → Negligible', () => {
    expect(classifySwelling(3.0)).toBe(SwellingLevel.Negligible);
  });
  it('負のRED値でエラー', () => {
    expect(() => classifySwelling(-0.1)).toThrow();
  });
  it('カスタム閾値が適用される', () => {
    const custom = { severeMax: 0.3, highMax: 0.6, moderateMax: 0.9, lowMax: 1.2 };
    expect(classifySwelling(0.25, custom)).toBe(SwellingLevel.Severe);
    expect(classifySwelling(0.35, custom)).toBe(SwellingLevel.High);
    expect(classifySwelling(0.65, custom)).toBe(SwellingLevel.Moderate);
    expect(classifySwelling(0.95, custom)).toBe(SwellingLevel.Low);
    expect(classifySwelling(1.25, custom)).toBe(SwellingLevel.Negligible);
  });
});

describe('DEFAULT_SWELLING_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_SWELLING_THRESHOLDS;
    expect(t.severeMax).toBeLessThan(t.highMax);
    expect(t.highMax).toBeLessThan(t.moderateMax);
    expect(t.moderateMax).toBeLessThan(t.lowMax);
  });
});

describe('getSwellingLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [SwellingLevel.Severe, SwellingLevel.High, SwellingLevel.Moderate, SwellingLevel.Low, SwellingLevel.Negligible];
    for (const level of levels) {
      const info = getSwellingLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});

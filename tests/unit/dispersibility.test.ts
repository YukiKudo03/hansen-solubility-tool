import { describe, it, expect } from 'vitest';
import { classifyDispersibility, DEFAULT_DISPERSIBILITY_THRESHOLDS, getDispersibilityLevelInfo } from '../../src/core/dispersibility';
import { DispersibilityLevel } from '../../src/core/types';

describe('classifyDispersibility', () => {
  it('RED < 0.5 → Excellent', () => {
    expect(classifyDispersibility(0.3)).toBe(DispersibilityLevel.Excellent);
  });

  it('RED = 0.0 → Excellent', () => {
    expect(classifyDispersibility(0.0)).toBe(DispersibilityLevel.Excellent);
  });

  it('RED = 0.5 → Good (境界)', () => {
    expect(classifyDispersibility(0.5)).toBe(DispersibilityLevel.Good);
  });

  it('RED = 0.7 → Good', () => {
    expect(classifyDispersibility(0.7)).toBe(DispersibilityLevel.Good);
  });

  it('RED = 0.8 → Fair (境界)', () => {
    expect(classifyDispersibility(0.8)).toBe(DispersibilityLevel.Fair);
  });

  it('RED = 0.95 → Fair', () => {
    expect(classifyDispersibility(0.95)).toBe(DispersibilityLevel.Fair);
  });

  it('RED = 1.0 → Poor (境界)', () => {
    expect(classifyDispersibility(1.0)).toBe(DispersibilityLevel.Poor);
  });

  it('RED = 1.3 → Poor', () => {
    expect(classifyDispersibility(1.3)).toBe(DispersibilityLevel.Poor);
  });

  it('RED = 1.5 → Bad (境界)', () => {
    expect(classifyDispersibility(1.5)).toBe(DispersibilityLevel.Bad);
  });

  it('RED = 3.0 → Bad', () => {
    expect(classifyDispersibility(3.0)).toBe(DispersibilityLevel.Bad);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyDispersibility(-0.1)).toThrow();
  });

  it('カスタム閾値が適用される', () => {
    const custom = { excellentMax: 0.3, goodMax: 0.6, fairMax: 0.9, poorMax: 1.2 };
    expect(classifyDispersibility(0.25, custom)).toBe(DispersibilityLevel.Excellent);
    expect(classifyDispersibility(0.35, custom)).toBe(DispersibilityLevel.Good);
    expect(classifyDispersibility(0.65, custom)).toBe(DispersibilityLevel.Fair);
    expect(classifyDispersibility(0.95, custom)).toBe(DispersibilityLevel.Poor);
    expect(classifyDispersibility(1.25, custom)).toBe(DispersibilityLevel.Bad);
  });
});

describe('DEFAULT_DISPERSIBILITY_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_DISPERSIBILITY_THRESHOLDS;
    expect(t.excellentMax).toBeLessThan(t.goodMax);
    expect(t.goodMax).toBeLessThan(t.fairMax);
    expect(t.fairMax).toBeLessThan(t.poorMax);
  });
});

describe('getDispersibilityLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [
      DispersibilityLevel.Excellent,
      DispersibilityLevel.Good,
      DispersibilityLevel.Fair,
      DispersibilityLevel.Poor,
      DispersibilityLevel.Bad,
    ];
    for (const level of levels) {
      const info = getDispersibilityLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});

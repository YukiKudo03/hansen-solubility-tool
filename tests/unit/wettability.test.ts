import { describe, it, expect } from 'vitest';
import {
  classifyWettability,
  DEFAULT_WETTABILITY_THRESHOLDS,
  getWettabilityLevelInfo,
} from '../../src/core/wettability';
import { WettabilityLevel } from '../../src/core/types';

describe('classifyWettability', () => {
  it('θ=5° → SuperHydrophilic', () => {
    expect(classifyWettability(5)).toBe(WettabilityLevel.SuperHydrophilic);
  });

  it('θ=0° → SuperHydrophilic', () => {
    expect(classifyWettability(0)).toBe(WettabilityLevel.SuperHydrophilic);
  });

  it('θ=10° → Hydrophilic (境界)', () => {
    expect(classifyWettability(10)).toBe(WettabilityLevel.Hydrophilic);
  });

  it('θ=20° → Hydrophilic', () => {
    expect(classifyWettability(20)).toBe(WettabilityLevel.Hydrophilic);
  });

  it('θ=30° → Wettable (境界)', () => {
    expect(classifyWettability(30)).toBe(WettabilityLevel.Wettable);
  });

  it('θ=45° → Wettable', () => {
    expect(classifyWettability(45)).toBe(WettabilityLevel.Wettable);
  });

  it('θ=60° → Moderate (境界)', () => {
    expect(classifyWettability(60)).toBe(WettabilityLevel.Moderate);
  });

  it('θ=75° → Moderate', () => {
    expect(classifyWettability(75)).toBe(WettabilityLevel.Moderate);
  });

  it('θ=90° → Hydrophobic (境界)', () => {
    expect(classifyWettability(90)).toBe(WettabilityLevel.Hydrophobic);
  });

  it('θ=120° → Hydrophobic', () => {
    expect(classifyWettability(120)).toBe(WettabilityLevel.Hydrophobic);
  });

  it('θ=150° → SuperHydrophobic (境界)', () => {
    expect(classifyWettability(150)).toBe(WettabilityLevel.SuperHydrophobic);
  });

  it('θ=160° → SuperHydrophobic', () => {
    expect(classifyWettability(160)).toBe(WettabilityLevel.SuperHydrophobic);
  });

  it('θ=180° → SuperHydrophobic', () => {
    expect(classifyWettability(180)).toBe(WettabilityLevel.SuperHydrophobic);
  });

  it('負の角度でエラー', () => {
    expect(() => classifyWettability(-1)).toThrow();
  });

  it('カスタム閾値が適用される', () => {
    const custom = {
      superHydrophilicMax: 5,
      hydrophilicMax: 20,
      wettableMax: 50,
      moderateMax: 80,
      hydrophobicMax: 140,
    };
    expect(classifyWettability(3, custom)).toBe(WettabilityLevel.SuperHydrophilic);
    expect(classifyWettability(10, custom)).toBe(WettabilityLevel.Hydrophilic);
    expect(classifyWettability(35, custom)).toBe(WettabilityLevel.Wettable);
    expect(classifyWettability(65, custom)).toBe(WettabilityLevel.Moderate);
    expect(classifyWettability(100, custom)).toBe(WettabilityLevel.Hydrophobic);
    expect(classifyWettability(145, custom)).toBe(WettabilityLevel.SuperHydrophobic);
  });
});

describe('DEFAULT_WETTABILITY_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_WETTABILITY_THRESHOLDS;
    expect(t.superHydrophilicMax).toBeLessThan(t.hydrophilicMax);
    expect(t.hydrophilicMax).toBeLessThan(t.wettableMax);
    expect(t.wettableMax).toBeLessThan(t.moderateMax);
    expect(t.moderateMax).toBeLessThan(t.hydrophobicMax);
  });
});

describe('getWettabilityLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [
      WettabilityLevel.SuperHydrophilic,
      WettabilityLevel.Hydrophilic,
      WettabilityLevel.Wettable,
      WettabilityLevel.Moderate,
      WettabilityLevel.Hydrophobic,
      WettabilityLevel.SuperHydrophobic,
    ];
    for (const level of levels) {
      const info = getWettabilityLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});

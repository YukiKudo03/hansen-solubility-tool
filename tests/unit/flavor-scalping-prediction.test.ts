import { describe, it, expect } from 'vitest';
import {
  classifyScalping,
  screenFlavorScalping,
  getScalpingLevelInfo,
  DEFAULT_SCALPING_THRESHOLDS,
  ScalpingLevel,
} from '../../src/core/flavor-scalping-prediction';
import type { FlavorInput } from '../../src/core/flavor-scalping-prediction';
import type { HSPValues } from '../../src/core/types';

describe('classifyScalping', () => {
  it('RED < 0.8 → HighScalping', () => {
    expect(classifyScalping(0.5)).toBe(ScalpingLevel.HighScalping);
  });
  it('RED = 0.0 → HighScalping', () => {
    expect(classifyScalping(0.0)).toBe(ScalpingLevel.HighScalping);
  });
  it('RED = 0.8 → ModerateScalping (境界)', () => {
    expect(classifyScalping(0.8)).toBe(ScalpingLevel.ModerateScalping);
  });
  it('RED = 1.0 → ModerateScalping', () => {
    expect(classifyScalping(1.0)).toBe(ScalpingLevel.ModerateScalping);
  });
  it('RED = 1.2 → LowScalping (境界)', () => {
    expect(classifyScalping(1.2)).toBe(ScalpingLevel.LowScalping);
  });
  it('RED = 2.0 → LowScalping', () => {
    expect(classifyScalping(2.0)).toBe(ScalpingLevel.LowScalping);
  });
  it('負のRED値でエラー', () => {
    expect(() => classifyScalping(-0.1)).toThrow();
  });
  it('カスタム閾値が適用される', () => {
    const custom = { highScalpingMax: 0.5, moderateScalpingMax: 1.0 };
    expect(classifyScalping(0.3, custom)).toBe(ScalpingLevel.HighScalping);
    expect(classifyScalping(0.7, custom)).toBe(ScalpingLevel.ModerateScalping);
    expect(classifyScalping(1.5, custom)).toBe(ScalpingLevel.LowScalping);
  });
});

describe('DEFAULT_SCALPING_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_SCALPING_THRESHOLDS;
    expect(t.highScalpingMax).toBeLessThan(t.moderateScalpingMax);
  });
});

describe('getScalpingLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [ScalpingLevel.HighScalping, ScalpingLevel.ModerateScalping, ScalpingLevel.LowScalping];
    for (const level of levels) {
      const info = getScalpingLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});

describe('screenFlavorScalping', () => {
  // PE (ポリエチレン): dD=17.1, dP=0, dH=2, R0=8.0 (文献値)
  const peHSP: HSPValues = { deltaD: 17.1, deltaP: 0, deltaH: 2.0 };
  const peR0 = 8.0;

  // Limonene (柑橘系アロマ): dD=17.2, dP=1.8, dH=4.3
  const limonene: FlavorInput = { name: 'Limonene', hsp: { deltaD: 17.2, deltaP: 1.8, deltaH: 4.3 } };
  // Vanillin (バニラ成分): dD=18.4, dP=10.2, dH=14.2 → PEから遠い
  const vanillin: FlavorInput = { name: 'Vanillin', hsp: { deltaD: 18.4, deltaP: 10.2, deltaH: 14.2 } };

  it('PE vs Limonene → HighScalping (柑橘系のPEスカルピングは既知問題)', () => {
    const results = screenFlavorScalping(peHSP, peR0, [limonene]);
    expect(results).toHaveLength(1);
    expect(results[0].scalpingLevel).toBe(ScalpingLevel.HighScalping);
    expect(results[0].red).toBeLessThan(0.8);
  });

  it('PE vs Vanillin → LowScalping (極性が高くPEに吸収されにくい)', () => {
    const results = screenFlavorScalping(peHSP, peR0, [vanillin]);
    expect(results).toHaveLength(1);
    expect(results[0].scalpingLevel).toBe(ScalpingLevel.LowScalping);
    expect(results[0].red).toBeGreaterThanOrEqual(1.2);
  });

  it('結果がRED昇順にソートされる', () => {
    const results = screenFlavorScalping(peHSP, peR0, [vanillin, limonene]);
    expect(results).toHaveLength(2);
    expect(results[0].red).toBeLessThanOrEqual(results[1].red);
    expect(results[0].flavorName).toBe('Limonene');
  });

  it('空のリストで空結果', () => {
    const results = screenFlavorScalping(peHSP, peR0, []);
    expect(results).toHaveLength(0);
  });

  it('Ra値が正しく計算される', () => {
    const results = screenFlavorScalping(peHSP, peR0, [limonene]);
    expect(results[0].ra).toBeGreaterThan(0);
  });
});

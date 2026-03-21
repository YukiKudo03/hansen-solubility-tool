import { describe, it, expect } from 'vitest';
import {
  classifyStability,
  screenPigmentDispersion,
  StabilityLevel,
  DEFAULT_STABILITY_THRESHOLDS,
  getStabilityLevelInfo,
} from '../../src/core/pigment-dispersion-stability';

describe('classifyStability', () => {
  it('RED < 0.8 → Stable', () => {
    expect(classifyStability(0.0)).toBe(StabilityLevel.Stable);
    expect(classifyStability(0.5)).toBe(StabilityLevel.Stable);
    expect(classifyStability(0.79)).toBe(StabilityLevel.Stable);
  });

  it('0.8 <= RED < 1.2 → Moderate', () => {
    expect(classifyStability(0.8)).toBe(StabilityLevel.Moderate);
    expect(classifyStability(1.0)).toBe(StabilityLevel.Moderate);
    expect(classifyStability(1.19)).toBe(StabilityLevel.Moderate);
  });

  it('RED >= 1.2 → Unstable', () => {
    expect(classifyStability(1.2)).toBe(StabilityLevel.Unstable);
    expect(classifyStability(2.0)).toBe(StabilityLevel.Unstable);
    expect(classifyStability(5.0)).toBe(StabilityLevel.Unstable);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyStability(-0.1)).toThrow('RED値は非負でなければなりません');
  });

  it('カスタム閾値を適用', () => {
    const custom = { stableMax: 0.5, moderateMax: 1.0 };
    expect(classifyStability(0.3, custom)).toBe(StabilityLevel.Stable);
    expect(classifyStability(0.6, custom)).toBe(StabilityLevel.Moderate);
    expect(classifyStability(1.1, custom)).toBe(StabilityLevel.Unstable);
  });
});

describe('getStabilityLevelInfo', () => {
  it('各レベルの情報を正しく返す', () => {
    const stable = getStabilityLevelInfo(StabilityLevel.Stable);
    expect(stable.label).toBe('安定');
    expect(stable.color).toBe('green');

    const moderate = getStabilityLevelInfo(StabilityLevel.Moderate);
    expect(moderate.label).toBe('中程度');
    expect(moderate.color).toBe('yellow');

    const unstable = getStabilityLevelInfo(StabilityLevel.Unstable);
    expect(unstable.label).toBe('不安定');
    expect(unstable.color).toBe('red');
  });
});

describe('screenPigmentDispersion', () => {
  // TiO2顔料 (dD=20.0, dP=5.0, dH=5.0, R0=8)
  const tio2HSP = { deltaD: 20.0, deltaP: 5.0, deltaH: 5.0 };
  const r0 = 8;

  const vehicles = [
    { name: 'エポキシ樹脂', hsp: { deltaD: 21.3, deltaP: 11.7, deltaH: 8.6 } },
    { name: 'アクリル樹脂', hsp: { deltaD: 18.6, deltaP: 10.2, deltaH: 7.4 } },
    { name: 'シリコーン樹脂', hsp: { deltaD: 15.9, deltaP: 1.0, deltaH: 4.7 } },
  ];

  it('TiO2顔料のスクリーニングで正しい安定性分類を返す', () => {
    const results = screenPigmentDispersion(tio2HSP, r0, vehicles);
    expect(results.length).toBe(3);

    // RED昇順でソートされている
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].red).toBeLessThanOrEqual(results[i + 1].red);
    }

    // 各結果にvehicle, ra, red, stabilityが含まれる
    for (const r of results) {
      expect(r.vehicle.name).toBeTruthy();
      expect(r.ra).toBeGreaterThanOrEqual(0);
      expect(r.red).toBeGreaterThanOrEqual(0);
      expect(Object.values(StabilityLevel)).toContain(r.stability);
    }
  });

  it('空のビヒクルリストで空配列を返す', () => {
    const results = screenPigmentDispersion(tio2HSP, r0, []);
    expect(results).toEqual([]);
  });

  it('エポキシ樹脂はTiO2に対してStableまたはModerate', () => {
    // エポキシはdD=21.3でTiO2の20.0に近い → HSP距離が小さい
    const results = screenPigmentDispersion(tio2HSP, r0, [vehicles[0]]);
    expect(results[0].stability).not.toBe(StabilityLevel.Unstable);
  });

  it('結果のraとredが正しく計算される', () => {
    const results = screenPigmentDispersion(tio2HSP, r0, vehicles);
    for (const r of results) {
      // Ra = sqrt(4*(dD1-dD2)^2 + (dP1-dP2)^2 + (dH1-dH2)^2)
      const dD = tio2HSP.deltaD - r.vehicle.hsp.deltaD;
      const dP = tio2HSP.deltaP - r.vehicle.hsp.deltaP;
      const dH = tio2HSP.deltaH - r.vehicle.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / r0, 6);
    }
  });
});

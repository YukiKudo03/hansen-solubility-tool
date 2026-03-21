import { describe, it, expect } from 'vitest';
import {
  classifyResidual,
  predictResidualSolvent,
  ResidualLevel,
  DEFAULT_RESIDUAL_THRESHOLDS,
  getResidualLevelInfo,
} from '../../src/core/residual-solvent-prediction';

describe('classifyResidual', () => {
  it('RED < 0.7 → HighResidual', () => {
    expect(classifyResidual(0.0)).toBe(ResidualLevel.HighResidual);
    expect(classifyResidual(0.3)).toBe(ResidualLevel.HighResidual);
    expect(classifyResidual(0.69)).toBe(ResidualLevel.HighResidual);
  });

  it('0.7 <= RED < 1.0 → ModerateResidual', () => {
    expect(classifyResidual(0.7)).toBe(ResidualLevel.ModerateResidual);
    expect(classifyResidual(0.85)).toBe(ResidualLevel.ModerateResidual);
    expect(classifyResidual(0.99)).toBe(ResidualLevel.ModerateResidual);
  });

  it('RED >= 1.0 → LowResidual', () => {
    expect(classifyResidual(1.0)).toBe(ResidualLevel.LowResidual);
    expect(classifyResidual(1.5)).toBe(ResidualLevel.LowResidual);
    expect(classifyResidual(3.0)).toBe(ResidualLevel.LowResidual);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyResidual(-0.1)).toThrow('RED値は非負でなければなりません');
  });

  it('カスタム閾値を適用', () => {
    const custom = { highResidualMax: 0.5, moderateResidualMax: 0.8 };
    expect(classifyResidual(0.3, custom)).toBe(ResidualLevel.HighResidual);
    expect(classifyResidual(0.6, custom)).toBe(ResidualLevel.ModerateResidual);
    expect(classifyResidual(0.9, custom)).toBe(ResidualLevel.LowResidual);
  });
});

describe('getResidualLevelInfo', () => {
  it('各レベルの情報を正しく返す', () => {
    const high = getResidualLevelInfo(ResidualLevel.HighResidual);
    expect(high.label).toBe('残留リスク高');
    expect(high.color).toBe('red');

    const moderate = getResidualLevelInfo(ResidualLevel.ModerateResidual);
    expect(moderate.label).toBe('中程度');
    expect(moderate.color).toBe('yellow');

    const low = getResidualLevelInfo(ResidualLevel.LowResidual);
    expect(low.label).toBe('残留リスク低');
    expect(low.color).toBe('green');
  });
});

describe('predictResidualSolvent', () => {
  // PMMA膜 (dD=18.6, dP=10.5, dH=5.1, R0=8)
  const filmHSP = { deltaD: 18.6, deltaP: 10.5, deltaH: 5.1 };
  const filmR0 = 8;

  const solvents = [
    { name: 'DMF', hsp: { deltaD: 17.4, deltaP: 13.7, deltaH: 11.3 } },
    { name: 'アセトン', hsp: { deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 } },
    { name: 'トルエン', hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 } },
  ];

  it('PMMA膜の残留溶媒予測で正しい結果を返す', () => {
    const results = predictResidualSolvent(filmHSP, filmR0, solvents);
    expect(results.length).toBe(3);

    // RED昇順でソートされている
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].red).toBeLessThanOrEqual(results[i + 1].red);
    }

    for (const r of results) {
      expect(r.solvent.name).toBeTruthy();
      expect(r.ra).toBeGreaterThanOrEqual(0);
      expect(r.red).toBeGreaterThanOrEqual(0);
      expect(Object.values(ResidualLevel)).toContain(r.residualLevel);
    }
  });

  it('DMFはPMMAに対してHighResidualまたはModerate（HSPが近い）', () => {
    const results = predictResidualSolvent(filmHSP, filmR0, [solvents[0]]);
    // DMF: dD=17.4, dP=13.7, dH=11.3 はPMMAに比較的近い → 残留リスク
    expect(results[0].residualLevel).not.toBe(ResidualLevel.LowResidual);
  });

  it('トルエンはPMMAに対してModerateまたはLowResidual（dPが離れている）', () => {
    const results = predictResidualSolvent(filmHSP, filmR0, [solvents[2]]);
    // トルエン: dP=1.4 vs PMMA dP=10.5 → HSP距離が大きい → 残留しにくい
    expect(results[0].residualLevel).not.toBe(ResidualLevel.HighResidual);
  });

  it('空の溶媒リストで空配列を返す', () => {
    const results = predictResidualSolvent(filmHSP, filmR0, []);
    expect(results).toEqual([]);
  });

  it('結果のraとredが正しく計算される', () => {
    const results = predictResidualSolvent(filmHSP, filmR0, solvents);
    for (const r of results) {
      const dD = filmHSP.deltaD - r.solvent.hsp.deltaD;
      const dP = filmHSP.deltaP - r.solvent.hsp.deltaP;
      const dH = filmHSP.deltaH - r.solvent.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / filmR0, 6);
    }
  });
});

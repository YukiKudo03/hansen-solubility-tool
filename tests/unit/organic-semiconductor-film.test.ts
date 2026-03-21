import { describe, it, expect } from 'vitest';
import {
  screenOSCSolvents,
  classifyFilmFormation,
  FilmFormationLevel,
  getFilmFormationLevelInfo,
} from '../../src/core/organic-semiconductor-film';

describe('classifyFilmFormation', () => {
  it('RED < 0.8 & bp >= 150 → Excellent', () => {
    expect(classifyFilmFormation(0.5, 180)).toBe(FilmFormationLevel.Excellent);
    expect(classifyFilmFormation(0.79, 150)).toBe(FilmFormationLevel.Excellent);
  });

  it('RED < 1.0 & bp >= 130 → Good', () => {
    expect(classifyFilmFormation(0.9, 140)).toBe(FilmFormationLevel.Good);
    expect(classifyFilmFormation(0.99, 130)).toBe(FilmFormationLevel.Good);
  });

  it('RED < 0.8 だが bp < 150 → Good or Moderate', () => {
    // RED < 0.8, bp=140 → bp < 150 なのでExcellentにはならない
    // RED < 1.0, bp >= 130 → Good
    expect(classifyFilmFormation(0.7, 140)).toBe(FilmFormationLevel.Good);
    // RED < 1.0, bp < 130 → Moderate (RED < 1.2)
    expect(classifyFilmFormation(0.7, 100)).toBe(FilmFormationLevel.Moderate);
  });

  it('RED < 1.2 → Moderate', () => {
    expect(classifyFilmFormation(1.1, 200)).toBe(FilmFormationLevel.Moderate);
    expect(classifyFilmFormation(1.19, null)).toBe(FilmFormationLevel.Moderate);
  });

  it('RED >= 1.2 → Poor', () => {
    expect(classifyFilmFormation(1.2, 200)).toBe(FilmFormationLevel.Poor);
    expect(classifyFilmFormation(2.0, 300)).toBe(FilmFormationLevel.Poor);
  });

  it('沸点がnullの場合はbp=0として扱われる', () => {
    expect(classifyFilmFormation(0.5, null)).toBe(FilmFormationLevel.Moderate);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyFilmFormation(-0.1, 150)).toThrow('RED値は非負でなければなりません');
  });
});

describe('getFilmFormationLevelInfo', () => {
  it('各レベルの情報を正しく返す', () => {
    const excellent = getFilmFormationLevelInfo(FilmFormationLevel.Excellent);
    expect(excellent.label).toBe('優秀');
    expect(excellent.color).toBe('green');

    const good = getFilmFormationLevelInfo(FilmFormationLevel.Good);
    expect(good.label).toBe('良好');
    expect(good.color).toBe('blue');

    const moderate = getFilmFormationLevelInfo(FilmFormationLevel.Moderate);
    expect(moderate.label).toBe('中程度');
    expect(moderate.color).toBe('yellow');

    const poor = getFilmFormationLevelInfo(FilmFormationLevel.Poor);
    expect(poor.label).toBe('不良');
    expect(poor.color).toBe('red');
  });
});

describe('screenOSCSolvents', () => {
  // P3HT (dD=18.2, dP=4.7, dH=5.0, R0=7)
  const oscHSP = { deltaD: 18.2, deltaP: 4.7, deltaH: 5.0 };
  const oscR0 = 7;

  const solvents = [
    { name: 'クロロベンゼン', hsp: { deltaD: 19.0, deltaP: 4.3, deltaH: 2.0 }, boilingPoint: 131 },
    { name: 'ジクロロベンゼン', hsp: { deltaD: 19.2, deltaP: 6.3, deltaH: 3.3 }, boilingPoint: 180 },
    { name: 'トルエン', hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 }, boilingPoint: 111 },
  ];

  it('P3HTに対する溶媒スクリーニング結果を返す', () => {
    const results = screenOSCSolvents(oscHSP, oscR0, solvents);
    expect(results.length).toBe(3);

    // RED昇順ソート
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].red).toBeLessThanOrEqual(results[i + 1].red);
    }
  });

  it('ジクロロベンゼンはExcellent（RED小+高沸点）', () => {
    const results = screenOSCSolvents(oscHSP, oscR0, [solvents[1]]);
    // DCB: HSPがP3HTに近い + 沸点180°C
    expect(results[0].red).toBeLessThan(1.0);
    expect(results[0].filmFormation).toBe(FilmFormationLevel.Excellent);
  });

  it('クロロベンゼンはGood（RED小+中沸点）', () => {
    const results = screenOSCSolvents(oscHSP, oscR0, [solvents[0]]);
    // CB: HSPがP3HTに近い + 沸点131°C
    expect(results[0].red).toBeLessThan(1.0);
    expect(results[0].filmFormation).toBe(FilmFormationLevel.Good);
  });

  it('結果のraとredが正しく計算される', () => {
    const results = screenOSCSolvents(oscHSP, oscR0, solvents);
    for (const r of results) {
      const dD = oscHSP.deltaD - r.solvent.hsp.deltaD;
      const dP = oscHSP.deltaP - r.solvent.hsp.deltaP;
      const dH = oscHSP.deltaH - r.solvent.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / oscR0, 6);
    }
  });

  it('boilingPointがnullの溶媒も正常に処理される', () => {
    const noBoil = [{ name: 'Unknown', hsp: { deltaD: 18.0, deltaP: 4.5, deltaH: 5.0 }, boilingPoint: null }];
    const results = screenOSCSolvents(oscHSP, oscR0, noBoil);
    expect(results.length).toBe(1);
    expect(results[0].solvent.boilingPoint).toBeNull();
  });

  it('空の溶媒リストで空配列を返す', () => {
    const results = screenOSCSolvents(oscHSP, oscR0, []);
    expect(results).toEqual([]);
  });
});

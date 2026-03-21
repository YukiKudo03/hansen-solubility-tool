import { describe, it, expect } from 'vitest';
import {
  screenUVInkMonomers,
  classifyMonomerSuitability,
  MonomerSuitability,
  getMonomerSuitabilityInfo,
} from '../../src/core/uv-curable-ink-monomer';

describe('classifyMonomerSuitability', () => {
  it('RED < 0.7 → Excellent', () => {
    expect(classifyMonomerSuitability(0.0)).toBe(MonomerSuitability.Excellent);
    expect(classifyMonomerSuitability(0.3)).toBe(MonomerSuitability.Excellent);
    expect(classifyMonomerSuitability(0.69)).toBe(MonomerSuitability.Excellent);
  });

  it('0.7 ≤ RED < 1.0 → Good', () => {
    expect(classifyMonomerSuitability(0.7)).toBe(MonomerSuitability.Good);
    expect(classifyMonomerSuitability(0.85)).toBe(MonomerSuitability.Good);
    expect(classifyMonomerSuitability(0.99)).toBe(MonomerSuitability.Good);
  });

  it('RED >= 1.0 → Poor', () => {
    expect(classifyMonomerSuitability(1.0)).toBe(MonomerSuitability.Poor);
    expect(classifyMonomerSuitability(1.5)).toBe(MonomerSuitability.Poor);
    expect(classifyMonomerSuitability(3.0)).toBe(MonomerSuitability.Poor);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyMonomerSuitability(-0.1)).toThrow('RED値は非負でなければなりません');
  });
});

describe('getMonomerSuitabilityInfo', () => {
  it('各レベルの情報を正しく返す', () => {
    const excellent = getMonomerSuitabilityInfo(MonomerSuitability.Excellent);
    expect(excellent.label).toBe('優秀');
    expect(excellent.color).toBe('green');

    const good = getMonomerSuitabilityInfo(MonomerSuitability.Good);
    expect(good.label).toBe('良好');
    expect(good.color).toBe('blue');

    const poor = getMonomerSuitabilityInfo(MonomerSuitability.Poor);
    expect(poor.label).toBe('不良');
    expect(poor.color).toBe('red');
  });
});

describe('screenUVInkMonomers', () => {
  // Epoxy acrylate oligomer
  const oligomerHSP = { deltaD: 19.0, deltaP: 10.0, deltaH: 8.0 };
  const oligomerR0 = 7;

  const monomers = [
    { name: 'HDDA', hsp: { deltaD: 16.8, deltaP: 7.0, deltaH: 7.5 } },
    { name: 'TPGDA', hsp: { deltaD: 16.2, deltaP: 6.5, deltaH: 8.2 } },
    { name: 'IBOA', hsp: { deltaD: 16.0, deltaP: 3.0, deltaH: 5.0 } },
  ];

  it('エポキシアクリレートオリゴマーに対するモノマースクリーニング結果を返す', () => {
    const results = screenUVInkMonomers(oligomerHSP, oligomerR0, monomers);
    expect(results.length).toBe(3);

    // RED昇順ソート
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].red).toBeLessThanOrEqual(results[i + 1].red);
    }
  });

  it('HDDAはオリゴマーに対して比較的近いHSP → Excellent or Good', () => {
    const results = screenUVInkMonomers(oligomerHSP, oligomerR0, [monomers[0]]);
    expect(results[0].red).toBeLessThan(1.0);
    expect([MonomerSuitability.Excellent, MonomerSuitability.Good]).toContain(results[0].suitability);
  });

  it('結果のraとredが正しく計算される', () => {
    const results = screenUVInkMonomers(oligomerHSP, oligomerR0, monomers);
    for (const r of results) {
      const dD = oligomerHSP.deltaD - r.monomer.hsp.deltaD;
      const dP = oligomerHSP.deltaP - r.monomer.hsp.deltaP;
      const dH = oligomerHSP.deltaH - r.monomer.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / oligomerR0, 6);
    }
  });

  it('IBOAはdPが遠いのでGoodまたはPoor', () => {
    const results = screenUVInkMonomers(oligomerHSP, oligomerR0, [monomers[2]]);
    // IBOA: dP=3.0 vs oligomer dP=10.0 → 大きな差
    expect([MonomerSuitability.Good, MonomerSuitability.Poor]).toContain(results[0].suitability);
  });

  it('空のモノマーリストで空配列を返す', () => {
    const results = screenUVInkMonomers(oligomerHSP, oligomerR0, []);
    expect(results).toEqual([]);
  });
});

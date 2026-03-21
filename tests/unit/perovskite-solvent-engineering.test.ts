import { describe, it, expect } from 'vitest';
import {
  screenPerovskiteSolvents,
  classifySolventRole,
  SolventRole,
  getSolventRoleInfo,
} from '../../src/core/perovskite-solvent-engineering';

describe('classifySolventRole', () => {
  it('RED < 1 → ProcessingSolvent', () => {
    expect(classifySolventRole(0.0)).toBe(SolventRole.ProcessingSolvent);
    expect(classifySolventRole(0.5)).toBe(SolventRole.ProcessingSolvent);
    expect(classifySolventRole(0.99)).toBe(SolventRole.ProcessingSolvent);
  });

  it('1 ≤ RED ≤ 1.5 → Intermediate', () => {
    expect(classifySolventRole(1.0)).toBe(SolventRole.Intermediate);
    expect(classifySolventRole(1.25)).toBe(SolventRole.Intermediate);
    expect(classifySolventRole(1.5)).toBe(SolventRole.Intermediate);
  });

  it('RED > 1.5 → AntiSolvent', () => {
    expect(classifySolventRole(1.51)).toBe(SolventRole.AntiSolvent);
    expect(classifySolventRole(2.0)).toBe(SolventRole.AntiSolvent);
    expect(classifySolventRole(5.0)).toBe(SolventRole.AntiSolvent);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifySolventRole(-0.1)).toThrow('RED値は非負でなければなりません');
  });
});

describe('getSolventRoleInfo', () => {
  it('各役割の情報を正しく返す', () => {
    const proc = getSolventRoleInfo(SolventRole.ProcessingSolvent);
    expect(proc.label).toBe('良溶媒');
    expect(proc.color).toBe('green');

    const inter = getSolventRoleInfo(SolventRole.Intermediate);
    expect(inter.label).toBe('中間');
    expect(inter.color).toBe('yellow');

    const anti = getSolventRoleInfo(SolventRole.AntiSolvent);
    expect(anti.label).toBe('アンチソルベント');
    expect(anti.color).toBe('blue');
  });
});

describe('screenPerovskiteSolvents', () => {
  // MAPbI3前駆体
  const precursorHSP = { deltaD: 18.5, deltaP: 12.0, deltaH: 9.5 };
  const R0 = 7;

  const solvents = [
    { name: 'DMF', hsp: { deltaD: 17.4, deltaP: 13.7, deltaH: 11.3 } },
    { name: 'DMSO', hsp: { deltaD: 18.4, deltaP: 16.4, deltaH: 10.2 } },
    { name: 'トルエン', hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 } },
    { name: 'ジエチルエーテル', hsp: { deltaD: 14.5, deltaP: 2.9, deltaH: 5.1 } },
  ];

  it('MAPbI3前駆体に対する溶媒スクリーニング結果を返す', () => {
    const results = screenPerovskiteSolvents(precursorHSP, R0, solvents);
    expect(results.length).toBe(4);

    // RED昇順ソート
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].red).toBeLessThanOrEqual(results[i + 1].red);
    }
  });

  it('DMFはProcessingSolvent（良溶媒）と判定される', () => {
    const results = screenPerovskiteSolvents(precursorHSP, R0, [solvents[0]]);
    // DMF: HSPが近い → RED < 1
    expect(results[0].role).toBe(SolventRole.ProcessingSolvent);
    expect(results[0].red).toBeLessThan(1.0);
  });

  it('DMSOはProcessingSolvent（良溶媒）と判定される', () => {
    const results = screenPerovskiteSolvents(precursorHSP, R0, [solvents[1]]);
    expect(results[0].role).toBe(SolventRole.ProcessingSolvent);
    expect(results[0].red).toBeLessThan(1.0);
  });

  it('トルエンまたはジエチルエーテルはAntiSolventまたはIntermediateと判定される', () => {
    const results = screenPerovskiteSolvents(precursorHSP, R0, [solvents[2], solvents[3]]);
    for (const r of results) {
      // 極性項・水素結合項が大きく異なるためRED > 1
      expect(r.red).toBeGreaterThan(1.0);
      expect([SolventRole.Intermediate, SolventRole.AntiSolvent]).toContain(r.role);
    }
  });

  it('結果のraとredが正しく計算される', () => {
    const results = screenPerovskiteSolvents(precursorHSP, R0, solvents);
    for (const r of results) {
      const dD = precursorHSP.deltaD - r.solvent.hsp.deltaD;
      const dP = precursorHSP.deltaP - r.solvent.hsp.deltaP;
      const dH = precursorHSP.deltaH - r.solvent.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / R0, 6);
    }
  });

  it('空の溶媒リストで空配列を返す', () => {
    const results = screenPerovskiteSolvents(precursorHSP, R0, []);
    expect(results).toEqual([]);
  });
});

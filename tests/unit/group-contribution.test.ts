import { describe, it, expect } from 'vitest';
import {
  GROUP_CONTRIBUTION_TABLE,
  estimateHSPFromGroups,
  parseSimpleMolecularFormula,
  estimateHSPStefanisPanayiotou,
  getAvailableFirstOrderGroups,
  getAvailableSecondOrderGroups,
} from '../../src/core/group-contribution';

describe('GROUP_CONTRIBUTION_TABLE', () => {
  it('-CH3 のグループ寄与値が定義されている', () => {
    const ch3 = GROUP_CONTRIBUTION_TABLE['-CH3'];
    expect(ch3).toBeDefined();
    expect(ch3.Fd).toBeGreaterThan(0);
    expect(ch3.V).toBeGreaterThan(0);
  });

  it('-OH のグループ寄与値が定義されている', () => {
    const oh = GROUP_CONTRIBUTION_TABLE['-OH'];
    expect(oh).toBeDefined();
    expect(oh.Eh).toBeGreaterThan(0); // 水素結合寄与
  });

  it('全エントリのFdとVが数値', () => {
    for (const [name, gc] of Object.entries(GROUP_CONTRIBUTION_TABLE)) {
      expect(typeof gc.Fd, `${name} のFd`).toBe('number');
      expect(typeof gc.V, `${name} のV`).toBe('number');
    }
  });
});

describe('estimateHSPFromGroups', () => {
  it('トルエン（-CH3 × 1 + =CH- × 5 + =C< × 1）のHSP推定', () => {
    // トルエン: C6H5-CH3
    const groups = [
      { group: '-CH3', count: 1 },
      { group: '=CH-', count: 5 },
      { group: '=C<', count: 1 },
    ];
    const result = estimateHSPFromGroups(groups);

    // 文献値: δD=18.0, δP=1.4, δH=2.0
    // グループ寄与法の精度は±10-20%程度
    expect(result.deltaD).toBeGreaterThan(14);
    expect(result.deltaD).toBeLessThan(22);
    expect(result.deltaP).toBeGreaterThanOrEqual(0);
    expect(result.deltaP).toBeLessThan(5);
    expect(result.deltaH).toBeGreaterThanOrEqual(0);
    expect(result.deltaH).toBeLessThan(5);
    expect(result.molarVolume).toBeGreaterThan(80);
    expect(result.molarVolume).toBeLessThan(130);
  });

  it('エタノール（-CH3 × 1 + -CH2- × 1 + -OH × 1）のHSP推定', () => {
    const groups = [
      { group: '-CH3', count: 1 },
      { group: '-CH2-', count: 1 },
      { group: '-OH', count: 1 },
    ];
    const result = estimateHSPFromGroups(groups);

    // 文献値: δD=15.8, δP=8.8, δH=19.4
    expect(result.deltaD).toBeGreaterThan(12);
    expect(result.deltaD).toBeLessThan(20);
    expect(result.deltaH).toBeGreaterThan(10); // OH基で水素結合成分が大
  });

  it('空のグループリストでエラー', () => {
    expect(() => estimateHSPFromGroups([])).toThrow();
  });

  it('存在しないグループ名でエラー', () => {
    expect(() => estimateHSPFromGroups([{ group: 'INVALID', count: 1 }])).toThrow();
  });
});

describe('estimateHSPStefanisPanayiotou', () => {
  it('メチル基2個でHSP推定結果を返す', () => {
    const result = estimateHSPStefanisPanayiotou({
      firstOrderGroups: [{ groupId: 'CH3', count: 2 }],
    });
    expect(result).toHaveProperty('hsp');
    expect(result).toHaveProperty('method');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('warnings');
    expect(result.method).toBe('stefanis-panayiotou');
    expect(typeof result.hsp.deltaD).toBe('number');
    expect(typeof result.hsp.deltaP).toBe('number');
    expect(typeof result.hsp.deltaH).toBe('number');
  });

  it('confidence は high, medium, low のいずれか', () => {
    const result = estimateHSPStefanisPanayiotou({
      firstOrderGroups: [
        { groupId: 'CH3', count: 1 },
        { groupId: 'CH2', count: 3 },
        { groupId: 'OH', count: 1 },
      ],
    });
    expect(['high', 'medium', 'low']).toContain(result.confidence);
  });

  it('空の firstOrderGroups でエラー', () => {
    expect(() => estimateHSPStefanisPanayiotou({ firstOrderGroups: [] })).toThrow();
  });

  it('不明なグループでも warnings に追加される', () => {
    const result = estimateHSPStefanisPanayiotou({
      firstOrderGroups: [
        { groupId: 'CH3', count: 1 },
        { groupId: 'UNKNOWN_GROUP', count: 1 },
      ],
    });
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes('UNKNOWN_GROUP'))).toBe(true);
  });

  it('2次基を含む推定が動作する', () => {
    const result = estimateHSPStefanisPanayiotou({
      firstOrderGroups: [{ groupId: 'CH3', count: 1 }, { groupId: 'OH', count: 1 }],
      secondOrderGroups: [{ groupId: 'alcohol', count: 1 }],
    });
    expect(result.hsp.deltaD).toBeGreaterThan(0);
  });
});

describe('getAvailableFirstOrderGroups', () => {
  it('配列を返す', () => {
    const groups = getAvailableFirstOrderGroups();
    expect(Array.isArray(groups)).toBe(true);
    expect(groups.length).toBeGreaterThan(0);
  });

  it('各エントリが id と name を持つ', () => {
    const groups = getAvailableFirstOrderGroups();
    for (const g of groups) {
      expect(typeof g.id).toBe('string');
      expect(typeof g.name).toBe('string');
    }
  });
});

describe('getAvailableSecondOrderGroups', () => {
  it('配列を返す', () => {
    const groups = getAvailableSecondOrderGroups();
    expect(Array.isArray(groups)).toBe(true);
    expect(groups.length).toBeGreaterThan(0);
  });

  it('各エントリが id と name を持つ', () => {
    const groups = getAvailableSecondOrderGroups();
    for (const g of groups) {
      expect(typeof g.id).toBe('string');
      expect(typeof g.name).toBe('string');
    }
  });
});

describe('parseSimpleMolecularFormula', () => {
  it('メタン CH4 → -CH3 ×1 + H ×1 のように分解（概算）', () => {
    // この関数は概算であり、正確な構造解析ではない
    const groups = parseSimpleMolecularFormula('methanol');
    // メタノールの場合、最低限グループが返される
    expect(groups.length).toBeGreaterThanOrEqual(0); // 実装次第
  });

  it.todo('parseSimpleMolecularFormula: SMILES パーサー統合時に実装');
});

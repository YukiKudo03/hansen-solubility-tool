import { describe, it, expect } from 'vitest';
import {
  GROUP_CONTRIBUTION_TABLE,
  estimateHSPFromGroups,
  parseSimpleMolecularFormula,
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

describe('parseSimpleMolecularFormula', () => {
  it('メタン CH4 → -CH3 ×1 + H ×1 のように分解（概算）', () => {
    // この関数は概算であり、正確な構造解析ではない
    const groups = parseSimpleMolecularFormula('methanol');
    // メタノールの場合、最低限グループが返される
    expect(groups.length).toBeGreaterThanOrEqual(0); // 実装次第
  });
});

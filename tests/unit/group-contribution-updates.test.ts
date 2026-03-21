import { describe, it, expect } from 'vitest';
import {
  getAvailableFirstOrderGroupsExtended,
  getAvailableSecondOrderGroupsExtended,
  estimateHSPExtended,
} from '../../src/core/group-contribution-updates';
import type { GroupContributionInput } from '../../src/core/group-contribution';

describe('getAvailableFirstOrderGroupsExtended', () => {
  it('カテゴリ付きの1次基グループリストを返す', () => {
    const groups = getAvailableFirstOrderGroupsExtended();
    expect(groups.length).toBeGreaterThan(0);
    for (const g of groups) {
      expect(g.groupId).toBeDefined();
      expect(g.name).toBeDefined();
      expect(g.nameEn).toBeDefined();
      expect(['hydrocarbon', 'oxygen', 'nitrogen', 'halogen', 'sulfur', 'ring', 'other']).toContain(g.category);
    }
  });
});

describe('getAvailableSecondOrderGroupsExtended', () => {
  it('カテゴリ付きの2次基グループリストを返す', () => {
    const groups = getAvailableSecondOrderGroupsExtended();
    expect(groups.length).toBeGreaterThanOrEqual(0);
    for (const g of groups) {
      expect(g.groupId).toBeDefined();
      expect(g.name).toBeDefined();
    }
  });
});

describe('estimateHSPExtended', () => {
  it('Toluene相当の族寄与でHSPを推算', () => {
    // CH3 x1, ACH x5 (5個の芳香族CH), AC x1 (芳香環接続C)
    const firstOrderGroups = getAvailableFirstOrderGroupsExtended();
    const hasCH3 = firstOrderGroups.some(g => g.groupId === 'CH3');
    const hasACH = firstOrderGroups.some(g => g.groupId === 'ACH');

    if (hasCH3 && hasACH) {
      const input: GroupContributionInput = {
        firstOrderGroups: [
          { groupId: 'CH3', count: 1 },
          { groupId: 'ACH', count: 5 },
        ],
      };
      const result = estimateHSPExtended(input);
      expect(result.hsp.deltaD).toBeGreaterThan(0);
      expect(result.hsp.deltaP).toBeGreaterThanOrEqual(0);
      expect(result.hsp.deltaH).toBeGreaterThanOrEqual(0);
      expect(result.method).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.evaluatedAt).toBeInstanceOf(Date);
      expect(result.inputGroups.length).toBeGreaterThan(0);
    }
  });

  it('結果にinputGroups情報が含まれる', () => {
    const firstOrderGroups = getAvailableFirstOrderGroupsExtended();
    if (firstOrderGroups.length > 0) {
      const input: GroupContributionInput = {
        firstOrderGroups: [{ groupId: firstOrderGroups[0].groupId, count: 2 }],
      };
      const result = estimateHSPExtended(input);
      expect(result.inputGroups).toBeDefined();
      expect(result.inputGroups.length).toBeGreaterThan(0);
      expect(result.inputGroups[0].count).toBe(2);
    }
  });

  it('空の1次基グループでエラー', () => {
    expect(() => estimateHSPExtended({
      firstOrderGroups: [],
    })).toThrow();
  });
});

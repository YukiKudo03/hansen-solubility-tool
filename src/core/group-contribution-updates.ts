/**
 * 族寄与法(拡張) — 既存のStefanis-Panayiotou法のUIラッパー
 *
 * 既存のgroup-contribution.tsモジュールを利用し、
 * 追加の断片定義とUI向けのラッパー関数を提供する。
 *
 * 機能:
 * 1. 利用可能な基グループ一覧の取得
 * 2. 選択された基グループからHSPを推算
 * 3. 推算結果のフォーマット
 */

import type { HSPValues } from './types';
import {
  estimateHSPStefanisPanayiotou,
  getAvailableFirstOrderGroups,
  getAvailableSecondOrderGroups,
} from './group-contribution';
import type { GroupCount, GroupContributionInput, GroupContributionResult } from './group-contribution';

/** 拡張グループ定義 */
export interface ExtendedGroupDefinition {
  groupId: string;
  name: string;
  nameEn: string;
  category: 'hydrocarbon' | 'oxygen' | 'nitrogen' | 'halogen' | 'sulfur' | 'ring' | 'other';
}

/** 拡張族寄与法結果 */
export interface ExtendedGroupContributionResult {
  hsp: HSPValues;
  method: string;
  confidence: string;
  warnings: string[];
  inputGroups: { groupId: string; name: string; count: number }[];
  evaluatedAt: Date;
}

/**
 * 利用可能な1次基グループを取得する（カテゴリ付き）
 */
export function getAvailableFirstOrderGroupsExtended(): ExtendedGroupDefinition[] {
  const rawGroups = getAvailableFirstOrderGroups();
  return rawGroups.map((g) => ({
    groupId: g.id,
    name: g.name,
    nameEn: g.name,
    category: categorizeGroup(g.id),
  }));
}

/**
 * 利用可能な2次基グループを取得する（カテゴリ付き）
 */
export function getAvailableSecondOrderGroupsExtended(): ExtendedGroupDefinition[] {
  const rawGroups = getAvailableSecondOrderGroups();
  return rawGroups.map((g) => ({
    groupId: g.id,
    name: g.name,
    nameEn: g.name,
    category: categorizeGroup(g.id),
  }));
}

/**
 * グループIDからカテゴリを推定する
 */
function categorizeGroup(groupId: string): ExtendedGroupDefinition['category'] {
  const id = groupId.toLowerCase();
  if (id.includes('ch3') || id.includes('ch2') || id.includes('ch=') || id.includes('c=c') || id.includes('ach')) return 'hydrocarbon';
  if (id.includes('oh') || id.includes('o') || id.includes('cooh') || id.includes('coo') || id.includes('ether')) return 'oxygen';
  if (id.includes('nh') || id.includes('n') || id.includes('cn') || id.includes('no2')) return 'nitrogen';
  if (id.includes('cl') || id.includes('br') || id.includes('f')) return 'halogen';
  if (id.includes('sh') || id.includes('s')) return 'sulfur';
  if (id.includes('ring') || id.includes('cyclo')) return 'ring';
  return 'other';
}

/**
 * 拡張族寄与法によるHSP推算
 *
 * @param input - 基グループの選択
 * @returns 拡張結果
 */
export function estimateHSPExtended(input: GroupContributionInput): ExtendedGroupContributionResult {
  // 既存のStefanis-Panayiotou法を呼び出し
  const result: GroupContributionResult = estimateHSPStefanisPanayiotou(input);

  // 1次基の名前取得
  const firstOrderGroups = getAvailableFirstOrderGroups();
  const secondOrderGroups = getAvailableSecondOrderGroups();

  const inputGroupsInfo = input.firstOrderGroups.map((g) => {
    const groupDef = firstOrderGroups.find((fg) => fg.id === g.groupId);
    return {
      groupId: g.groupId,
      name: groupDef?.name ?? g.groupId,
      count: g.count,
    };
  });

  if (input.secondOrderGroups) {
    for (const g of input.secondOrderGroups) {
      const groupDef = secondOrderGroups.find((sg) => sg.id === g.groupId);
      inputGroupsInfo.push({
        groupId: g.groupId,
        name: groupDef?.name ?? `2nd:${g.groupId}`,
        count: g.count,
      });
    }
  }

  return {
    hsp: result.hsp,
    method: result.method,
    confidence: result.confidence,
    warnings: result.warnings,
    inputGroups: inputGroupsInfo,
    evaluatedAt: new Date(),
  };
}

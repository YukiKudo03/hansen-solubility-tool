/**
 * テストデータファクトリ
 */
import { RiskLevel } from '../../src/core/types';
import type { Part, PartsGroup, Solvent, GroupEvaluationResult, PartEvaluationResult, RiskThresholds } from '../../src/core/types';

let idCounter = 0;
function nextId() { return ++idCounter; }

export function resetIdCounter() { idCounter = 0; }

export function buildPart(overrides: Partial<Part> = {}): Part {
  const id = nextId();
  return {
    id,
    groupId: 1,
    name: `テスト部品${id}`,
    materialType: 'PS',
    hsp: { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 },
    r0: 5.3,
    notes: null,
    ...overrides,
  };
}

export function buildSolvent(overrides: Partial<Solvent> = {}): Solvent {
  const id = nextId();
  return {
    id,
    name: `テスト溶媒${id}`,
    nameEn: `TestSolvent${id}`,
    casNumber: '108-88-3',
    hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
    molarVolume: 106.2,
    molWeight: 92.14,
    boilingPoint: 110.6,
    viscosity: 0.56,
    specificGravity: 0.867,
    surfaceTension: 28.4,
    notes: null,
    ...overrides,
  };
}

export function buildPartsGroup(overrides: Partial<PartsGroup> = {}): PartsGroup {
  const id = nextId();
  return {
    id,
    name: `テストグループ${id}`,
    description: 'テスト用グループ',
    parts: overrides.parts ?? [buildPart({ groupId: id }), buildPart({ groupId: id })],
    ...overrides,
  };
}

export function buildPartEvaluationResult(overrides: Partial<PartEvaluationResult> = {}): PartEvaluationResult {
  return {
    part: buildPart(),
    solvent: buildSolvent(),
    ra: 3.380,
    red: 0.638,
    riskLevel: RiskLevel.Warning,
    ...overrides,
  };
}

export function buildGroupEvaluationResult(overrides: Partial<GroupEvaluationResult> = {}): GroupEvaluationResult {
  const group = buildPartsGroup();
  const solvent = buildSolvent();
  return {
    partsGroup: group,
    solvent,
    results: group.parts.map((part) => ({
      part,
      solvent,
      ra: 3.380,
      red: 0.638,
      riskLevel: RiskLevel.Warning,
    })),
    evaluatedAt: new Date('2026-03-15T10:00:00Z'),
    thresholdsUsed: { dangerousMax: 0.5, warningMax: 0.8, cautionMax: 1.2, holdMax: 2.0 },
    ...overrides,
  };
}

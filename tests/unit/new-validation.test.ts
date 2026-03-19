import { describe, it, expect } from 'vitest';
import {
  validateAdhesionThresholds,
  validateSolventClassifications,
  validateGreenSolventInput,
  validateMultiObjectiveInput,
  validateGroupContributionInput,
} from '../../src/core/validation';

describe('validateAdhesionThresholds', () => {
  it('正常な閾値で null を返す', () => {
    expect(validateAdhesionThresholds({ excellentMax: 2, goodMax: 4, fairMax: 6, poorMax: 8 })).toBeNull();
  });

  it('null 入力でエラー', () => {
    expect(validateAdhesionThresholds(null)).not.toBeNull();
  });

  it('undefined 入力でエラー', () => {
    expect(validateAdhesionThresholds(undefined)).not.toBeNull();
  });

  it('文字列入力でエラー', () => {
    expect(validateAdhesionThresholds('not an object')).not.toBeNull();
  });

  it('キーが欠けているとエラー', () => {
    expect(validateAdhesionThresholds({ excellentMax: 2, goodMax: 4, fairMax: 6 })).not.toBeNull();
  });

  it('負の値でエラー', () => {
    expect(validateAdhesionThresholds({ excellentMax: -1, goodMax: 4, fairMax: 6, poorMax: 8 })).not.toBeNull();
  });

  it('NaN 値でエラー', () => {
    expect(validateAdhesionThresholds({ excellentMax: NaN, goodMax: 4, fairMax: 6, poorMax: 8 })).not.toBeNull();
  });

  it('Infinity 値でエラー', () => {
    expect(validateAdhesionThresholds({ excellentMax: Infinity, goodMax: 4, fairMax: 6, poorMax: 8 })).not.toBeNull();
  });

  it('順序が不正でエラー', () => {
    expect(validateAdhesionThresholds({ excellentMax: 5, goodMax: 4, fairMax: 6, poorMax: 8 })).not.toBeNull();
  });

  it('同値でエラー', () => {
    expect(validateAdhesionThresholds({ excellentMax: 4, goodMax: 4, fairMax: 6, poorMax: 8 })).not.toBeNull();
  });
});

describe('validateSolventClassifications', () => {
  it('正常な分類で null を返す', () => {
    expect(validateSolventClassifications([
      { solventId: 1, isGood: true },
      { solventId: 2, isGood: false },
    ])).toBeNull();
  });

  it('配列でない場合エラー', () => {
    expect(validateSolventClassifications('not array')).not.toBeNull();
  });

  it('空配列でエラー', () => {
    expect(validateSolventClassifications([])).not.toBeNull();
  });

  it('良溶媒がないとエラー', () => {
    expect(validateSolventClassifications([
      { solventId: 1, isGood: false },
      { solventId: 2, isGood: false },
    ])).not.toBeNull();
  });

  it('貧溶媒がないとエラー', () => {
    expect(validateSolventClassifications([
      { solventId: 1, isGood: true },
      { solventId: 2, isGood: true },
    ])).not.toBeNull();
  });

  it('solventId が0でエラー', () => {
    expect(validateSolventClassifications([
      { solventId: 0, isGood: true },
      { solventId: 2, isGood: false },
    ])).not.toBeNull();
  });

  it('solventId が負でエラー', () => {
    expect(validateSolventClassifications([
      { solventId: -1, isGood: true },
      { solventId: 2, isGood: false },
    ])).not.toBeNull();
  });

  it('solventId が小数でエラー', () => {
    expect(validateSolventClassifications([
      { solventId: 1.5, isGood: true },
      { solventId: 2, isGood: false },
    ])).not.toBeNull();
  });

  it('isGood がブーリアンでないとエラー', () => {
    expect(validateSolventClassifications([
      { solventId: 1, isGood: 'yes' },
      { solventId: 2, isGood: false },
    ])).not.toBeNull();
  });
});

describe('validateGreenSolventInput', () => {
  it('正常な入力で null を返す', () => {
    expect(validateGreenSolventInput(1)).toBeNull();
  });

  it('maxResults 指定時に null を返す', () => {
    expect(validateGreenSolventInput(1, 10)).toBeNull();
  });

  it('targetSolventId が0でエラー', () => {
    expect(validateGreenSolventInput(0)).not.toBeNull();
  });

  it('targetSolventId が文字列でエラー', () => {
    expect(validateGreenSolventInput('1')).not.toBeNull();
  });

  it('maxResults が0でエラー', () => {
    expect(validateGreenSolventInput(1, 0)).not.toBeNull();
  });

  it('maxResults が小数でエラー', () => {
    expect(validateGreenSolventInput(1, 1.5)).not.toBeNull();
  });
});

describe('validateMultiObjectiveInput', () => {
  it('正常な入力で null を返す', () => {
    expect(validateMultiObjectiveInput({
      targetDeltaD: 18, targetDeltaP: 10, targetDeltaH: 12, r0: 8,
    })).toBeNull();
  });

  it('null でエラー', () => {
    expect(validateMultiObjectiveInput(null)).not.toBeNull();
  });

  it('targetDeltaD が欠けているとエラー', () => {
    expect(validateMultiObjectiveInput({
      targetDeltaP: 10, targetDeltaH: 12, r0: 8,
    })).not.toBeNull();
  });

  it('r0 が0でエラー', () => {
    expect(validateMultiObjectiveInput({
      targetDeltaD: 18, targetDeltaP: 10, targetDeltaH: 12, r0: 0,
    })).not.toBeNull();
  });

  it('r0 が負でエラー', () => {
    expect(validateMultiObjectiveInput({
      targetDeltaD: 18, targetDeltaP: 10, targetDeltaH: 12, r0: -5,
    })).not.toBeNull();
  });
});

describe('validateGroupContributionInput', () => {
  it('正常な入力で null を返す', () => {
    expect(validateGroupContributionInput({
      firstOrderGroups: [{ groupId: 'CH3', count: 2 }],
    })).toBeNull();
  });

  it('secondOrderGroups ありで null を返す', () => {
    expect(validateGroupContributionInput({
      firstOrderGroups: [{ groupId: 'CH3', count: 2 }],
      secondOrderGroups: [{ groupId: 'alcohol', count: 1 }],
    })).toBeNull();
  });

  it('null でエラー', () => {
    expect(validateGroupContributionInput(null)).not.toBeNull();
  });

  it('firstOrderGroups が配列でないとエラー', () => {
    expect(validateGroupContributionInput({ firstOrderGroups: 'not array' })).not.toBeNull();
  });

  it('firstOrderGroups が空でエラー', () => {
    expect(validateGroupContributionInput({ firstOrderGroups: [] })).not.toBeNull();
  });

  it('groupId が空文字列でエラー', () => {
    expect(validateGroupContributionInput({
      firstOrderGroups: [{ groupId: '', count: 1 }],
    })).not.toBeNull();
  });

  it('count が0でエラー', () => {
    expect(validateGroupContributionInput({
      firstOrderGroups: [{ groupId: 'CH3', count: 0 }],
    })).not.toBeNull();
  });

  it('count が小数でエラー', () => {
    expect(validateGroupContributionInput({
      firstOrderGroups: [{ groupId: 'CH3', count: 1.5 }],
    })).not.toBeNull();
  });

  it('secondOrderGroups が配列でないとエラー', () => {
    expect(validateGroupContributionInput({
      firstOrderGroups: [{ groupId: 'CH3', count: 1 }],
      secondOrderGroups: 'not array',
    })).not.toBeNull();
  });
});

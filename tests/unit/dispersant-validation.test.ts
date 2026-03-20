/**
 * 分散剤選定支援 バリデーション テスト (TDD: テストファースト)
 */
import { describe, it, expect } from 'vitest';
import {
  validateDispersantInput,
  validateDispersantThresholds,
} from '../../src/core/validation';

describe('validateDispersantInput', () => {
  const validInput = {
    name: 'BYK-163',
    dispersantType: 'polymeric' as const,
    anchorDeltaD: 17.0, anchorDeltaP: 8.0, anchorDeltaH: 11.0, anchorR0: 6.0,
    solvationDeltaD: 18.0, solvationDeltaP: 12.0, solvationDeltaH: 7.0, solvationR0: 8.0,
    overallDeltaD: 17.5, overallDeltaP: 10.0, overallDeltaH: 9.0,
  };

  it('有効な入力でnullを返す', () => {
    expect(validateDispersantInput(validInput)).toBeNull();
  });

  it('名前が空でエラー', () => {
    expect(validateDispersantInput({ ...validInput, name: '' })).toBeTruthy();
  });

  it('無効な分散剤タイプでエラー', () => {
    expect(validateDispersantInput({ ...validInput, dispersantType: 'invalid' as any })).toBeTruthy();
  });

  it('アンカー基HSPが負でエラー', () => {
    expect(validateDispersantInput({ ...validInput, anchorDeltaD: -1 })).toBeTruthy();
  });

  it('溶媒和鎖HSPが負でエラー', () => {
    expect(validateDispersantInput({ ...validInput, solvationDeltaP: -1 })).toBeTruthy();
  });

  it('全体HSPが負でエラー', () => {
    expect(validateDispersantInput({ ...validInput, overallDeltaH: -1 })).toBeTruthy();
  });

  it('アンカーR0が0以下でエラー', () => {
    expect(validateDispersantInput({ ...validInput, anchorR0: 0 })).toBeTruthy();
  });

  it('溶媒和鎖R0が0以下でエラー', () => {
    expect(validateDispersantInput({ ...validInput, solvationR0: -1 })).toBeTruthy();
  });

  it('任意項目（hlb, molWeight）は省略可能', () => {
    expect(validateDispersantInput({ ...validInput, hlb: undefined, molWeight: undefined })).toBeNull();
  });

  it('hlbが負でエラー', () => {
    expect(validateDispersantInput({ ...validInput, hlb: -1 })).toBeTruthy();
  });

  it('molWeightが0以下でエラー', () => {
    expect(validateDispersantInput({ ...validInput, molWeight: 0 })).toBeTruthy();
  });
});

describe('validateDispersantThresholds', () => {
  it('有効な閾値でnullを返す', () => {
    expect(validateDispersantThresholds({
      excellentMax: 0.5, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5,
    })).toBeNull();
  });

  it('昇順でない場合エラー', () => {
    expect(validateDispersantThresholds({
      excellentMax: 0.8, goodMax: 0.5, fairMax: 1.0, poorMax: 1.5,
    })).toBeTruthy();
  });

  it('負の値でエラー', () => {
    expect(validateDispersantThresholds({
      excellentMax: -0.1, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5,
    })).toBeTruthy();
  });

  it('NaNでエラー', () => {
    expect(validateDispersantThresholds({
      excellentMax: NaN, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5,
    })).toBeTruthy();
  });
});

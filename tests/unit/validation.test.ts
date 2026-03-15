import { describe, it, expect } from 'vitest';
import {
  validateHSPValues,
  validateR0,
  validateThresholds,
  validateName,
  validateCasNumber,
  validatePartInput,
  validateSolventInput,
} from '../../src/core/validation';

describe('validateHSPValues', () => {
  it('有効なHSP値', () => {
    expect(validateHSPValues(18.5, 4.5, 2.9)).toBeNull();
  });

  it('ゼロは有効', () => {
    expect(validateHSPValues(0, 0, 0)).toBeNull();
  });

  it('負のδDでエラー', () => {
    expect(validateHSPValues(-1, 4.5, 2.9)).toBe('δDは0以上の数値を入力してください');
  });

  it('負のδPでエラー', () => {
    expect(validateHSPValues(18.5, -1, 2.9)).toBe('δPは0以上の数値を入力してください');
  });

  it('負のδHでエラー', () => {
    expect(validateHSPValues(18.5, 4.5, -1)).toBe('δHは0以上の数値を入力してください');
  });

  it('NaNでエラー', () => {
    expect(validateHSPValues(NaN, 4.5, 2.9)).toBe('δDは0以上の数値を入力してください');
  });
});

describe('validateR0', () => {
  it('正の値は有効', () => {
    expect(validateR0(5.3)).toBeNull();
  });

  it('ゼロでエラー', () => {
    expect(validateR0(0)).toBe('R₀は正の数値を入力してください');
  });

  it('負の値でエラー', () => {
    expect(validateR0(-1)).toBe('R₀は正の数値を入力してください');
  });

  it('NaNでエラー', () => {
    expect(validateR0(NaN)).toBe('R₀は正の数値を入力してください');
  });
});

describe('validateThresholds', () => {
  it('有効な閾値（昇順）', () => {
    expect(validateThresholds({ dangerousMax: 0.5, warningMax: 0.8, cautionMax: 1.2, holdMax: 2.0 })).toBeNull();
  });

  it('dangerousMax >= warningMax でエラー', () => {
    expect(validateThresholds({ dangerousMax: 0.8, warningMax: 0.8, cautionMax: 1.2, holdMax: 2.0 }))
      .toBe('閾値は dangerousMax < warningMax < cautionMax < holdMax の順でなければなりません');
  });

  it('逆順でエラー', () => {
    expect(validateThresholds({ dangerousMax: 2.0, warningMax: 1.2, cautionMax: 0.8, holdMax: 0.5 }))
      .toBe('閾値は dangerousMax < warningMax < cautionMax < holdMax の順でなければなりません');
  });

  it('負の値でエラー', () => {
    expect(validateThresholds({ dangerousMax: -0.1, warningMax: 0.8, cautionMax: 1.2, holdMax: 2.0 }))
      .toBe('閾値はすべて0以上の数値を入力してください');
  });
});

describe('validateName', () => {
  it('有効な名前', () => {
    expect(validateName('テスト')).toBeNull();
  });

  it('空文字でエラー', () => {
    expect(validateName('')).toBe('名前を入力してください');
  });

  it('空白のみでエラー', () => {
    expect(validateName('   ')).toBe('名前を入力してください');
  });
});

describe('validateCasNumber', () => {
  it('有効なCAS番号', () => {
    expect(validateCasNumber('108-88-3')).toBeNull();
  });

  it('空文字は有効（任意フィールド）', () => {
    expect(validateCasNumber('')).toBeNull();
  });

  it('undefinedは有効', () => {
    expect(validateCasNumber(undefined)).toBeNull();
  });

  it('不正な形式でエラー', () => {
    expect(validateCasNumber('invalid')).toBe('CAS番号の形式が不正です（例: 108-88-3）');
  });

  it('数字だけでエラー', () => {
    expect(validateCasNumber('12345')).toBe('CAS番号の形式が不正です（例: 108-88-3）');
  });
});

describe('validatePartInput', () => {
  it('有効な入力', () => {
    expect(validatePartInput({ name: 'PS', deltaD: 18.5, deltaP: 4.5, deltaH: 2.9, r0: 5.3 })).toBeNull();
  });

  it('名前が空でエラー', () => {
    expect(validatePartInput({ name: '', deltaD: 18.5, deltaP: 4.5, deltaH: 2.9, r0: 5.3 }))
      .toBe('名前を入力してください');
  });

  it('HSP値が不正でエラー', () => {
    expect(validatePartInput({ name: 'PS', deltaD: -1, deltaP: 4.5, deltaH: 2.9, r0: 5.3 }))
      .toBe('δDは0以上の数値を入力してください');
  });

  it('R0が不正でエラー', () => {
    expect(validatePartInput({ name: 'PS', deltaD: 18.5, deltaP: 4.5, deltaH: 2.9, r0: 0 }))
      .toBe('R₀は正の数値を入力してください');
  });
});

describe('validateSolventInput', () => {
  it('有効な入力', () => {
    expect(validateSolventInput({ name: 'トルエン', deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 })).toBeNull();
  });

  it('名前が空でエラー', () => {
    expect(validateSolventInput({ name: '', deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 }))
      .toBe('名前を入力してください');
  });

  it('CAS番号が不正でエラー', () => {
    expect(validateSolventInput({ name: 'X', deltaD: 18.0, deltaP: 1.4, deltaH: 2.0, casNumber: 'bad' }))
      .toBe('CAS番号の形式が不正です（例: 108-88-3）');
  });
});

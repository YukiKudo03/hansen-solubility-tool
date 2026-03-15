import { describe, it, expect } from 'vitest';
import {
  validateHSPValues,
  validateR0,
  validateThresholds,
  validateName,
  validateCasNumber,
  validatePartInput,
  validateSolventInput,
  validatePhysicalProperties,
  validateMixtureInput,
  validateNanoParticleInput,
  validateDispersibilityThresholds,
  validateWettabilityThresholds,
  validateSwellingThresholds,
  validateDrugInput,
  validateDrugSolubilityThresholds,
  validateChemicalResistanceThresholds,
  validatePlasticizerThresholds,
  validateCarrierThresholds,
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

  it('物性値が有効な入力', () => {
    expect(validateSolventInput({
      name: 'トルエン', deltaD: 18.0, deltaP: 1.4, deltaH: 2.0,
      boilingPoint: 110.6, viscosity: 0.56, specificGravity: 0.867, surfaceTension: 28.4,
    })).toBeNull();
  });

  it('粘度が負でエラー', () => {
    expect(validateSolventInput({
      name: 'X', deltaD: 18.0, deltaP: 1.4, deltaH: 2.0, viscosity: -1,
    })).toBe('粘度は0以上の数値を入力してください');
  });
});

describe('validatePhysicalProperties', () => {
  it('全て未指定で有効', () => {
    expect(validatePhysicalProperties({})).toBeNull();
  });

  it('有効な物性値', () => {
    expect(validatePhysicalProperties({
      boilingPoint: 110.6, viscosity: 0.56, specificGravity: 0.867, surfaceTension: 28.4,
    })).toBeNull();
  });

  it('沸点の負値は許容（ジエチルエーテル等）', () => {
    expect(validatePhysicalProperties({ boilingPoint: -34.6 })).toBeNull();
  });

  it('沸点がNaNでエラー', () => {
    expect(validatePhysicalProperties({ boilingPoint: NaN }))
      .toBe('沸点は有効な数値を入力してください');
  });

  it('粘度がゼロは許容', () => {
    expect(validatePhysicalProperties({ viscosity: 0 })).toBeNull();
  });

  it('粘度が負でエラー', () => {
    expect(validatePhysicalProperties({ viscosity: -0.1 }))
      .toBe('粘度は0以上の数値を入力してください');
  });

  it('比重がゼロでエラー', () => {
    expect(validatePhysicalProperties({ specificGravity: 0 }))
      .toBe('比重は正の数値を入力してください');
  });

  it('比重が負でエラー', () => {
    expect(validatePhysicalProperties({ specificGravity: -1 }))
      .toBe('比重は正の数値を入力してください');
  });

  it('表面張力がゼロでエラー', () => {
    expect(validatePhysicalProperties({ surfaceTension: 0 }))
      .toBe('表面張力は正の数値を入力してください');
  });

  it('表面張力が負でエラー', () => {
    expect(validatePhysicalProperties({ surfaceTension: -5 }))
      .toBe('表面張力は正の数値を入力してください');
  });
});

describe('validateMixtureInput', () => {
  it('有効な2成分入力', () => {
    expect(validateMixtureInput([
      { solventId: 1, volumeRatio: 3 },
      { solventId: 2, volumeRatio: 1 },
    ])).toBeNull();
  });

  it('成分1つでも有効', () => {
    expect(validateMixtureInput([{ solventId: 1, volumeRatio: 1 }])).toBeNull();
  });

  it('空配列でエラー', () => {
    expect(validateMixtureInput([])).toBe('1つ以上の溶媒を追加してください');
  });

  it('体積比が0でエラー', () => {
    expect(validateMixtureInput([{ solventId: 1, volumeRatio: 0 }]))
      .toBe('体積比は正の数値を入力してください');
  });

  it('体積比が負でエラー', () => {
    expect(validateMixtureInput([{ solventId: 1, volumeRatio: -1 }]))
      .toBe('体積比は正の数値を入力してください');
  });

  it('体積比がNaNでエラー', () => {
    expect(validateMixtureInput([{ solventId: 1, volumeRatio: NaN }]))
      .toBe('体積比は正の数値を入力してください');
  });
});

describe('validateNanoParticleInput', () => {
  const valid = {
    name: 'SWCNT',
    category: 'carbon',
    coreMaterial: 'SWCNT',
    deltaD: 19.4,
    deltaP: 6.0,
    deltaH: 4.5,
    r0: 5.0,
  };

  it('有効な入力', () => {
    expect(validateNanoParticleInput(valid)).toBeNull();
  });

  it('粒子径指定ありで有効', () => {
    expect(validateNanoParticleInput({ ...valid, particleSize: 10 })).toBeNull();
  });

  it('名前が空でエラー', () => {
    expect(validateNanoParticleInput({ ...valid, name: '' })).toBe('名前を入力してください');
  });

  it('母材が空でエラー', () => {
    expect(validateNanoParticleInput({ ...valid, coreMaterial: '' })).toBe('母材を入力してください');
  });

  it('無効なカテゴリでエラー', () => {
    expect(validateNanoParticleInput({ ...valid, category: 'invalid' })).toBe('無効なカテゴリです');
  });

  it('有効な全カテゴリ', () => {
    for (const cat of ['carbon', 'metal', 'metal_oxide', 'quantum_dot', 'polymer', 'other']) {
      expect(validateNanoParticleInput({ ...valid, category: cat })).toBeNull();
    }
  });

  it('HSP値が負でエラー', () => {
    expect(validateNanoParticleInput({ ...valid, deltaD: -1 })).toBe('δDは0以上の数値を入力してください');
  });

  it('R₀がゼロでエラー', () => {
    expect(validateNanoParticleInput({ ...valid, r0: 0 })).toBe('R₀は正の数値を入力してください');
  });

  it('粒子径がゼロでエラー', () => {
    expect(validateNanoParticleInput({ ...valid, particleSize: 0 })).toBe('粒子径は正の数値を入力してください');
  });

  it('粒子径が負でエラー', () => {
    expect(validateNanoParticleInput({ ...valid, particleSize: -5 })).toBe('粒子径は正の数値を入力してください');
  });

  it('粒子径未指定は有効', () => {
    expect(validateNanoParticleInput({ ...valid, particleSize: undefined })).toBeNull();
  });
});

describe('validateDispersibilityThresholds', () => {
  it('有効な閾値（昇順）', () => {
    expect(validateDispersibilityThresholds({
      excellentMax: 0.5, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5,
    })).toBeNull();
  });

  it('逆順でエラー', () => {
    expect(validateDispersibilityThresholds({
      excellentMax: 1.5, goodMax: 1.0, fairMax: 0.8, poorMax: 0.5,
    })).toBe('閾値は excellentMax < goodMax < fairMax < poorMax の順でなければなりません');
  });

  it('同値でエラー', () => {
    expect(validateDispersibilityThresholds({
      excellentMax: 0.5, goodMax: 0.5, fairMax: 1.0, poorMax: 1.5,
    })).toBe('閾値は excellentMax < goodMax < fairMax < poorMax の順でなければなりません');
  });

  it('負の値でエラー', () => {
    expect(validateDispersibilityThresholds({
      excellentMax: -0.1, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5,
    })).toBe('閾値はすべて0以上の数値を入力してください');
  });
});

describe('validateWettabilityThresholds', () => {
  it('有効な閾値（昇順）', () => {
    expect(validateWettabilityThresholds({
      superHydrophilicMax: 10, hydrophilicMax: 30, wettableMax: 60, moderateMax: 90, hydrophobicMax: 150,
    })).toBeNull();
  });

  it('逆順でエラー', () => {
    expect(validateWettabilityThresholds({
      superHydrophilicMax: 150, hydrophilicMax: 90, wettableMax: 60, moderateMax: 30, hydrophobicMax: 10,
    })).toBe('閾値は superHydrophilicMax < hydrophilicMax < wettableMax < moderateMax < hydrophobicMax の順でなければなりません');
  });

  it('同値でエラー', () => {
    expect(validateWettabilityThresholds({
      superHydrophilicMax: 10, hydrophilicMax: 10, wettableMax: 60, moderateMax: 90, hydrophobicMax: 150,
    })).toBe('閾値は superHydrophilicMax < hydrophilicMax < wettableMax < moderateMax < hydrophobicMax の順でなければなりません');
  });

  it('負の値でエラー', () => {
    expect(validateWettabilityThresholds({
      superHydrophilicMax: -5, hydrophilicMax: 30, wettableMax: 60, moderateMax: 90, hydrophobicMax: 150,
    })).toBe('閾値はすべて0以上180以下の数値を入力してください');
  });

  it('180°超でエラー', () => {
    expect(validateWettabilityThresholds({
      superHydrophilicMax: 10, hydrophilicMax: 30, wettableMax: 60, moderateMax: 90, hydrophobicMax: 200,
    })).toBe('閾値はすべて0以上180以下の数値を入力してください');
  });

  it('NaNでエラー', () => {
    expect(validateWettabilityThresholds({
      superHydrophilicMax: NaN, hydrophilicMax: 30, wettableMax: 60, moderateMax: 90, hydrophobicMax: 150,
    })).toBe('閾値はすべて0以上180以下の数値を入力してください');
  });
});

describe('validateSwellingThresholds', () => {
  it('有効な閾値でnull', () => {
    expect(validateSwellingThresholds({ severeMax: 0.5, highMax: 0.8, moderateMax: 1.0, lowMax: 1.5 })).toBeNull();
  });
  it('負の値でエラー', () => {
    expect(validateSwellingThresholds({ severeMax: -0.1, highMax: 0.8, moderateMax: 1.0, lowMax: 1.5 })).toBeTruthy();
  });
  it('順序が不正でエラー', () => {
    expect(validateSwellingThresholds({ severeMax: 0.5, highMax: 0.3, moderateMax: 1.0, lowMax: 1.5 })).toBeTruthy();
  });
  it('NaNでエラー', () => {
    expect(validateSwellingThresholds({ severeMax: NaN, highMax: 0.8, moderateMax: 1.0, lowMax: 1.5 })).toBeTruthy();
  });
});

describe('validateDrugInput', () => {
  it('有効な入力でnull', () => {
    expect(validateDrugInput({ name: 'Acetaminophen', deltaD: 17.2, deltaP: 9.4, deltaH: 13.3, r0: 5.0 })).toBeNull();
  });
  it('名前が空でエラー', () => {
    expect(validateDrugInput({ name: '', deltaD: 17.2, deltaP: 9.4, deltaH: 13.3, r0: 5.0 })).toBeTruthy();
  });
  it('負のHSP値でエラー', () => {
    expect(validateDrugInput({ name: 'Test', deltaD: -1, deltaP: 9.4, deltaH: 13.3, r0: 5.0 })).toBeTruthy();
  });
  it('R0=0でエラー', () => {
    expect(validateDrugInput({ name: 'Test', deltaD: 17.2, deltaP: 9.4, deltaH: 13.3, r0: 0 })).toBeTruthy();
  });
  it('CAS番号フォーマット不正でエラー', () => {
    expect(validateDrugInput({ name: 'Test', deltaD: 17.2, deltaP: 9.4, deltaH: 13.3, r0: 5.0, casNumber: 'invalid' })).toBeTruthy();
  });
  it('CAS番号が空文字でも有効', () => {
    expect(validateDrugInput({ name: 'Test', deltaD: 17.2, deltaP: 9.4, deltaH: 13.3, r0: 5.0, casNumber: '' })).toBeNull();
  });
});

describe('validateDrugSolubilityThresholds', () => {
  it('有効な閾値でnull', () => {
    expect(validateDrugSolubilityThresholds({ excellentMax: 0.5, goodMax: 0.8, partialMax: 1.0, poorMax: 1.5 })).toBeNull();
  });
  it('負の値でエラー', () => {
    expect(validateDrugSolubilityThresholds({ excellentMax: -0.1, goodMax: 0.8, partialMax: 1.0, poorMax: 1.5 })).toBeTruthy();
  });
  it('順序が不正でエラー', () => {
    expect(validateDrugSolubilityThresholds({ excellentMax: 0.5, goodMax: 0.3, partialMax: 1.0, poorMax: 1.5 })).toBeTruthy();
  });
});

describe('validateChemicalResistanceThresholds', () => {
  it('有効な閾値でnull', () => {
    expect(validateChemicalResistanceThresholds({ noResistanceMax: 0.5, poorMax: 0.8, moderateMax: 1.2, goodMax: 2.0 })).toBeNull();
  });
  it('負の値でエラー', () => {
    expect(validateChemicalResistanceThresholds({ noResistanceMax: -0.1, poorMax: 0.8, moderateMax: 1.2, goodMax: 2.0 })).toBeTruthy();
  });
  it('順序が不正でエラー', () => {
    expect(validateChemicalResistanceThresholds({ noResistanceMax: 0.5, poorMax: 0.3, moderateMax: 1.2, goodMax: 2.0 })).toBeTruthy();
  });
});

describe('validatePlasticizerThresholds', () => {
  it('有効な閾値でnull', () => {
    expect(validatePlasticizerThresholds({ excellentMax: 0.5, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5 })).toBeNull();
  });
  it('負の値でエラー', () => {
    expect(validatePlasticizerThresholds({ excellentMax: -0.1, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5 })).toBeTruthy();
  });
  it('順序が不正でエラー', () => {
    expect(validatePlasticizerThresholds({ excellentMax: 0.5, goodMax: 0.3, fairMax: 1.0, poorMax: 1.5 })).toBeTruthy();
  });
});

describe('validateCarrierThresholds', () => {
  it('有効な閾値でnull', () => {
    expect(validateCarrierThresholds({ excellentMax: 0.5, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5 })).toBeNull();
  });
  it('負の値でエラー', () => {
    expect(validateCarrierThresholds({ excellentMax: -0.1, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5 })).toBeTruthy();
  });
  it('順序が不正でエラー', () => {
    expect(validateCarrierThresholds({ excellentMax: 0.5, goodMax: 0.3, fairMax: 1.0, poorMax: 1.5 })).toBeTruthy();
  });
});

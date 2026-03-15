import { describe, it, expect } from 'vitest';
import {
  calculateVolumeFractions,
  mixHSP,
  mixMolarVolume,
  mixMolWeight,
  mixViscosity,
  mixByVolumeAverage,
  calculateMixture,
  generateCompositionNote,
} from '../../src/core/mixture';
import type { MixtureComponent } from '../../src/core/types';

/** トルエン */
function toluene(): MixtureComponent {
  return {
    solvent: {
      id: 1, name: 'トルエン', nameEn: 'Toluene', casNumber: '108-88-3',
      hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
      molarVolume: 106.8, molWeight: 92.14,
      boilingPoint: 110.6, viscosity: 0.56, specificGravity: 0.867, surfaceTension: 28.4,
      notes: null,
    },
    volumeRatio: 3,
  };
}

/** エタノール */
function ethanol(): MixtureComponent {
  return {
    solvent: {
      id: 2, name: 'エタノール', nameEn: 'Ethanol', casNumber: '64-17-5',
      hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 },
      molarVolume: 58.5, molWeight: 46.07,
      boilingPoint: 78.4, viscosity: 1.07, specificGravity: 0.789, surfaceTension: 22.1,
      notes: null,
    },
    volumeRatio: 1,
  };
}

/** アセトン */
function acetone(): MixtureComponent {
  return {
    solvent: {
      id: 3, name: 'アセトン', nameEn: 'Acetone', casNumber: '67-64-1',
      hsp: { deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 },
      molarVolume: 74.0, molWeight: 58.08,
      boilingPoint: 56.1, viscosity: 0.31, specificGravity: 0.784, surfaceTension: 23.0,
      notes: null,
    },
    volumeRatio: 2,
  };
}

/** 物性nullの溶媒 */
function nullPropsSolvent(): MixtureComponent {
  return {
    solvent: {
      id: 4, name: 'テスト溶媒', nameEn: null, casNumber: null,
      hsp: { deltaD: 16.0, deltaP: 5.0, deltaH: 10.0 },
      molarVolume: null, molWeight: null,
      boilingPoint: null, viscosity: null, specificGravity: null, surfaceTension: null,
      notes: null,
    },
    volumeRatio: 1,
  };
}

describe('calculateVolumeFractions', () => {
  it('2成分の体積分率を計算', () => {
    const fractions = calculateVolumeFractions([toluene(), ethanol()]);
    expect(fractions[0]).toBeCloseTo(0.75, 10);
    expect(fractions[1]).toBeCloseTo(0.25, 10);
  });

  it('3成分の体積分率（1:2:3）', () => {
    const t = toluene(); t.volumeRatio = 1;
    const e = ethanol(); e.volumeRatio = 2;
    const a = acetone(); a.volumeRatio = 3;
    const fractions = calculateVolumeFractions([t, e, a]);
    expect(fractions[0]).toBeCloseTo(1 / 6, 10);
    expect(fractions[1]).toBeCloseTo(2 / 6, 10);
    expect(fractions[2]).toBeCloseTo(3 / 6, 10);
  });

  it('成分1つの場合は1.0', () => {
    const fractions = calculateVolumeFractions([toluene()]);
    expect(fractions[0]).toBe(1);
  });

  it('空配列でエラー', () => {
    expect(() => calculateVolumeFractions([])).toThrow();
  });

  it('合計0でエラー', () => {
    const t = toluene(); t.volumeRatio = 0;
    expect(() => calculateVolumeFractions([t])).toThrow();
  });
});

describe('mixHSP', () => {
  it('トルエン:エタノール=3:1のHSP体積加重平均', () => {
    const components = [toluene(), ethanol()];
    const fractions = [0.75, 0.25];
    const hsp = mixHSP(components, fractions);
    expect(hsp.deltaD).toBeCloseTo(17.45, 2);
    expect(hsp.deltaP).toBeCloseTo(3.25, 2);
    expect(hsp.deltaH).toBeCloseTo(6.35, 2);
  });

  it('成分1つの場合はそのまま', () => {
    const components = [toluene()];
    const hsp = mixHSP(components, [1]);
    expect(hsp.deltaD).toBe(18.0);
    expect(hsp.deltaP).toBe(1.4);
    expect(hsp.deltaH).toBe(2.0);
  });
});

describe('mixMolarVolume', () => {
  it('体積加重の加成性', () => {
    const components = [toluene(), ethanol()];
    const fractions = [0.75, 0.25];
    const vm = mixMolarVolume(components, fractions);
    // 0.75*106.8 + 0.25*58.5 = 80.1 + 14.625 = 94.725
    expect(vm).toBeCloseTo(94.725, 2);
  });

  it('nullを含む場合はnull', () => {
    const components = [toluene(), nullPropsSolvent()];
    expect(mixMolarVolume(components, [0.5, 0.5])).toBeNull();
  });
});

describe('mixMolWeight', () => {
  it('モル分率加重平均（トルエン:エタノール=3:1）', () => {
    const components = [toluene(), ethanol()];
    const fractions = [0.75, 0.25];
    const mw = mixMolWeight(components, fractions);
    // x_tol = (0.75/106.8) / (0.75/106.8 + 0.25/58.5) = 0.007022 / 0.011296 = 0.6217
    // x_eth = 0.3783
    // Mw = 0.6217*92.14 + 0.3783*46.07 ≈ 74.71
    expect(mw).toBeCloseTo(74.71, 0);
  });

  it('molarVolumeがnullの場合はnull', () => {
    const components = [toluene(), nullPropsSolvent()];
    expect(mixMolWeight(components, [0.5, 0.5])).toBeNull();
  });

  it('molWeightがnullの場合はnull', () => {
    const t = toluene();
    t.solvent.molWeight = null;
    expect(mixMolWeight([t, ethanol()], [0.5, 0.5])).toBeNull();
  });
});

describe('mixViscosity', () => {
  it('Arrhenius対数混合則（トルエン:エタノール=3:1）', () => {
    const components = [toluene(), ethanol()];
    const fractions = [0.75, 0.25];
    const eta = mixViscosity(components, fractions);
    // ln(η) = 0.75*ln(0.56) + 0.25*ln(1.07) = -0.4349 + 0.0169 = -0.4179
    // η = exp(-0.4179) ≈ 0.658
    expect(eta).toBeCloseTo(0.658, 2);
  });

  it('nullを含む場合はnull', () => {
    const components = [toluene(), nullPropsSolvent()];
    expect(mixViscosity(components, [0.5, 0.5])).toBeNull();
  });

  it('粘度0の場合はnull', () => {
    const t = toluene();
    t.solvent.viscosity = 0;
    expect(mixViscosity([t, ethanol()], [0.5, 0.5])).toBeNull();
  });
});

describe('mixByVolumeAverage', () => {
  it('体積加重平均', () => {
    const result = mixByVolumeAverage([110.6, 78.4], [0.75, 0.25]);
    // 0.75*110.6 + 0.25*78.4 = 82.95 + 19.6 = 102.55
    expect(result).toBeCloseTo(102.55, 2);
  });

  it('nullを含む場合はnull', () => {
    expect(mixByVolumeAverage([110.6, null], [0.5, 0.5])).toBeNull();
  });

  it('全てnullの場合はnull', () => {
    expect(mixByVolumeAverage([null, null], [0.5, 0.5])).toBeNull();
  });
});

describe('generateCompositionNote', () => {
  it('組成情報テキストを生成', () => {
    const components = [toluene(), ethanol()];
    const fractions = [0.75, 0.25];
    const note = generateCompositionNote(components, fractions);
    expect(note).toContain('トルエン');
    expect(note).toContain('エタノール');
    expect(note).toContain('75.0%');
    expect(note).toContain('25.0%');
  });
});

describe('calculateMixture', () => {
  it('トルエン:エタノール=3:1の全物性を統合計算', () => {
    const result = calculateMixture([toluene(), ethanol()]);
    expect(result.hsp.deltaD).toBeCloseTo(17.45, 2);
    expect(result.hsp.deltaP).toBeCloseTo(3.25, 2);
    expect(result.hsp.deltaH).toBeCloseTo(6.35, 2);
    expect(result.molarVolume).toBeCloseTo(94.725, 1);
    expect(result.boilingPoint).toBeCloseTo(102.55, 1);
    expect(result.specificGravity).toBeCloseTo(0.8475, 3);
    expect(result.viscosity).toBeCloseTo(0.658, 2);
    expect(result.compositionNote).toContain('トルエン');
  });

  it('3成分混合', () => {
    const t = toluene(); t.volumeRatio = 1;
    const e = ethanol(); e.volumeRatio = 1;
    const a = acetone(); a.volumeRatio = 1;
    const result = calculateMixture([t, e, a]);
    // 等量3成分: δD = (18.0+15.8+15.5)/3 = 16.433
    expect(result.hsp.deltaD).toBeCloseTo(16.433, 2);
  });

  it('成分1つの場合は元の溶媒値', () => {
    const result = calculateMixture([toluene()]);
    expect(result.hsp.deltaD).toBe(18.0);
    expect(result.viscosity).toBe(0.56);
  });

  it('空配列でエラー', () => {
    expect(() => calculateMixture([])).toThrow();
  });

  it('物性nullの成分を含む場合、該当物性がnull', () => {
    const result = calculateMixture([toluene(), nullPropsSolvent()]);
    expect(result.hsp.deltaD).toBeDefined(); // HSPは常に有効
    expect(result.molarVolume).toBeNull();
    expect(result.viscosity).toBeNull();
    expect(result.boilingPoint).toBeNull();
  });

  it('名前が自動生成される', () => {
    const result = calculateMixture([toluene(), ethanol()]);
    expect(result.name).toContain('トルエン');
    expect(result.name).toContain('エタノール');
  });
});

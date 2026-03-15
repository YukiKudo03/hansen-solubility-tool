/**
 * 混合溶媒の物性値予測
 * 全関数は純粋関数（副作用なし）
 */
import type { HSPValues, MixtureComponent, MixtureSolventResult } from './types';

/**
 * 体積比から体積分率を算出
 * @throws 空配列または合計0の場合
 */
export function calculateVolumeFractions(components: MixtureComponent[]): number[] {
  if (components.length === 0) {
    throw new Error('成分が指定されていません');
  }
  const total = components.reduce((sum, c) => sum + c.volumeRatio, 0);
  if (total <= 0) {
    throw new Error('体積比の合計は正の値でなければなりません');
  }
  return components.map((c) => c.volumeRatio / total);
}

/** HSP値の体積加重平均 */
export function mixHSP(components: MixtureComponent[], fractions: number[]): HSPValues {
  let deltaD = 0;
  let deltaP = 0;
  let deltaH = 0;
  for (let i = 0; i < components.length; i++) {
    const f = fractions[i];
    const hsp = components[i].solvent.hsp;
    deltaD += f * hsp.deltaD;
    deltaP += f * hsp.deltaP;
    deltaH += f * hsp.deltaH;
  }
  return { deltaD, deltaP, deltaH };
}

/** モル体積の加成性 */
export function mixMolarVolume(components: MixtureComponent[], fractions: number[]): number | null {
  const values = components.map((c) => c.solvent.molarVolume);
  return mixByVolumeAverage(values, fractions);
}

/** 分子量のモル分率加重平均 */
export function mixMolWeight(components: MixtureComponent[], fractions: number[]): number | null {
  // モル分率変換にはモル体積が必要
  for (const c of components) {
    if (c.solvent.molarVolume == null || c.solvent.molWeight == null) {
      return null;
    }
  }

  // φi/Vmi で正規化してモル分率を算出
  let totalMoleFraction = 0;
  const moleFractionTerms: number[] = [];
  for (let i = 0; i < components.length; i++) {
    const term = fractions[i] / components[i].solvent.molarVolume!;
    moleFractionTerms.push(term);
    totalMoleFraction += term;
  }

  let mw = 0;
  for (let i = 0; i < components.length; i++) {
    const xi = moleFractionTerms[i] / totalMoleFraction;
    mw += xi * components[i].solvent.molWeight!;
  }
  return mw;
}

/** 粘度のArrhenius対数混合則: η_mix = exp(Σ(φi * ln(ηi))) */
export function mixViscosity(components: MixtureComponent[], fractions: number[]): number | null {
  for (const c of components) {
    if (c.solvent.viscosity == null || c.solvent.viscosity <= 0) {
      return null;
    }
  }
  let lnEta = 0;
  for (let i = 0; i < components.length; i++) {
    lnEta += fractions[i] * Math.log(components[i].solvent.viscosity!);
  }
  return Math.exp(lnEta);
}

/** 汎用体積加重平均（沸点・比重・表面張力用） */
export function mixByVolumeAverage(values: (number | null)[], fractions: number[]): number | null {
  for (const v of values) {
    if (v == null) return null;
  }
  let result = 0;
  for (let i = 0; i < values.length; i++) {
    result += fractions[i] * values[i]!;
  }
  return result;
}

/** 組成情報テキストを生成 */
export function generateCompositionNote(components: MixtureComponent[], fractions: number[]): string {
  const parts = components.map((c, i) => {
    const pct = (fractions[i] * 100).toFixed(1);
    return `${c.solvent.name} ${pct}%`;
  });
  return `混合溶媒: ${parts.join(' / ')}`;
}

/**
 * 混合溶媒の全物性を統合計算
 * @throws 空配列の場合
 */
export function calculateMixture(components: MixtureComponent[]): MixtureSolventResult {
  const fractions = calculateVolumeFractions(components);
  const hsp = mixHSP(components, fractions);
  const molarVolume = mixMolarVolume(components, fractions);
  const molWeight = mixMolWeight(components, fractions);
  const viscosity = mixViscosity(components, fractions);

  const bpValues = components.map((c) => c.solvent.boilingPoint);
  const sgValues = components.map((c) => c.solvent.specificGravity);
  const stValues = components.map((c) => c.solvent.surfaceTension);

  const boilingPoint = mixByVolumeAverage(bpValues, fractions);
  const specificGravity = mixByVolumeAverage(sgValues, fractions);
  const surfaceTension = mixByVolumeAverage(stValues, fractions);

  const compositionNote = generateCompositionNote(components, fractions);
  const name = components.map((c) => c.solvent.name).join(' + ');

  return {
    name,
    hsp,
    molarVolume,
    molWeight,
    boilingPoint,
    viscosity,
    specificGravity,
    surfaceTension,
    compositionNote,
  };
}

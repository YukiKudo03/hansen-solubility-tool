/**
 * バリデーション関数（純粋関数）
 * エラーがある場合はメッセージ文字列を返し、有効な場合はnullを返す
 */
import type { RiskThresholds, WettabilityThresholds } from './types';

export function validateHSPValues(deltaD: number, deltaP: number, deltaH: number): string | null {
  if (!Number.isFinite(deltaD) || deltaD < 0) return 'δDは0以上の数値を入力してください';
  if (!Number.isFinite(deltaP) || deltaP < 0) return 'δPは0以上の数値を入力してください';
  if (!Number.isFinite(deltaH) || deltaH < 0) return 'δHは0以上の数値を入力してください';
  return null;
}

export function validateR0(r0: number): string | null {
  if (!Number.isFinite(r0) || r0 <= 0) return 'R₀は正の数値を入力してください';
  return null;
}

export function validateThresholds(t: RiskThresholds): string | null {
  const vals = [t.dangerousMax, t.warningMax, t.cautionMax, t.holdMax];
  if (vals.some((v) => !Number.isFinite(v) || v < 0)) {
    return '閾値はすべて0以上の数値を入力してください';
  }
  if (!(t.dangerousMax < t.warningMax && t.warningMax < t.cautionMax && t.cautionMax < t.holdMax)) {
    return '閾値は dangerousMax < warningMax < cautionMax < holdMax の順でなければなりません';
  }
  return null;
}

export function validateName(name: string): string | null {
  if (!name || !name.trim()) return '名前を入力してください';
  return null;
}

export function validateCasNumber(cas: string | undefined | null): string | null {
  if (!cas || cas === '') return null; // 任意フィールド
  if (!/^\d{2,7}-\d{2}-\d$/.test(cas)) return 'CAS番号の形式が不正です（例: 108-88-3）';
  return null;
}

export function validatePartInput(input: {
  name: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  r0: number;
}): string | null {
  return validateName(input.name)
    ?? validateHSPValues(input.deltaD, input.deltaP, input.deltaH)
    ?? validateR0(input.r0);
}

export function validatePhysicalProperties(input: {
  boilingPoint?: number;
  viscosity?: number;
  specificGravity?: number;
  surfaceTension?: number;
}): string | null {
  if (input.boilingPoint !== undefined && !Number.isFinite(input.boilingPoint)) {
    return '沸点は有効な数値を入力してください';
  }
  if (input.viscosity !== undefined && (!Number.isFinite(input.viscosity) || input.viscosity < 0)) {
    return '粘度は0以上の数値を入力してください';
  }
  if (input.specificGravity !== undefined && (!Number.isFinite(input.specificGravity) || input.specificGravity <= 0)) {
    return '比重は正の数値を入力してください';
  }
  if (input.surfaceTension !== undefined && (!Number.isFinite(input.surfaceTension) || input.surfaceTension <= 0)) {
    return '表面張力は正の数値を入力してください';
  }
  return null;
}

export function validateSolventInput(input: {
  name: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  casNumber?: string;
  boilingPoint?: number;
  viscosity?: number;
  specificGravity?: number;
  surfaceTension?: number;
}): string | null {
  return validateName(input.name)
    ?? validateHSPValues(input.deltaD, input.deltaP, input.deltaH)
    ?? validateCasNumber(input.casNumber)
    ?? validatePhysicalProperties(input);
}

const VALID_NANO_PARTICLE_CATEGORIES = ['carbon', 'metal', 'metal_oxide', 'quantum_dot', 'polymer', 'other'];

export function validateNanoParticleInput(input: {
  name: string;
  category: string;
  coreMaterial: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  r0: number;
  particleSize?: number;
}): string | null {
  const nameErr = validateName(input.name);
  if (nameErr) return nameErr;
  if (!input.coreMaterial || !input.coreMaterial.trim()) return '母材を入力してください';
  if (!VALID_NANO_PARTICLE_CATEGORIES.includes(input.category)) return '無効なカテゴリです';
  const hspErr = validateHSPValues(input.deltaD, input.deltaP, input.deltaH);
  if (hspErr) return hspErr;
  const r0Err = validateR0(input.r0);
  if (r0Err) return r0Err;
  if (input.particleSize !== undefined && (!Number.isFinite(input.particleSize) || input.particleSize <= 0)) {
    return '粒子径は正の数値を入力してください';
  }
  return null;
}

export function validateDispersibilityThresholds(t: {
  excellentMax: number;
  goodMax: number;
  fairMax: number;
  poorMax: number;
}): string | null {
  const vals = [t.excellentMax, t.goodMax, t.fairMax, t.poorMax];
  if (vals.some((v) => !Number.isFinite(v) || v < 0)) {
    return '閾値はすべて0以上の数値を入力してください';
  }
  if (!(t.excellentMax < t.goodMax && t.goodMax < t.fairMax && t.fairMax < t.poorMax)) {
    return '閾値は excellentMax < goodMax < fairMax < poorMax の順でなければなりません';
  }
  return null;
}

export function validateWettabilityThresholds(t: WettabilityThresholds): string | null {
  const vals = [t.superHydrophilicMax, t.hydrophilicMax, t.wettableMax, t.moderateMax, t.hydrophobicMax];
  if (vals.some((v) => !Number.isFinite(v) || v < 0 || v > 180)) {
    return '閾値はすべて0以上180以下の数値を入力してください';
  }
  if (!(t.superHydrophilicMax < t.hydrophilicMax
    && t.hydrophilicMax < t.wettableMax
    && t.wettableMax < t.moderateMax
    && t.moderateMax < t.hydrophobicMax)) {
    return '閾値は superHydrophilicMax < hydrophilicMax < wettableMax < moderateMax < hydrophobicMax の順でなければなりません';
  }
  return null;
}

export function validateSwellingThresholds(t: {
  severeMax: number;
  highMax: number;
  moderateMax: number;
  lowMax: number;
}): string | null {
  const vals = [t.severeMax, t.highMax, t.moderateMax, t.lowMax];
  if (vals.some((v) => !Number.isFinite(v) || v < 0)) {
    return '閾値はすべて0以上の数値を入力してください';
  }
  if (!(t.severeMax < t.highMax && t.highMax < t.moderateMax && t.moderateMax < t.lowMax)) {
    return '閾値は severeMax < highMax < moderateMax < lowMax の順でなければなりません';
  }
  return null;
}

export function validateDrugInput(input: {
  name: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  r0: number;
  casNumber?: string;
  molWeight?: number;
  logP?: number;
}): string | null {
  const nameErr = validateName(input.name);
  if (nameErr) return nameErr;
  const hspErr = validateHSPValues(input.deltaD, input.deltaP, input.deltaH);
  if (hspErr) return hspErr;
  const r0Err = validateR0(input.r0);
  if (r0Err) return r0Err;
  const casErr = validateCasNumber(input.casNumber);
  if (casErr) return casErr;
  if (input.molWeight !== undefined && (!Number.isFinite(input.molWeight) || input.molWeight <= 0)) {
    return '分子量は正の数値を入力してください';
  }
  return null;
}

export function validateDrugSolubilityThresholds(t: {
  excellentMax: number;
  goodMax: number;
  partialMax: number;
  poorMax: number;
}): string | null {
  const vals = [t.excellentMax, t.goodMax, t.partialMax, t.poorMax];
  if (vals.some((v) => !Number.isFinite(v) || v < 0)) {
    return '閾値はすべて0以上の数値を入力してください';
  }
  if (!(t.excellentMax < t.goodMax && t.goodMax < t.partialMax && t.partialMax < t.poorMax)) {
    return '閾値は excellentMax < goodMax < partialMax < poorMax の順でなければなりません';
  }
  return null;
}

export function validateBlendOptimizationInput(input: {
  targetDeltaD: number;
  targetDeltaP: number;
  targetDeltaH: number;
  candidateCount: number;
  maxComponents: 2 | 3;
  stepSize: number;
  topN: number;
}): string | null {
  const hspErr = validateHSPValues(input.targetDeltaD, input.targetDeltaP, input.targetDeltaH);
  if (hspErr) return `ターゲットHSP: ${hspErr}`;
  if (!Number.isFinite(input.stepSize) || input.stepSize <= 0 || input.stepSize > 1) {
    return '刻み幅は0より大きく1以下の数値を入力してください';
  }
  if (!Number.isInteger(input.topN) || input.topN <= 0) {
    return '表示件数は正の整数を入力してください';
  }
  if (input.candidateCount < input.maxComponents) {
    return `候補溶媒は${input.maxComponents}件以上選択してください`;
  }
  return null;
}

export function validateChemicalResistanceThresholds(t: {
  noResistanceMax: number; poorMax: number; moderateMax: number; goodMax: number;
}): string | null {
  const vals = [t.noResistanceMax, t.poorMax, t.moderateMax, t.goodMax];
  if (vals.some((v) => !Number.isFinite(v) || v < 0)) {
    return '閾値はすべて0以上の数値を入力してください';
  }
  if (!(t.noResistanceMax < t.poorMax && t.poorMax < t.moderateMax && t.moderateMax < t.goodMax)) {
    return '閾値は noResistanceMax < poorMax < moderateMax < goodMax の順でなければなりません';
  }
  return null;
}

export function validatePlasticizerThresholds(t: {
  excellentMax: number; goodMax: number; fairMax: number; poorMax: number;
}): string | null {
  const vals = [t.excellentMax, t.goodMax, t.fairMax, t.poorMax];
  if (vals.some((v) => !Number.isFinite(v) || v < 0)) {
    return '閾値はすべて0以上の数値を入力してください';
  }
  if (!(t.excellentMax < t.goodMax && t.goodMax < t.fairMax && t.fairMax < t.poorMax)) {
    return '閾値は excellentMax < goodMax < fairMax < poorMax の順でなければなりません';
  }
  return null;
}

export function validateCarrierThresholds(t: {
  excellentMax: number; goodMax: number; fairMax: number; poorMax: number;
}): string | null {
  const vals = [t.excellentMax, t.goodMax, t.fairMax, t.poorMax];
  if (vals.some((v) => !Number.isFinite(v) || v < 0)) {
    return '閾値はすべて0以上の数値を入力してください';
  }
  if (!(t.excellentMax < t.goodMax && t.goodMax < t.fairMax && t.fairMax < t.poorMax)) {
    return '閾値は excellentMax < goodMax < fairMax < poorMax の順でなければなりません';
  }
  return null;
}

export function validateMixtureInput(components: { solventId: number; volumeRatio: number }[]): string | null {
  if (components.length < 1) {
    return '1つ以上の溶媒を追加してください';
  }
  for (const c of components) {
    if (!Number.isFinite(c.volumeRatio) || c.volumeRatio <= 0) {
      return '体積比は正の数値を入力してください';
    }
  }
  return null;
}

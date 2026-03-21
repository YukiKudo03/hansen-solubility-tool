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

// ============================================================================
// 新規IPCハンドラ用の入力バリデーション
// ============================================================================

/** 接着性閾値バリデーション */
export function validateAdhesionThresholds(t: unknown): string | null {
  if (t == null || typeof t !== 'object') return '閾値オブジェクトが必要です';
  const obj = t as Record<string, unknown>;
  const keys = ['excellentMax', 'goodMax', 'fairMax', 'poorMax'] as const;
  for (const k of keys) {
    if (typeof obj[k] !== 'number' || !isFinite(obj[k] as number)) return `${k} は有限数値でなければなりません`;
    if ((obj[k] as number) < 0) return `${k} は非負でなければなりません`;
  }
  const { excellentMax, goodMax, fairMax, poorMax } = obj as unknown as { excellentMax: number; goodMax: number; fairMax: number; poorMax: number };
  if (!(excellentMax < goodMax && goodMax < fairMax && fairMax < poorMax)) {
    return '閾値は excellentMax < goodMax < fairMax < poorMax の順でなければなりません';
  }
  return null;
}

/** 溶媒分類配列バリデーション */
export function validateSolventClassifications(input: unknown): string | null {
  if (!Array.isArray(input)) return '分類データは配列でなければなりません';
  if (input.length === 0) return '分類データが空です';
  for (let i = 0; i < input.length; i++) {
    const c: unknown = input[i];
    if (c == null || typeof c !== 'object') return `分類[${i}]: オブジェクトでなければなりません`;
    const entry = c as Record<string, unknown>;
    if (typeof entry.solventId !== 'number' || !Number.isInteger(entry.solventId) || entry.solventId <= 0) {
      return `分類[${i}]: solventId は正の整数でなければなりません`;
    }
    if (typeof entry.isGood !== 'boolean') {
      return `分類[${i}]: isGood はブーリアンでなければなりません`;
    }
  }
  const hasGood = input.some((c) => (c as Record<string, unknown>).isGood === true);
  const hasBad = input.some((c) => (c as Record<string, unknown>).isGood === false);
  if (!hasGood) return '少なくとも1つの良溶媒が必要です';
  if (!hasBad) return '少なくとも1つの貧溶媒が必要です';
  return null;
}

/** グリーン溶媒入力バリデーション */
export function validateGreenSolventInput(targetSolventId: unknown, maxResults?: unknown): string | null {
  if (typeof targetSolventId !== 'number' || !Number.isInteger(targetSolventId) || targetSolventId <= 0) {
    return 'targetSolventId は正の整数でなければなりません';
  }
  if (maxResults !== undefined && maxResults !== null) {
    if (typeof maxResults !== 'number' || !Number.isInteger(maxResults) || maxResults <= 0) {
      return 'maxResults は正の整数でなければなりません';
    }
  }
  return null;
}

/** 多目的最適化入力バリデーション */
export function validateMultiObjectiveInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  for (const k of ['targetDeltaD', 'targetDeltaP', 'targetDeltaH', 'r0']) {
    if (typeof p[k] !== 'number' || !isFinite(p[k] as number)) return `${k} は有限数値でなければなりません`;
  }
  for (const k of ['targetDeltaD', 'targetDeltaP', 'targetDeltaH']) {
    if ((p[k] as number) < 0) return `${k} は非負でなければなりません`;
  }
  if ((p.r0 as number) <= 0) return 'r0 は正の数値でなければなりません';
  return null;
}

/** 族寄与法入力バリデーション */
export function validateGroupContributionInput(input: unknown): string | null {
  if (input == null || typeof input !== 'object') return '入力オブジェクトが必要です';
  const obj = input as Record<string, unknown>;
  if (!Array.isArray(obj.firstOrderGroups)) return 'firstOrderGroups は配列でなければなりません';
  if (obj.firstOrderGroups.length === 0) return '1次基グループを少なくとも1つ指定してください';
  for (let i = 0; i < obj.firstOrderGroups.length; i++) {
    const g: unknown = (obj.firstOrderGroups as unknown[])[i];
    if (g == null || typeof g !== 'object') return `firstOrderGroups[${i}]: オブジェクトでなければなりません`;
    const entry = g as Record<string, unknown>;
    if (typeof entry.groupId !== 'string' || entry.groupId.length === 0) return `firstOrderGroups[${i}]: groupId は非空文字列でなければなりません`;
    if (typeof entry.count !== 'number' || !Number.isInteger(entry.count) || entry.count <= 0) return `firstOrderGroups[${i}]: count は正の整数でなければなりません`;
  }
  if (obj.secondOrderGroups !== undefined) {
    if (!Array.isArray(obj.secondOrderGroups)) return 'secondOrderGroups は配列でなければなりません';
    for (let i = 0; i < obj.secondOrderGroups.length; i++) {
      const g: unknown = (obj.secondOrderGroups as unknown[])[i];
      if (g == null || typeof g !== 'object') return `secondOrderGroups[${i}]: オブジェクトでなければなりません`;
      const entry = g as Record<string, unknown>;
      if (typeof entry.groupId !== 'string' || entry.groupId.length === 0) return `secondOrderGroups[${i}]: groupId は非空文字列でなければなりません`;
      if (typeof entry.count !== 'number' || !Number.isInteger(entry.count) || entry.count <= 0) return `secondOrderGroups[${i}]: count は正の整数でなければなりません`;
    }
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

const VALID_DISPERSANT_TYPES = ['polymeric', 'surfactant', 'silane_coupling', 'other'];

export function validateDispersantInput(input: {
  name: string;
  dispersantType: string;
  anchorDeltaD: number; anchorDeltaP: number; anchorDeltaH: number; anchorR0: number;
  solvationDeltaD: number; solvationDeltaP: number; solvationDeltaH: number; solvationR0: number;
  overallDeltaD: number; overallDeltaP: number; overallDeltaH: number;
  hlb?: number;
  molWeight?: number;
}): string | null {
  const nameErr = validateName(input.name);
  if (nameErr) return nameErr;
  if (!VALID_DISPERSANT_TYPES.includes(input.dispersantType)) return '無効な分散剤タイプです';
  // アンカー基HSP
  const anchorHSPErr = validateHSPValues(input.anchorDeltaD, input.anchorDeltaP, input.anchorDeltaH);
  if (anchorHSPErr) return `アンカー基: ${anchorHSPErr}`;
  const anchorR0Err = validateR0(input.anchorR0);
  if (anchorR0Err) return `アンカー基: ${anchorR0Err}`;
  // 溶媒和鎖HSP
  const solvHSPErr = validateHSPValues(input.solvationDeltaD, input.solvationDeltaP, input.solvationDeltaH);
  if (solvHSPErr) return `溶媒和鎖: ${solvHSPErr}`;
  const solvR0Err = validateR0(input.solvationR0);
  if (solvR0Err) return `溶媒和鎖: ${solvR0Err}`;
  // 全体HSP
  const overallHSPErr = validateHSPValues(input.overallDeltaD, input.overallDeltaP, input.overallDeltaH);
  if (overallHSPErr) return `全体: ${overallHSPErr}`;
  // 任意項目
  if (input.hlb !== undefined && input.hlb !== null && (!Number.isFinite(input.hlb) || input.hlb < 0)) {
    return 'HLB値は0以上の数値を入力してください';
  }
  if (input.molWeight !== undefined && input.molWeight !== null && (!Number.isFinite(input.molWeight) || input.molWeight <= 0)) {
    return '分子量は正の数値を入力してください';
  }
  return null;
}

export function validateDispersantThresholds(t: {
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

// ============================================================================
// 新規5パイプライン用の入力バリデーション
// ============================================================================

/** HSP値が有効範囲(0-50)であることを検証 */
function validateHSPRange(deltaD: number, deltaP: number, deltaH: number): string | null {
  if (!Number.isFinite(deltaD) || deltaD < 0 || deltaD > 50) return 'δDは0以上50以下の数値を入力してください';
  if (!Number.isFinite(deltaP) || deltaP < 0 || deltaP > 50) return 'δPは0以上50以下の数値を入力してください';
  if (!Number.isFinite(deltaH) || deltaH < 0 || deltaH > 50) return 'δHは0以上50以下の数値を入力してください';
  return null;
}

/** HSP + R0 + 配列の共通バリデーション */
function validateHSPR0Array(
  hsp: { deltaD: number; deltaP: number; deltaH: number },
  r0: number,
  items: unknown[],
  itemLabel: string,
): string | null {
  const hspErr = validateHSPRange(hsp.deltaD, hsp.deltaP, hsp.deltaH);
  if (hspErr) return hspErr;
  if (!Number.isFinite(r0) || r0 <= 0) return 'R₀は正の数値を入力してください';
  if (!Array.isArray(items) || items.length === 0) return `${itemLabel}を1つ以上指定してください`;
  return null;
}

/** ESCパイプライン入力バリデーション */
export function validateESCInput(
  polymerHSP: { deltaD: number; deltaP: number; deltaH: number },
  r0: number,
  solvents: unknown[],
): string | null {
  return validateHSPR0Array(polymerHSP, r0, solvents, '溶媒');
}

/** 共結晶スクリーニング入力バリデーション */
export function validateCocrystalInput(
  apiHSP: { deltaD: number; deltaP: number; deltaH: number },
  r0: number,
  coformers: unknown[],
): string | null {
  return validateHSPR0Array(apiHSP, r0, coformers, 'コフォーマー');
}

/** 3Dプリント溶剤平滑化入力バリデーション */
export function validatePrinting3dInput(
  filamentHSP: { deltaD: number; deltaP: number; deltaH: number },
  r0: number,
  solvents: unknown[],
): string | null {
  return validateHSPR0Array(filamentHSP, r0, solvents, '溶媒');
}

/** 誘電体薄膜品質入力バリデーション */
export function validateDielectricInput(
  polymerHSP: { deltaD: number; deltaP: number; deltaH: number },
  r0: number,
  solvents: unknown[],
): string | null {
  return validateHSPR0Array(polymerHSP, r0, solvents, '溶媒');
}

/** 賦形剤適合性入力バリデーション */
export function validateExcipientInput(
  apiHSP: { deltaD: number; deltaP: number; deltaH: number },
  r0: number,
  excipients: unknown[],
): string | null {
  return validateHSPR0Array(apiHSP, r0, excipients, '賦形剤');
}

// ============================================================================
// Flory-Huggins群パイプライン用の入力バリデーション
// ============================================================================

/** ポリマーブレンド相溶性入力バリデーション */
export function validatePolymerBlendInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  if (typeof p.groupId1 !== 'number' || !Number.isInteger(p.groupId1) || p.groupId1 <= 0) {
    return 'ポリマー1のグループIDは正の整数でなければなりません';
  }
  if (typeof p.groupId2 !== 'number' || !Number.isInteger(p.groupId2) || p.groupId2 <= 0) {
    return 'ポリマー2のグループIDは正の整数でなければなりません';
  }
  if (typeof p.degreeOfPolymerization !== 'number' || !Number.isFinite(p.degreeOfPolymerization) || p.degreeOfPolymerization <= 0) {
    return '重合度は正の数値でなければなりません';
  }
  if (typeof p.referenceVolume !== 'number' || !Number.isFinite(p.referenceVolume) || p.referenceVolume <= 0) {
    return '参照体積は正の数値でなければなりません';
  }
  return null;
}

/** リサイクル相溶性入力バリデーション */
export function validateRecyclingInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  if (!Array.isArray(p.groupIds)) return 'groupIds は配列でなければなりません';
  if (p.groupIds.length < 2) return 'ポリマーグループを2つ以上選択してください';
  for (let i = 0; i < p.groupIds.length; i++) {
    const id: unknown = (p.groupIds as unknown[])[i];
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
      return `groupIds[${i}] は正の整数でなければなりません`;
    }
  }
  if (typeof p.degreeOfPolymerization !== 'number' || !Number.isFinite(p.degreeOfPolymerization) || p.degreeOfPolymerization <= 0) {
    return '重合度は正の数値でなければなりません';
  }
  if (typeof p.referenceVolume !== 'number' || !Number.isFinite(p.referenceVolume) || p.referenceVolume <= 0) {
    return '参照体積は正の数値でなければなりません';
  }
  return null;
}

/** 相溶化剤選定入力バリデーション */
export function validateCompatibilizerInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  if (typeof p.groupId1 !== 'number' || !Number.isInteger(p.groupId1) || p.groupId1 <= 0) {
    return 'ポリマー1のグループIDは正の整数でなければなりません';
  }
  if (typeof p.groupId2 !== 'number' || !Number.isInteger(p.groupId2) || p.groupId2 <= 0) {
    return 'ポリマー2のグループIDは正の整数でなければなりません';
  }
  return null;
}

/** コポリマーHSP推定入力バリデーション */
export function validateCopolymerInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  if (!Array.isArray(p.monomers)) return 'monomers は配列でなければなりません';
  if (p.monomers.length < 2) return 'モノマーを2つ以上追加してください';
  let totalFraction = 0;
  for (let i = 0; i < p.monomers.length; i++) {
    const m: unknown = (p.monomers as unknown[])[i];
    if (m == null || typeof m !== 'object') return `monomers[${i}]: オブジェクトでなければなりません`;
    const entry = m as Record<string, unknown>;
    if (typeof entry.name !== 'string' || entry.name.trim().length === 0) return `monomers[${i}]: name は非空文字列でなければなりません`;
    if (typeof entry.deltaD !== 'number' || !Number.isFinite(entry.deltaD) || entry.deltaD < 0) return `monomers[${i}]: δDは0以上の数値を入力してください`;
    if (typeof entry.deltaP !== 'number' || !Number.isFinite(entry.deltaP) || entry.deltaP < 0) return `monomers[${i}]: δPは0以上の数値を入力してください`;
    if (typeof entry.deltaH !== 'number' || !Number.isFinite(entry.deltaH) || entry.deltaH < 0) return `monomers[${i}]: δHは0以上の数値を入力してください`;
    if (typeof entry.fraction !== 'number' || !Number.isFinite(entry.fraction) || entry.fraction <= 0 || entry.fraction > 1) {
      return `monomers[${i}]: 分率は0より大きく1以下の数値でなければなりません`;
    }
    totalFraction += entry.fraction as number;
  }
  if (Math.abs(totalFraction - 1.0) > 0.01) {
    return 'モノマー分率の合計は1.0でなければなりません（許容誤差: ±0.01）';
  }
  return null;
}

// ============================================================================
// Partition-Coefficient群パイプライン用の入力バリデーション
// ============================================================================

/** 添加剤移行入力バリデーション */
export function validateAdditiveMigrationInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  if (typeof p.partId !== 'number' || !Number.isInteger(p.partId) || p.partId <= 0) {
    return 'partId は正の整数でなければなりません';
  }
  if (typeof p.groupId !== 'number' || !Number.isInteger(p.groupId) || p.groupId <= 0) {
    return 'groupId は正の整数でなければなりません';
  }
  return null;
}

/** フレーバースカルピング入力バリデーション */
export function validateFlavorScalpingInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  if (typeof p.partId !== 'number' || !Number.isInteger(p.partId) || p.partId <= 0) {
    return 'partId は正の整数でなければなりません';
  }
  if (typeof p.groupId !== 'number' || !Number.isInteger(p.groupId) || p.groupId <= 0) {
    return 'groupId は正の整数でなければなりません';
  }
  return null;
}

/** 包装材溶出入力バリデーション */
export function validateFoodPackagingMigrationInput(
  packagingHSP: { deltaD: number; deltaP: number; deltaH: number },
  r0: number,
  substances: unknown[],
): string | null {
  return validateHSPR0Array(packagingHSP, r0, substances, '溶出物質');
}

/** 香料カプセル化入力バリデーション */
export function validateFragranceEncapsulationInput(
  wallHSP: { deltaD: number; deltaP: number; deltaH: number },
  r0: number,
  fragrances: unknown[],
): string | null {
  return validateHSPR0Array(wallHSP, r0, fragrances, '香料');
}

/** 経皮吸収促進剤入力バリデーション */
export function validateTransdermalEnhancerInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  if (typeof p.drugId !== 'number' || !Number.isInteger(p.drugId) || p.drugId <= 0) {
    return '薬物IDは正の整数でなければなりません';
  }
  // skinHSP validation
  if (p.skinHSP == null || typeof p.skinHSP !== 'object') return '皮膚HSPオブジェクトが必要です';
  const skin = p.skinHSP as Record<string, unknown>;
  const skinHSPErr = validateHSPRange(skin.deltaD as number, skin.deltaP as number, skin.deltaH as number);
  if (skinHSPErr) return `皮膚HSP: ${skinHSPErr}`;
  return null;
}

/** リポソーム透過性入力バリデーション */
export function validateLiposomePermeabilityInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  if (typeof p.drugId !== 'number' || !Number.isInteger(p.drugId) || p.drugId <= 0) {
    return '薬物IDは正の整数でなければなりません';
  }
  // lipidHSP validation
  if (p.lipidHSP == null || typeof p.lipidHSP !== 'object') return '脂質膜HSPオブジェクトが必要です';
  const lipid = p.lipidHSP as Record<string, unknown>;
  const lipidHSPErr = validateHSPRange(lipid.deltaD as number, lipid.deltaP as number, lipid.deltaH as number);
  if (lipidHSPErr) return `脂質膜HSP: ${lipidHSPErr}`;
  if (typeof p.lipidR0 !== 'number' || !Number.isFinite(p.lipidR0) || p.lipidR0 <= 0) {
    return '脂質膜R₀は正の数値を入力してください';
  }
  return null;
}

// ============================================================================
// Work-of-Adhesion群パイプライン用の入力バリデーション
// ============================================================================

/** HSPオブジェクト型バリデーション（汎用） */
function validateHSPObject(obj: unknown, label: string): string | null {
  if (obj == null || typeof obj !== 'object') return `${label}HSPオブジェクトが必要です`;
  const h = obj as Record<string, unknown>;
  return validateHSPRange(h.deltaD as number, h.deltaP as number, h.deltaH as number);
}

/** インク-基材密着入力バリデーション */
export function validateInkSubstrateAdhesionInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  const inkErr = validateHSPObject(p.inkHSP, 'インク');
  if (inkErr) return `インクHSP: ${inkErr}`;
  const subErr = validateHSPObject(p.substrateHSP, '基材');
  if (subErr) return `基材HSP: ${subErr}`;
  return null;
}

/** 多層コーティング密着入力バリデーション */
export function validateMultilayerCoatingInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  if (!Array.isArray(p.layers)) return '層データは配列でなければなりません';
  if (p.layers.length < 2) return '層を2つ以上追加してください';
  for (let i = 0; i < p.layers.length; i++) {
    const layer: unknown = (p.layers as unknown[])[i];
    if (layer == null || typeof layer !== 'object') return `layers[${i}]: オブジェクトでなければなりません`;
    const l = layer as Record<string, unknown>;
    if (typeof l.name !== 'string' || l.name.trim().length === 0) return `layers[${i}]: 名前は非空文字列でなければなりません`;
    const hspErr = validateHSPObject(l.hsp, `layers[${i}]`);
    if (hspErr) return `layers[${i}]: ${hspErr}`;
  }
  return null;
}

/** PSA剥離強度入力バリデーション */
export function validatePSAPeelStrengthInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  const psaErr = validateHSPObject(p.psaHSP, 'PSA');
  if (psaErr) return `PSA HSP: ${psaErr}`;
  const adhErr = validateHSPObject(p.adherendHSP, '被着体');
  if (adhErr) return `被着体HSP: ${adhErr}`;
  return null;
}

/** 構造接着設計入力バリデーション */
export function validateStructuralAdhesiveJointInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  const glueErr = validateHSPObject(p.adhesiveHSP, '接着剤');
  if (glueErr) return `接着剤HSP: ${glueErr}`;
  const adh1Err = validateHSPObject(p.adherend1HSP, '被着体1');
  if (adh1Err) return `被着体1 HSP: ${adh1Err}`;
  const adh2Err = validateHSPObject(p.adherend2HSP, '被着体2');
  if (adh2Err) return `被着体2 HSP: ${adh2Err}`;
  return null;
}

/** 表面処理効果入力バリデーション */
export function validateSurfaceTreatmentInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  const beforeErr = validateHSPObject(p.beforeHSP, '処理前');
  if (beforeErr) return `処理前HSP: ${beforeErr}`;
  const afterErr = validateHSPObject(p.afterHSP, '処理後');
  if (afterErr) return `処理後HSP: ${afterErr}`;
  const targetErr = validateHSPObject(p.targetHSP, 'ターゲット');
  if (targetErr) return `ターゲットHSP: ${targetErr}`;
  return null;
}

// ============================================================================
// ナノ材料分散群パイプライン用の入力バリデーション
// ============================================================================

/** 顔料分散安定性入力バリデーション */
export function validatePigmentDispersionInput(
  pigmentHSP: { deltaD: number; deltaP: number; deltaH: number },
  r0: number,
  vehicles: unknown[],
): string | null {
  return validateHSPR0Array(pigmentHSP, r0, vehicles, 'ビヒクル');
}

/** CNT/グラフェン分散入力バリデーション */
export function validateCNTGrapheneInput(
  nanomaterialHSP: { deltaD: number; deltaP: number; deltaH: number },
  r0: number,
  solvents: unknown[],
): string | null {
  return validateHSPR0Array(nanomaterialHSP, r0, solvents, '溶媒');
}

/** MXene分散入力バリデーション */
export function validateMXeneDispersionInput(
  mxeneHSP: { deltaD: number; deltaP: number; deltaH: number },
  r0: number,
  solvents: unknown[],
): string | null {
  return validateHSPR0Array(mxeneHSP, r0, solvents, '溶媒');
}

/** ナノ粒子薬物ローディング入力バリデーション */
export function validateDrugLoadingInput(
  carrierHSP: { deltaD: number; deltaP: number; deltaH: number },
  carrierR0: number,
  drugs: unknown[],
): string | null {
  return validateHSPR0Array(carrierHSP, carrierR0, drugs, '薬物');
}

/** 密着強度閾値バリデーション */
export function validateAdhesionStrengthThresholds(t: unknown): string | null {
  if (t == null || typeof t !== 'object') return '閾値オブジェクトが必要です';
  const obj = t as Record<string, unknown>;
  for (const k of ['excellentMin', 'goodMin', 'fairMin'] as const) {
    if (typeof obj[k] !== 'number' || !isFinite(obj[k] as number)) return `${k} は有限数値でなければなりません`;
    if ((obj[k] as number) < 0) return `${k} は非負でなければなりません`;
  }
  const { excellentMin, goodMin, fairMin } = obj as unknown as { excellentMin: number; goodMin: number; fairMin: number };
  if (!(excellentMin > goodMin && goodMin > fairMin)) {
    return '閾値は excellentMin > goodMin > fairMin の順でなければなりません';
  }
  return null;
}

// ============================================================================
// Gas-Solubility群パイプライン用の入力バリデーション
// ============================================================================

/** ガス透過性入力バリデーション */
export function validateGasPermeabilityInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  const hspErr = validateHSPObject(p.polymerHSP, 'ポリマー');
  if (hspErr) return `ポリマーHSP: ${hspErr}`;
  if (!Array.isArray(p.gasNames) || p.gasNames.length === 0) return 'ガスを1つ以上指定してください';
  return null;
}

/** 膜分離選択性入力バリデーション */
export function validateMembraneSeparationInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  const memErr = validateHSPObject(p.membraneHSP, '膜');
  if (memErr) return `膜HSP: ${memErr}`;
  const tgtErr = validateHSPObject(p.targetHSP, 'ターゲット');
  if (tgtErr) return `ターゲットHSP: ${tgtErr}`;
  const impErr = validateHSPObject(p.impurityHSP, '不純物');
  if (impErr) return `不純物HSP: ${impErr}`;
  if (typeof p.targetName !== 'string' || p.targetName.trim().length === 0) return 'ターゲット名を入力してください';
  if (typeof p.impurityName !== 'string' || p.impurityName.trim().length === 0) return '不純物名を入力してください';
  return null;
}

/** CO2吸収材入力バリデーション */
export function validateCO2AbsorbentInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  if (!Array.isArray(p.absorbents) || p.absorbents.length === 0) return '吸収材候補を1つ以上指定してください';
  for (let i = 0; i < p.absorbents.length; i++) {
    const a: unknown = (p.absorbents as unknown[])[i];
    if (a == null || typeof a !== 'object') return `absorbents[${i}]: オブジェクトでなければなりません`;
    const entry = a as Record<string, unknown>;
    if (typeof entry.name !== 'string' || entry.name.trim().length === 0) return `absorbents[${i}]: 名前を入力してください`;
    const hspErr = validateHSPObject(entry.hsp, `absorbents[${i}]`);
    if (hspErr) return `absorbents[${i}]: ${hspErr}`;
    if (typeof entry.r0 !== 'number' || !Number.isFinite(entry.r0) || entry.r0 <= 0) return `absorbents[${i}]: R₀は正の数値を入力してください`;
  }
  return null;
}

/** 水素貯蔵材料入力バリデーション */
export function validateHydrogenStorageInput(params: unknown): string | null {
  if (params == null || typeof params !== 'object') return 'パラメータオブジェクトが必要です';
  const p = params as Record<string, unknown>;
  const carrierErr = validateHSPObject(p.carrierHSP, 'キャリア');
  if (carrierErr) return `キャリアHSP: ${carrierErr}`;
  if (typeof p.r0 !== 'number' || !Number.isFinite(p.r0) || p.r0 <= 0) return 'R₀は正の数値を入力してください';
  if (!Array.isArray(p.solventIds) || p.solventIds.length === 0) return '溶媒を1つ以上指定してください';
  return null;
}

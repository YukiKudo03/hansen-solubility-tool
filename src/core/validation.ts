/**
 * バリデーション関数（純粋関数）
 * エラーがある場合はメッセージ文字列を返し、有効な場合はnullを返す
 */
import type { RiskThresholds } from './types';

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

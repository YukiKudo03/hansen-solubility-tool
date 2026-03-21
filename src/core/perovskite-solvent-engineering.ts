/**
 * ペロブスカイト溶媒設計
 *
 * 前駆体HSPに対するREDで溶媒の役割を識別:
 * - RED < 1: ProcessingSolvent（良溶媒）
 * - 1 ≤ RED ≤ 1.5: Intermediate（中間）
 * - RED > 1.5: AntiSolvent（アンチソルベント）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 溶媒の役割 */
export enum SolventRole {
  ProcessingSolvent = 'ProcessingSolvent',
  Intermediate = 'Intermediate',
  AntiSolvent = 'AntiSolvent',
}

/** 溶媒役割情報 */
export interface SolventRoleInfo {
  role: SolventRole;
  label: string;
  description: string;
  color: string;
}

const SOLVENT_ROLE_INFO: Record<SolventRole, SolventRoleInfo> = {
  [SolventRole.ProcessingSolvent]: {
    role: SolventRole.ProcessingSolvent,
    label: '良溶媒',
    description: 'RED < 1: 前駆体を溶解する処理溶媒',
    color: 'green',
  },
  [SolventRole.Intermediate]: {
    role: SolventRole.Intermediate,
    label: '中間',
    description: '1 ≤ RED ≤ 1.5: 良溶媒・アンチソルベントの中間',
    color: 'yellow',
  },
  [SolventRole.AntiSolvent]: {
    role: SolventRole.AntiSolvent,
    label: 'アンチソルベント',
    description: 'RED > 1.5: 結晶化促進用溶媒',
    color: 'blue',
  },
};

/** ペロブスカイト溶媒スクリーニング結果（個別） */
export interface PerovskiteSolventResult {
  solvent: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  role: SolventRole;
}

/**
 * RED値から溶媒の役割を判定する
 */
export function classifySolventRole(red: number): SolventRole {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < 1.0) return SolventRole.ProcessingSolvent;
  if (red <= 1.5) return SolventRole.Intermediate;
  return SolventRole.AntiSolvent;
}

/**
 * 溶媒役割の表示情報を取得する
 */
export function getSolventRoleInfo(role: SolventRole): SolventRoleInfo {
  return SOLVENT_ROLE_INFO[role];
}

/**
 * ペロブスカイト前駆体に対する溶媒スクリーニング
 *
 * @param precursorHSP - 前駆体のHSP
 * @param r0 - 前駆体の相互作用半径
 * @param solvents - 候補溶媒リスト
 * @returns スクリーニング結果（RED昇順ソート）
 */
export function screenPerovskiteSolvents(
  precursorHSP: HSPValues,
  r0: number,
  solvents: Array<{ name: string; hsp: HSPValues }>,
): PerovskiteSolventResult[] {
  const results: PerovskiteSolventResult[] = solvents.map((solvent) => {
    const ra = calculateRa(precursorHSP, solvent.hsp);
    const red = calculateRed(precursorHSP, solvent.hsp, r0);
    const role = classifySolventRole(red);
    return { solvent: { name: solvent.name, hsp: solvent.hsp }, ra, red, role };
  });

  results.sort((a, b) => a.red - b.red);
  return results;
}

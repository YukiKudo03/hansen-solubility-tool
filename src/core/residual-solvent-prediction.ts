/**
 * 残留溶媒予測
 *
 * RED値に基づいて、膜（フィルム）中に残留する溶媒リスクを評価する。
 * RED大 → 残留しにくい（溶媒が膜から逃げやすい）
 * RED小 → 残留リスク高
 * RED < 0.7: HighResidual（残留リスク高）
 * 0.7 <= RED < 1.0: ModerateResidual（中程度の残留リスク）
 * RED >= 1.0: LowResidual（残留リスク低い）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 残留溶媒レベル */
export enum ResidualLevel {
  HighResidual = 'HighResidual',
  ModerateResidual = 'ModerateResidual',
  LowResidual = 'LowResidual',
}

/** 残留溶媒閾値 */
export interface ResidualThresholds {
  highResidualMax: number;     // default: 0.7
  moderateResidualMax: number; // default: 1.0
}

/** デフォルト閾値 */
export const DEFAULT_RESIDUAL_THRESHOLDS: ResidualThresholds = {
  highResidualMax: 0.7,
  moderateResidualMax: 1.0,
};

/** 残留溶媒レベル情報 */
export interface ResidualLevelInfo {
  level: ResidualLevel;
  label: string;
  description: string;
  color: string;
}

const RESIDUAL_LEVEL_INFO: Record<ResidualLevel, ResidualLevelInfo> = {
  [ResidualLevel.HighResidual]: {
    level: ResidualLevel.HighResidual,
    label: '残留リスク高',
    description: '溶媒が膜内に残留しやすい',
    color: 'red',
  },
  [ResidualLevel.ModerateResidual]: {
    level: ResidualLevel.ModerateResidual,
    label: '中程度',
    description: '条件により残留する可能性がある',
    color: 'yellow',
  },
  [ResidualLevel.LowResidual]: {
    level: ResidualLevel.LowResidual,
    label: '残留リスク低',
    description: '溶媒が膜から脱離しやすい',
    color: 'green',
  },
};

/**
 * RED値から残留溶媒レベルを判定する
 * RED小=残留しやすい, RED大=残留しにくい
 */
export function classifyResidual(
  red: number,
  thresholds: ResidualThresholds = DEFAULT_RESIDUAL_THRESHOLDS,
): ResidualLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.highResidualMax) return ResidualLevel.HighResidual;
  if (red < thresholds.moderateResidualMax) return ResidualLevel.ModerateResidual;
  return ResidualLevel.LowResidual;
}

/**
 * 残留溶媒レベルの表示情報を取得する
 */
export function getResidualLevelInfo(level: ResidualLevel): ResidualLevelInfo {
  return RESIDUAL_LEVEL_INFO[level];
}

/** 残留溶媒予測結果 */
export interface ResidualSolventResult {
  solvent: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  residualLevel: ResidualLevel;
}

/**
 * 膜（フィルム）に対する残留溶媒リスクを予測する
 *
 * @param filmHSP - 膜のHSP値
 * @param filmR0 - 膜の相互作用半径
 * @param solvents - 候補溶媒リスト
 * @param thresholds - 残留溶媒閾値（省略時デフォルト）
 * @returns 予測結果（RED昇順ソート済み=残留リスクの高い順）
 */
export function predictResidualSolvent(
  filmHSP: HSPValues,
  filmR0: number,
  solvents: Array<{ name: string; hsp: HSPValues }>,
  thresholds: ResidualThresholds = DEFAULT_RESIDUAL_THRESHOLDS,
): ResidualSolventResult[] {
  const results: ResidualSolventResult[] = solvents.map((solvent) => {
    const ra = calculateRa(filmHSP, solvent.hsp);
    const red = calculateRed(filmHSP, solvent.hsp, filmR0);
    const residualLevel = classifyResidual(red, thresholds);
    return { solvent: { name: solvent.name, hsp: solvent.hsp }, ra, red, residualLevel };
  });

  // RED昇順ソート（残留リスク高い順）
  results.sort((a, b) => a.red - b.red);
  return results;
}

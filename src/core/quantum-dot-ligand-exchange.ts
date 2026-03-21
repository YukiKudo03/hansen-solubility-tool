/**
 * 量子ドットリガンド交換溶媒スクリーニング
 *
 * QDのHSP球に対してRED計算。RED小 → 良い交換溶媒（分散安定性維持）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** リガンド交換適合性レベル */
export enum LigandExchangeLevel {
  Excellent = 1, // RED < 0.5
  Good = 2,      // 0.5 ≤ RED < 0.8
  Fair = 3,      // 0.8 ≤ RED < 1.0
  Poor = 4,      // 1.0 ≤ RED < 1.5
  Bad = 5,       // RED ≥ 1.5
}

/** 閾値設定 */
export interface LigandExchangeThresholds {
  excellentMax: number; // default: 0.5
  goodMax: number;      // default: 0.8
  fairMax: number;      // default: 1.0
  poorMax: number;      // default: 1.5
}

export const DEFAULT_LIGAND_EXCHANGE_THRESHOLDS: LigandExchangeThresholds = {
  excellentMax: 0.5,
  goodMax: 0.8,
  fairMax: 1.0,
  poorMax: 1.5,
};

/** 溶媒入力 */
export interface LigandExchangeSolventInput {
  name: string;
  hsp: HSPValues;
}

/** スクリーニング結果 */
export interface LigandExchangeResult {
  solventName: string;
  solventHSP: HSPValues;
  ra: number;
  red: number;
  level: LigandExchangeLevel;
}

/** レベル表示情報 */
export interface LigandExchangeLevelInfo {
  level: LigandExchangeLevel;
  label: string;
  description: string;
  color: string;
}

const LEVEL_INFO: Record<LigandExchangeLevel, LigandExchangeLevelInfo> = {
  [LigandExchangeLevel.Excellent]: { level: LigandExchangeLevel.Excellent, label: '優秀', description: '最適な交換溶媒', color: 'green' },
  [LigandExchangeLevel.Good]: { level: LigandExchangeLevel.Good, label: '良好', description: '良好な交換溶媒', color: 'teal' },
  [LigandExchangeLevel.Fair]: { level: LigandExchangeLevel.Fair, label: '可能', description: '境界付近', color: 'yellow' },
  [LigandExchangeLevel.Poor]: { level: LigandExchangeLevel.Poor, label: '不良', description: '分散不安定の恐れ', color: 'orange' },
  [LigandExchangeLevel.Bad]: { level: LigandExchangeLevel.Bad, label: '不適', description: '交換溶媒として不適', color: 'red' },
};

export function getLigandExchangeLevelInfo(level: LigandExchangeLevel): LigandExchangeLevelInfo {
  return LEVEL_INFO[level];
}

export function classifyLigandExchange(
  red: number,
  thresholds: LigandExchangeThresholds = DEFAULT_LIGAND_EXCHANGE_THRESHOLDS,
): LigandExchangeLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.excellentMax) return LigandExchangeLevel.Excellent;
  if (red < thresholds.goodMax) return LigandExchangeLevel.Good;
  if (red < thresholds.fairMax) return LigandExchangeLevel.Fair;
  if (red < thresholds.poorMax) return LigandExchangeLevel.Poor;
  return LigandExchangeLevel.Bad;
}

/**
 * QDリガンド交換溶媒スクリーニング
 *
 * @param qdHSP - QDのHSP
 * @param qdR0 - QDの相互作用半径
 * @param solvents - 候補溶媒リスト
 * @returns RED昇順ソート（適合性が高い順）
 */
export function screenQDLigandExchangeSolvents(
  qdHSP: HSPValues,
  qdR0: number,
  solvents: LigandExchangeSolventInput[],
  thresholds: LigandExchangeThresholds = DEFAULT_LIGAND_EXCHANGE_THRESHOLDS,
): LigandExchangeResult[] {
  const results: LigandExchangeResult[] = solvents.map((s) => {
    const ra = calculateRa(qdHSP, s.hsp);
    const red = calculateRed(qdHSP, s.hsp, qdR0);
    const level = classifyLigandExchange(red, thresholds);
    return { solventName: s.name, solventHSP: s.hsp, ra, red, level };
  });
  results.sort((a, b) => a.red - b.red);
  return results;
}

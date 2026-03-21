/**
 * PCM（相変化材料）カプセル化スクリーニング
 *
 * RED大 → カプセル安定（壁材がPCMを透過させない）
 * fragrance-encapsulation と同じ「RED大=良好」方向。
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** カプセル安定性レベル */
export enum PCMEncapsulationLevel {
  Poor = 1,      // RED < 1.0 — 壁材がPCMを透過しやすい
  Good = 2,      // 1.0 ≤ RED < 1.5
  Excellent = 3, // RED ≥ 1.5 — 壁材がPCMを強く閉じ込める
}

export interface PCMEncapsulationThresholds {
  poorMax: number; // default: 1.0
  goodMax: number; // default: 1.5
}

export const DEFAULT_PCM_ENCAPSULATION_THRESHOLDS: PCMEncapsulationThresholds = {
  poorMax: 1.0,
  goodMax: 1.5,
};

export interface ShellMaterialInput {
  name: string;
  hsp: HSPValues;
}

export interface PCMEncapsulationResult {
  shellMaterialName: string;
  shellMaterialHSP: HSPValues;
  ra: number;
  red: number;
  level: PCMEncapsulationLevel;
}

export interface PCMEncapsulationLevelInfo {
  level: PCMEncapsulationLevel;
  label: string;
  description: string;
  color: string;
}

const LEVEL_INFO: Record<PCMEncapsulationLevel, PCMEncapsulationLevelInfo> = {
  [PCMEncapsulationLevel.Poor]: { level: PCMEncapsulationLevel.Poor, label: '不良', description: '壁材がPCMを透過しやすい', color: 'red' },
  [PCMEncapsulationLevel.Good]: { level: PCMEncapsulationLevel.Good, label: '良好', description: 'カプセル化がある程度安定', color: 'yellow' },
  [PCMEncapsulationLevel.Excellent]: { level: PCMEncapsulationLevel.Excellent, label: '優秀', description: '壁材がPCMを強く閉じ込める', color: 'green' },
};

export function getPCMEncapsulationLevelInfo(level: PCMEncapsulationLevel): PCMEncapsulationLevelInfo {
  return LEVEL_INFO[level];
}

export function classifyPCMEncapsulation(
  red: number,
  thresholds: PCMEncapsulationThresholds = DEFAULT_PCM_ENCAPSULATION_THRESHOLDS,
): PCMEncapsulationLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.poorMax) return PCMEncapsulationLevel.Poor;
  if (red < thresholds.goodMax) return PCMEncapsulationLevel.Good;
  return PCMEncapsulationLevel.Excellent;
}

/**
 * PCMカプセル化シェル材スクリーニング
 *
 * @param pcmHSP - PCMのHSP
 * @param pcmR0 - PCMの相互作用半径
 * @param shellMaterials - 候補シェル材リスト
 * @returns RED降順（カプセル安定性が高い順）
 */
export function screenPCMEncapsulation(
  pcmHSP: HSPValues,
  pcmR0: number,
  shellMaterials: ShellMaterialInput[],
  thresholds: PCMEncapsulationThresholds = DEFAULT_PCM_ENCAPSULATION_THRESHOLDS,
): PCMEncapsulationResult[] {
  const results: PCMEncapsulationResult[] = shellMaterials.map((s) => {
    const ra = calculateRa(pcmHSP, s.hsp);
    const red = calculateRed(pcmHSP, s.hsp, pcmR0);
    const level = classifyPCMEncapsulation(red, thresholds);
    return { shellMaterialName: s.name, shellMaterialHSP: s.hsp, ra, red, level };
  });
  // RED降順（カプセル安定性が高い順）
  results.sort((a, b) => b.red - a.red);
  return results;
}

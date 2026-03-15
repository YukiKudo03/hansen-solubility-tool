/**
 * 薬物溶解性予測の分類・スクリーニングロジック
 */
import { DrugSolubilityLevel } from './types';
import type { Drug, Solvent, DrugSolubilityThresholds, DrugSolubilityResult, DrugSolubilityScreeningResult } from './types';
import { calculateRa, calculateRed } from './hsp';

export const DEFAULT_DRUG_SOLUBILITY_THRESHOLDS: DrugSolubilityThresholds = {
  excellentMax: 0.5, goodMax: 0.8, partialMax: 1.0, poorMax: 1.5,
};

export interface DrugSolubilityLevelInfo {
  level: DrugSolubilityLevel;
  label: string;
  description: string;
  color: string;
}

const DRUG_SOLUBILITY_LEVEL_INFO: Record<DrugSolubilityLevel, DrugSolubilityLevelInfo> = {
  [DrugSolubilityLevel.Excellent]: { level: DrugSolubilityLevel.Excellent, label: '優秀', description: '非常に高い溶解性が期待できる', color: 'green' },
  [DrugSolubilityLevel.Good]: { level: DrugSolubilityLevel.Good, label: '良好', description: '良好な溶解性が期待できる', color: 'teal' },
  [DrugSolubilityLevel.Partial]: { level: DrugSolubilityLevel.Partial, label: '部分的', description: '部分的に溶解（条件次第）', color: 'yellow' },
  [DrugSolubilityLevel.Poor]: { level: DrugSolubilityLevel.Poor, label: '不良', description: '溶解性が低い', color: 'orange' },
  [DrugSolubilityLevel.Insoluble]: { level: DrugSolubilityLevel.Insoluble, label: '不溶', description: '溶解しない', color: 'red' },
};

export function classifyDrugSolubility(red: number, thresholds: DrugSolubilityThresholds = DEFAULT_DRUG_SOLUBILITY_THRESHOLDS): DrugSolubilityLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.excellentMax) return DrugSolubilityLevel.Excellent;
  if (red < thresholds.goodMax) return DrugSolubilityLevel.Good;
  if (red < thresholds.partialMax) return DrugSolubilityLevel.Partial;
  if (red < thresholds.poorMax) return DrugSolubilityLevel.Poor;
  return DrugSolubilityLevel.Insoluble;
}

export function getDrugSolubilityLevelInfo(level: DrugSolubilityLevel): DrugSolubilityLevelInfo {
  return DRUG_SOLUBILITY_LEVEL_INFO[level];
}

export function screenDrugSolvents(drug: Drug, solvents: Solvent[], thresholds: DrugSolubilityThresholds = DEFAULT_DRUG_SOLUBILITY_THRESHOLDS): DrugSolubilityScreeningResult {
  const results: DrugSolubilityResult[] = solvents.map((solvent) => {
    const ra = calculateRa(drug.hsp, solvent.hsp);
    const red = calculateRed(drug.hsp, solvent.hsp, drug.r0);
    const solubility = classifyDrugSolubility(red, thresholds);
    return { drug, solvent, ra, red, solubility };
  });
  results.sort((a, b) => a.red - b.red);
  return { drug, results, evaluatedAt: new Date(), thresholdsUsed: thresholds };
}

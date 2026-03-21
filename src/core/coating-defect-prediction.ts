/**
 * コーティング欠陥予測
 *
 * Ra(coating-substrate) 大 → 密着不良リスク
 * Ra(coating-solvent) 小 + 高蒸発速度 → Marangoni効果リスク
 *
 * DefectRisk: High / Moderate / Low
 */
import type { HSPValues } from './types';
import { calculateRa } from './hsp';

/** 欠陥リスクレベル */
export enum DefectRisk {
  High = 'High',
  Moderate = 'Moderate',
  Low = 'Low',
}

/** 欠陥リスク情報 */
export interface DefectRiskInfo {
  level: DefectRisk;
  label: string;
  description: string;
  color: string;
}

const DEFECT_RISK_INFO: Record<DefectRisk, DefectRiskInfo> = {
  [DefectRisk.High]: {
    level: DefectRisk.High,
    label: '欠陥リスク高',
    description: '密着不良またはMarangoni効果のリスクが高い',
    color: 'red',
  },
  [DefectRisk.Moderate]: {
    level: DefectRisk.Moderate,
    label: '中程度',
    description: '条件次第で欠陥が発生する可能性がある',
    color: 'yellow',
  },
  [DefectRisk.Low]: {
    level: DefectRisk.Low,
    label: '欠陥リスク低',
    description: '良好な塗膜品質が期待できる',
    color: 'green',
  },
};

/** 欠陥リスク閾値 */
export interface DefectThresholds {
  /** Ra(coating-substrate) がこの値以上なら密着不良リスク */
  adhesionRaThreshold: number; // default: 8.0
  /** Ra(coating-solvent) がこの値以下ならMarangoniリスク */
  marangoniRaThreshold: number; // default: 3.0
}

/** デフォルト閾値 */
export const DEFAULT_DEFECT_THRESHOLDS: DefectThresholds = {
  adhesionRaThreshold: 8.0,
  marangoniRaThreshold: 3.0,
};

/** コーティング欠陥予測結果 */
export interface CoatingDefectResult {
  raCoatingSubstrate: number;
  raCoatingSolvent: number;
  adhesionRisk: boolean;
  marangoniRisk: boolean;
  defectRisk: DefectRisk;
}

/**
 * 欠陥リスクの表示情報を取得する
 */
export function getDefectRiskInfo(level: DefectRisk): DefectRiskInfo {
  return DEFECT_RISK_INFO[level];
}

/**
 * コーティング欠陥を予測する
 *
 * @param coatingHSP - コーティング材のHSP
 * @param substrateHSP - 基材のHSP
 * @param solventHSP - 溶媒のHSP
 * @param thresholds - 欠陥閾値（省略時デフォルト）
 * @returns 欠陥予測結果
 */
export function predictCoatingDefects(
  coatingHSP: HSPValues,
  substrateHSP: HSPValues,
  solventHSP: HSPValues,
  thresholds: DefectThresholds = DEFAULT_DEFECT_THRESHOLDS,
): CoatingDefectResult {
  const raCoatingSubstrate = calculateRa(coatingHSP, substrateHSP);
  const raCoatingSolvent = calculateRa(coatingHSP, solventHSP);

  const adhesionRisk = raCoatingSubstrate >= thresholds.adhesionRaThreshold;
  const marangoniRisk = raCoatingSolvent <= thresholds.marangoniRaThreshold;

  let defectRisk: DefectRisk;
  if (adhesionRisk && marangoniRisk) {
    defectRisk = DefectRisk.High;
  } else if (adhesionRisk || marangoniRisk) {
    defectRisk = DefectRisk.Moderate;
  } else {
    defectRisk = DefectRisk.Low;
  }

  return {
    raCoatingSubstrate,
    raCoatingSolvent,
    adhesionRisk,
    marangoniRisk,
    defectRisk,
  };
}

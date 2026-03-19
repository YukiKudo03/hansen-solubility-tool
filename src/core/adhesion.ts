/**
 * 接着性予測 — 接着剤/基材ペアのHSP距離による接着強度予測
 * Ra小 = 接着性良好（HSP類似度が高い）
 * ※ 接着性は相互作用半径の概念を使わず、Ra値を直接使用する
 */

/** 接着性レベル (1=最良, 5=接着不可) — Ra小=接着性良好 */
export enum AdhesionLevel {
  Excellent = 1, // 優秀な接着性
  Good = 2,      // 良好
  Fair = 3,      // 可能
  Poor = 4,      // 接着不良
  Failed = 5,    // 接着不可
}

/** 接着性閾値設定 (Ra値ベース) */
export interface AdhesionThresholds {
  excellentMax: number; // default: 2.0
  goodMax: number;      // default: 4.0
  fairMax: number;      // default: 6.0
  poorMax: number;      // default: 8.0
}

export const DEFAULT_ADHESION_THRESHOLDS: AdhesionThresholds = {
  excellentMax: 2.0,
  goodMax: 4.0,
  fairMax: 6.0,
  poorMax: 8.0,
};

export interface AdhesionLevelInfo {
  level: AdhesionLevel;
  label: string;
  description: string;
  color: string;
}

const ADHESION_LEVEL_INFO: Record<AdhesionLevel, AdhesionLevelInfo> = {
  [AdhesionLevel.Excellent]: { level: AdhesionLevel.Excellent, label: '優秀', description: '優秀な接着性が期待できる', color: 'green' },
  [AdhesionLevel.Good]: { level: AdhesionLevel.Good, label: '良好', description: '良好な接着性', color: 'teal' },
  [AdhesionLevel.Fair]: { level: AdhesionLevel.Fair, label: '可能', description: '条件次第で接着可能', color: 'yellow' },
  [AdhesionLevel.Poor]: { level: AdhesionLevel.Poor, label: '不良', description: '接着不良の可能性が高い', color: 'orange' },
  [AdhesionLevel.Failed]: { level: AdhesionLevel.Failed, label: '不可', description: '接着不可', color: 'red' },
};

/**
 * Ra値から接着性レベルを分類する
 * @throws {Error} Ra値が負の場合
 */
export function classifyAdhesion(ra: number, thresholds: AdhesionThresholds = DEFAULT_ADHESION_THRESHOLDS): AdhesionLevel {
  if (ra < 0) throw new Error('Ra値は非負でなければなりません');
  if (ra < thresholds.excellentMax) return AdhesionLevel.Excellent;
  if (ra < thresholds.goodMax) return AdhesionLevel.Good;
  if (ra < thresholds.fairMax) return AdhesionLevel.Fair;
  if (ra < thresholds.poorMax) return AdhesionLevel.Poor;
  return AdhesionLevel.Failed;
}

/**
 * 接着性レベルの表示情報を取得する
 */
export function getAdhesionLevelInfo(level: AdhesionLevel): AdhesionLevelInfo {
  return ADHESION_LEVEL_INFO[level];
}

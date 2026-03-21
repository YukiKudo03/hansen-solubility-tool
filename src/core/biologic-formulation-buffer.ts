/**
 * バイオ医薬品バッファー選定
 *
 * RED値に基づいて、バイオ医薬品（タンパク質製剤）のバッファー適合性を評価する。
 * 会合液体補正（水系バッファーの温度依存性）を統合。
 *
 * RED < 0.6: Excellent（優秀な安定性）
 * 0.6 <= RED < 0.9: Good（良好）
 * 0.9 <= RED < 1.2: Marginal（境界的）
 * RED >= 1.2: Poor（不良）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';
import { correctDeltaHAssociating, isAssociatingLiquid } from './associating-liquid-correction';

/** バッファー安定性レベル */
export enum BufferStabilityLevel {
  Excellent = 'Excellent',
  Good = 'Good',
  Marginal = 'Marginal',
  Poor = 'Poor',
}

/** バッファー安定性閾値 */
export interface BufferStabilityThresholds {
  excellentMax: number;  // default: 0.6
  goodMax: number;       // default: 0.9
  marginalMax: number;   // default: 1.2
}

/** デフォルト閾値 */
export const DEFAULT_BUFFER_STABILITY_THRESHOLDS: BufferStabilityThresholds = {
  excellentMax: 0.6,
  goodMax: 0.9,
  marginalMax: 1.2,
};

/** バッファー安定性レベル情報 */
export interface BufferStabilityLevelInfo {
  level: BufferStabilityLevel;
  label: string;
  description: string;
  color: string;
}

const BUFFER_STABILITY_LEVEL_INFO: Record<BufferStabilityLevel, BufferStabilityLevelInfo> = {
  [BufferStabilityLevel.Excellent]: {
    level: BufferStabilityLevel.Excellent,
    label: '優秀',
    description: '最適なバッファー適合性',
    color: 'green',
  },
  [BufferStabilityLevel.Good]: {
    level: BufferStabilityLevel.Good,
    label: '良好',
    description: '実用可能な安定性',
    color: 'blue',
  },
  [BufferStabilityLevel.Marginal]: {
    level: BufferStabilityLevel.Marginal,
    label: '境界的',
    description: '条件最適化が必要',
    color: 'yellow',
  },
  [BufferStabilityLevel.Poor]: {
    level: BufferStabilityLevel.Poor,
    label: '不良',
    description: '凝集・変性リスクが高い',
    color: 'red',
  },
};

/**
 * RED値からバッファー安定性レベルを判定する
 */
export function classifyBufferStability(
  red: number,
  thresholds: BufferStabilityThresholds = DEFAULT_BUFFER_STABILITY_THRESHOLDS,
): BufferStabilityLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.excellentMax) return BufferStabilityLevel.Excellent;
  if (red < thresholds.goodMax) return BufferStabilityLevel.Good;
  if (red < thresholds.marginalMax) return BufferStabilityLevel.Marginal;
  return BufferStabilityLevel.Poor;
}

/**
 * バッファー安定性レベルの表示情報を取得する
 */
export function getBufferStabilityLevelInfo(level: BufferStabilityLevel): BufferStabilityLevelInfo {
  return BUFFER_STABILITY_LEVEL_INFO[level];
}

/** バッファースクリーニング個別結果 */
export interface BufferScreeningResult {
  buffer: { name: string; hsp: HSPValues; correctedHSP?: HSPValues };
  ra: number;
  red: number;
  stability: BufferStabilityLevel;
  associatingCorrectionApplied: boolean;
}

/**
 * タンパク質製剤に対するバッファー群の適合性をスクリーニングする
 *
 * @param proteinHSP - タンパク質のHSP値
 * @param proteinR0 - タンパク質の相互作用半径
 * @param buffers - バッファーリスト（nameが会合性液体名に一致すれば補正適用）
 * @param temperature - 評価温度 [K]（省略時298.15K=25°C）
 * @param thresholds - 安定性閾値（省略時デフォルト）
 * @returns スクリーニング結果（RED昇順ソート済み）
 */
export function screenBiologicBuffers(
  proteinHSP: HSPValues,
  proteinR0: number,
  buffers: Array<{ name: string; hsp: HSPValues }>,
  temperature: number = 298.15,
  thresholds: BufferStabilityThresholds = DEFAULT_BUFFER_STABILITY_THRESHOLDS,
): BufferScreeningResult[] {
  const results: BufferScreeningResult[] = buffers.map((buffer) => {
    let effectiveHSP = buffer.hsp;
    let associatingCorrectionApplied = false;
    let correctedHSP: HSPValues | undefined;

    // 会合性液体の場合、dHを温度補正する
    if (isAssociatingLiquid(buffer.name)) {
      const correctedDeltaH = correctDeltaHAssociating(
        buffer.hsp.deltaH,
        temperature,
        298.15,
        buffer.name,
      );
      correctedHSP = {
        deltaD: buffer.hsp.deltaD,
        deltaP: buffer.hsp.deltaP,
        deltaH: correctedDeltaH,
      };
      effectiveHSP = correctedHSP;
      associatingCorrectionApplied = true;
    }

    const ra = calculateRa(proteinHSP, effectiveHSP);
    const red = calculateRed(proteinHSP, effectiveHSP, proteinR0);
    const stability = classifyBufferStability(red, thresholds);

    return {
      buffer: { name: buffer.name, hsp: buffer.hsp, correctedHSP },
      ra,
      red,
      stability,
      associatingCorrectionApplied,
    };
  });

  // RED昇順ソート（適合性良好→不良の順）
  results.sort((a, b) => a.red - b.red);
  return results;
}

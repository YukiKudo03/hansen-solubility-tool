/**
 * フォトレジスト現像液適合性
 *
 * calculateDissolutionContrastを直接使用して
 * 露光/未露光レジストと現像液の溶解コントラストを評価する。
 */
import type { HSPValues } from './types';
import { calculateDissolutionContrast, classifyContrastQuality, ContrastQuality } from './dissolution-contrast';

/** フォトレジスト現像液評価結果 */
export interface PhotoresistDeveloperResult {
  unexposedHSP: HSPValues;
  exposedHSP: HSPValues;
  developerHSP: HSPValues;
  contrast: number;
  quality: ContrastQuality;
}

/**
 * フォトレジスト現像液の適合性を評価する
 *
 * @param unexposedHSP - 未露光レジストのHSP
 * @param exposedHSP - 露光後レジストのHSP
 * @param developerHSP - 現像液のHSP
 * @returns 評価結果
 */
export function evaluatePhotoresistDeveloper(
  unexposedHSP: HSPValues,
  exposedHSP: HSPValues,
  developerHSP: HSPValues,
): PhotoresistDeveloperResult {
  const contrast = calculateDissolutionContrast(unexposedHSP, exposedHSP, developerHSP);
  const quality = classifyContrastQuality(contrast);

  return {
    unexposedHSP,
    exposedHSP,
    developerHSP,
    contrast,
    quality,
  };
}

/** ContrastQualityの表示情報 */
export interface ContrastQualityInfo {
  quality: ContrastQuality;
  label: string;
  description: string;
  color: string;
}

const CONTRAST_QUALITY_INFO: Record<ContrastQuality, ContrastQualityInfo> = {
  [ContrastQuality.Excellent]: {
    quality: ContrastQuality.Excellent,
    label: '高解像度',
    description: 'コントラスト > 0.5: 高解像度パターンが可能',
    color: 'green',
  },
  [ContrastQuality.Good]: {
    quality: ContrastQuality.Good,
    label: '実用レベル',
    description: '0.2 ≤ コントラスト ≤ 0.5: 実用パターニング',
    color: 'blue',
  },
  [ContrastQuality.Poor]: {
    quality: ContrastQuality.Poor,
    label: '低解像度',
    description: '0 < コントラスト < 0.2: 解像度不十分',
    color: 'yellow',
  },
  [ContrastQuality.Inverted]: {
    quality: ContrastQuality.Inverted,
    label: '反転（ネガ型）',
    description: 'コントラスト < 0: ネガ型動作',
    color: 'red',
  },
};

/**
 * コントラスト品質の表示情報を取得する
 */
export function getContrastQualityInfo(quality: ContrastQuality): ContrastQualityInfo {
  return CONTRAST_QUALITY_INFO[quality];
}

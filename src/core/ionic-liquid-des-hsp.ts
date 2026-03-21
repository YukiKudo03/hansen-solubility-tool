/**
 * イオン液体/DES（深共晶溶媒）HSP推定
 *
 * カチオンとアニオンのHSPをモル比で加重平均し、
 * 必要に応じてassociating-liquid-correctionで温度補正。
 * 基本はmixture.tsのcalculateMixture類似の加重平均。
 */
import type { HSPValues } from './types';
import { correctDeltaHAssociating } from './associating-liquid-correction';

/** イオン液体HSP推定入力 */
export interface ILComponentInput {
  name: string;
  hsp: HSPValues;
}

/** 推定結果 */
export interface ILHSPEstimationResult {
  blendHSP: HSPValues;
  cationHSP: HSPValues;
  anionHSP: HSPValues;
  cationRatio: number;
  anionRatio: number;
  temperatureCorrected: boolean;
  temperature?: number;
  evaluatedAt: Date;
}

/**
 * モル比からHSPの加重平均を計算する
 */
function blendHSP(hsp1: HSPValues, hsp2: HSPValues, ratio1: number, ratio2: number): HSPValues {
  const total = ratio1 + ratio2;
  if (total <= 0) throw new Error('比率の合計は正の値でなければなりません');
  const f1 = ratio1 / total;
  const f2 = ratio2 / total;

  return {
    deltaD: f1 * hsp1.deltaD + f2 * hsp2.deltaD,
    deltaP: f1 * hsp1.deltaP + f2 * hsp2.deltaP,
    deltaH: f1 * hsp1.deltaH + f2 * hsp2.deltaH,
  };
}

/**
 * イオン液体/DES のHSPを推定する
 *
 * @param cationHSP - カチオンのHSP値
 * @param anionHSP - アニオンのHSP値
 * @param ratio - カチオン:アニオンのモル比 [cation, anion]（デフォルト: [1,1]）
 * @param temperature - 目標温度 [K]（未指定なら補正なし）
 * @param referenceTemp - 基準温度 [K]（デフォルト: 298.15）
 * @returns 推定されたHSP値
 */
export function estimateILHSP(
  cationHSP: HSPValues,
  anionHSP: HSPValues,
  ratio: [number, number] = [1, 1],
  temperature?: number,
  referenceTemp: number = 298.15,
): ILHSPEstimationResult {
  if (ratio[0] <= 0 || ratio[1] <= 0) {
    throw new Error('比率は正の値でなければなりません');
  }

  const blend = blendHSP(cationHSP, anionHSP, ratio[0], ratio[1]);

  let temperatureCorrected = false;
  if (temperature !== undefined && Math.abs(temperature - referenceTemp) > 0.01) {
    // dH成分のみ温度補正（会合性液体モデルのフォールバック使用）
    blend.deltaH = correctDeltaHAssociating(blend.deltaH, temperature, referenceTemp);
    temperatureCorrected = true;
  }

  return {
    blendHSP: blend,
    cationHSP,
    anionHSP,
    cationRatio: ratio[0],
    anionRatio: ratio[1],
    temperatureCorrected,
    temperature,
    evaluatedAt: new Date(),
  };
}

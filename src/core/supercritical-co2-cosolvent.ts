/**
 * 超臨界CO2共溶媒選定
 *
 * 超臨界CO2単独では極性・水素結合力が弱いため、
 * エタノール等の共溶媒を添加して溶解力を向上させる。
 *
 * アルゴリズム:
 * 1. estimateCO2HSPでCO2のHSPを圧力・温度から算出
 * 2. CO2+共溶媒のブレンドHSP（体積分率加算）
 * 3. ターゲットとのRa/RED計算
 * 4. 結果を共溶媒分率ごとにスクリーニング
 *
 * 参考文献:
 * - Williams, Martin (2002) Ind. Eng. Chem. Res. 41:4927
 * - Hansen (2007) Chapter 5
 */

import type { HSPValues } from './types';
import { estimateCO2HSP } from './pressure-hsp';
import { calculateRa } from './hsp';

/** 共溶媒候補の入力 */
export interface CosolventCandidate {
  name: string;
  hsp: HSPValues;
}

/** 単一共溶媒の評価結果 */
export interface CosolventResult {
  cosolventName: string;
  cosolventHSP: HSPValues;
  volumeFraction: number;
  blendHSP: HSPValues;
  ra: number;
  red: number;
}

/** 超臨界CO2共溶媒スクリーニング全体結果 */
export interface SCCO2CosolventScreeningResult {
  targetHSP: HSPValues;
  targetR0: number;
  co2HSP: HSPValues;
  co2Density: number;
  pressure: number;
  temperature: number;
  results: CosolventResult[];
  evaluatedAt: Date;
}

/** デフォルトの共溶媒体積分率リスト */
export const DEFAULT_COSOLVENT_FRACTIONS = [0.01, 0.03, 0.05, 0.10, 0.15, 0.20];

/**
 * CO2+共溶媒のブレンドHSPを計算する（体積分率加算）
 *
 * @param co2HSP - CO2のHSP
 * @param cosolventHSP - 共溶媒のHSP
 * @param cosolventFraction - 共溶媒の体積分率 (0-1)
 * @returns ブレンドHSP
 */
export function blendCO2CosolventHSP(
  co2HSP: HSPValues,
  cosolventHSP: HSPValues,
  cosolventFraction: number,
): HSPValues {
  const co2Fraction = 1 - cosolventFraction;
  return {
    deltaD: co2Fraction * co2HSP.deltaD + cosolventFraction * cosolventHSP.deltaD,
    deltaP: co2Fraction * co2HSP.deltaP + cosolventFraction * cosolventHSP.deltaP,
    deltaH: co2Fraction * co2HSP.deltaH + cosolventFraction * cosolventHSP.deltaH,
  };
}

/**
 * 超臨界CO2共溶媒スクリーニング
 *
 * @param targetHSP - ターゲット物質のHSP
 * @param targetR0 - ターゲットの相互作用半径
 * @param pressure - 圧力 [MPa]
 * @param temperature - 温度 [K]
 * @param cosolvents - 共溶媒候補リスト
 * @param fractions - 評価する体積分率リスト (デフォルト: DEFAULT_COSOLVENT_FRACTIONS)
 * @returns スクリーニング結果
 */
export function screenSCCO2Cosolvents(
  targetHSP: HSPValues,
  targetR0: number,
  pressure: number,
  temperature: number,
  cosolvents: CosolventCandidate[],
  fractions: number[] = DEFAULT_COSOLVENT_FRACTIONS,
): SCCO2CosolventScreeningResult {
  if (targetR0 <= 0) throw new Error('R0は正の値でなければなりません');
  if (pressure <= 0) throw new Error('圧力は正の値でなければなりません');
  if (temperature <= 0) throw new Error('温度は正の値でなければなりません');
  if (cosolvents.length === 0) throw new Error('共溶媒候補を1つ以上指定してください');

  const co2Result = estimateCO2HSP(pressure, temperature);
  const co2HSP: HSPValues = {
    deltaD: co2Result.deltaD,
    deltaP: co2Result.deltaP,
    deltaH: co2Result.deltaH,
  };

  const results: CosolventResult[] = [];

  // CO2単独 (fraction=0) も評価
  {
    const ra = calculateRa(targetHSP, co2HSP);
    const red = ra / targetR0;
    results.push({
      cosolventName: 'CO2単独',
      cosolventHSP: co2HSP,
      volumeFraction: 0,
      blendHSP: { ...co2HSP },
      ra,
      red,
    });
  }

  // 各共溶媒×各分率
  for (const cosolvent of cosolvents) {
    for (const fraction of fractions) {
      if (fraction <= 0 || fraction >= 1) continue;
      const blendHSP = blendCO2CosolventHSP(co2HSP, cosolvent.hsp, fraction);
      const ra = calculateRa(targetHSP, blendHSP);
      const red = ra / targetR0;
      results.push({
        cosolventName: cosolvent.name,
        cosolventHSP: cosolvent.hsp,
        volumeFraction: fraction,
        blendHSP,
        ra,
        red,
      });
    }
  }

  // Ra昇順ソート
  results.sort((a, b) => a.ra - b.ra);

  return {
    targetHSP,
    targetR0,
    co2HSP,
    co2Density: co2Result.density,
    pressure,
    temperature,
    results,
    evaluatedAt: new Date(),
  };
}

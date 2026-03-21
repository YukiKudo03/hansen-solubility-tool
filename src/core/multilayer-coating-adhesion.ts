/**
 * 多層コーティング界面密着性評価
 *
 * 隣接層ペアごとにWa（接着仕事）を計算し、
 * 最弱界面を特定する。
 */

import type { HSPValues } from './types';
import { calculateWorkOfAdhesionFromHSP } from './work-of-adhesion';
import { calculateRa } from './hsp';

/** 層の定義 */
export interface CoatingLayer {
  name: string;
  hsp: HSPValues;
}

/** 界面評価結果 */
export interface InterfaceResult {
  layer1Name: string;
  layer2Name: string;
  wa: number;
  ra: number;
}

/** 多層コーティング評価結果 */
export interface MultilayerAdhesionResult {
  interfaceResults: InterfaceResult[];
  weakestInterface: InterfaceResult;
}

/**
 * 多層コーティングの界面密着性を評価する
 *
 * @param layers - コーティング層の配列（基材側から順）
 * @returns 各界面の評価結果と最弱界面
 * @throws {Error} 層が2つ未満の場合
 */
export function evaluateMultilayerAdhesion(
  layers: CoatingLayer[],
): MultilayerAdhesionResult {
  if (layers.length < 2) {
    throw new Error('多層評価には2層以上が必要です');
  }

  const interfaceResults: InterfaceResult[] = [];

  for (let i = 0; i < layers.length - 1; i++) {
    const layer1 = layers[i];
    const layer2 = layers[i + 1];
    const wa = calculateWorkOfAdhesionFromHSP(layer1.hsp, layer2.hsp);
    const ra = calculateRa(layer1.hsp, layer2.hsp);

    interfaceResults.push({
      layer1Name: layer1.name,
      layer2Name: layer2.name,
      wa,
      ra,
    });
  }

  // 最弱界面 = Waが最も小さい界面
  const weakestInterface = interfaceResults.reduce((min, current) =>
    current.wa < min.wa ? current : min,
  );

  return { interfaceResults, weakestInterface };
}

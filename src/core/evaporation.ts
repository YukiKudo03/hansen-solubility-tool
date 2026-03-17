/**
 * 混合溶媒の蒸発シミュレーション
 *
 * Antoine式で各成分の蒸気圧を計算し、Raoult則ベースで
 * 蒸発速度を推定。時間刻みで組成を更新しHSP(t)を計算する。
 */
import type { HSPValues } from './types';

export interface AntoineConstants {
  A: number;
  B: number;
  C: number;
}

export interface EvaporationComponent {
  casNumber: string;
  moleFraction: number;
  hsp: HSPValues;
}

export interface EvaporationResult {
  timeSteps: number[];
  hspTimeSeries: HSPValues[];
  compositionTimeSeries: number[][];  // [step][component]
  residualFractions: number[];
}

/**
 * Antoine定数テーブル（kPa単位、温度°C）
 * log₁₀(P/kPa) = A - B/(C+T)
 */
export const ANTOINE_CONSTANTS: Record<string, AntoineConstants> = {
  // 炭化水素
  '109-66-0': { A: 6.876, B: 1075.8, C: 233.2 },  // n-ペンタン
  '110-54-3': { A: 6.876, B: 1171.5, C: 224.4 },  // n-ヘキサン
  '110-82-7': { A: 6.841, B: 1201.5, C: 222.4 },  // シクロヘキサン
  '108-88-3': { A: 6.954, B: 1344.8, C: 219.5 },  // トルエン
  '71-43-2':  { A: 6.905, B: 1211.0, C: 220.8 },  // ベンゼン

  // ハロゲン化
  '75-09-2':  { A: 7.080, B: 1138.0, C: 231.5 },  // ジクロロメタン
  '67-66-3':  { A: 6.933, B: 1163.0, C: 227.4 },  // クロロホルム

  // アルコール
  '67-56-1':  { A: 8.081, B: 1582.3, C: 239.7 },  // メタノール
  '64-17-5':  { A: 8.112, B: 1592.9, C: 226.2 },  // エタノール
  '67-63-0':  { A: 8.117, B: 1580.9, C: 219.6 },  // 2-プロパノール

  // ケトン
  '67-64-1':  { A: 7.117, B: 1210.6, C: 229.7 },  // アセトン
  '78-93-3':  { A: 7.063, B: 1261.3, C: 222.0 },  // MEK

  // エステル
  '141-78-6': { A: 7.101, B: 1244.9, C: 217.9 },  // 酢酸エチル

  // エーテル
  '60-29-7':  { A: 6.920, B: 1064.1, C: 228.0 },  // ジエチルエーテル
  '109-99-9': { A: 6.995, B: 1202.3, C: 226.3 },  // THF

  // アミド系
  '68-12-2':  { A: 6.928, B: 1400.9, C: 196.0 },  // DMF
  '872-50-4': { A: 7.260, B: 1828.0, C: 202.0 },  // NMP

  // その他
  '67-68-5':  { A: 6.676, B: 1407.5, C: 186.7 },  // DMSO
  '7732-18-5':{ A: 8.071, B: 1730.6, C: 233.4 },  // 水
};

/**
 * Antoine式で蒸気圧を計算する
 * @param constants Antoine定数
 * @param temperature 温度 (°C)
 * @returns 蒸気圧 (kPa)
 */
export function antoineVaporPressure(constants: AntoineConstants, temperature: number): number {
  const { A, B, C } = constants;
  return Math.pow(10, A - B / (C + temperature));
}

/**
 * 蒸発シミュレーションを実行する
 * @param components 成分リスト（初期モル分率 + HSP）
 * @param temperature プロセス温度 (°C)
 * @param steps 時間ステップ数
 * @returns 時系列のHSP変化と組成変化
 */
export function simulateEvaporation(
  components: EvaporationComponent[],
  temperature: number,
  steps: number,
): EvaporationResult {
  if (components.length === 0) {
    return { timeSteps: [], hspTimeSeries: [], compositionTimeSeries: [], residualFractions: [] };
  }

  // 正規化
  const totalFraction = components.reduce((s, c) => s + c.moleFraction, 0);
  let moles = components.map((c) => c.moleFraction / totalFraction);

  const timeSteps: number[] = [];
  const hspTimeSeries: HSPValues[] = [];
  const compositionTimeSeries: number[][] = [];
  const residualFractions: number[] = [];

  const dt = 0.05; // 時間刻み（無次元）

  for (let step = 0; step < steps; step++) {
    const totalMoles = moles.reduce((s, m) => s + m, 0);
    if (totalMoles <= 1e-10) break;

    const xi = moles.map((m) => m / totalMoles);
    timeSteps.push(step * dt);
    compositionTimeSeries.push([...xi]);
    residualFractions.push(totalMoles);

    // 加重平均HSP
    const hsp: HSPValues = { deltaD: 0, deltaP: 0, deltaH: 0 };
    for (let i = 0; i < components.length; i++) {
      hsp.deltaD += xi[i] * components[i].hsp.deltaD;
      hsp.deltaP += xi[i] * components[i].hsp.deltaP;
      hsp.deltaH += xi[i] * components[i].hsp.deltaH;
    }
    hspTimeSeries.push(hsp);

    // Raoult則で蒸発
    const newMoles = moles.map((m, i) => {
      const cas = components[i].casNumber;
      const antoine = ANTOINE_CONSTANTS[cas];
      if (!antoine) return m; // Antoine定数がない場合は蒸発しない
      const Pi = antoineVaporPressure(antoine, temperature);
      const evapRate = xi[i] * Pi * dt * 0.001; // スケーリング
      return Math.max(0, m - evapRate);
    });
    moles = newMoles;
  }

  return { timeSteps, hspTimeSeries, compositionTimeSeries, residualFractions };
}

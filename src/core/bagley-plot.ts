/**
 * Bagleyプロット — δV-δH 2Dプロット
 * δV = √(δD² + δP²) vs δH
 * Bagley (1971)
 */
import type { HSPValues, Solvent, Part } from './types';

/** Bagley座標 */
export interface BagleyCoordinates {
  deltaV: number;
  deltaH: number;
}

/** Bagleyプロットデータ */
export interface BagleyPlotData {
  solvents: { names: string[]; deltaV: number[]; deltaH: number[] };
  parts: { names: string[]; deltaV: number[]; deltaH: number[] };
}

/**
 * HSP値からBagley座標を計算する
 * δV = √(δD² + δP²) は分散力項と極性項を統合した体積溶解度パラメータ
 */
export function calculateBagleyCoordinates(hsp: HSPValues): BagleyCoordinates {
  const deltaV = Math.sqrt(hsp.deltaD * hsp.deltaD + hsp.deltaP * hsp.deltaP);
  return {
    deltaV,
    deltaH: hsp.deltaH,
  };
}

/**
 * 溶媒・部品のBagleyプロットデータを構築する
 */
export function buildBagleyPlotData(solvents: Solvent[], parts: Part[] = []): BagleyPlotData {
  const solventNames: string[] = [];
  const solventDeltaV: number[] = [];
  const solventDeltaH: number[] = [];

  for (const s of solvents) {
    const coords = calculateBagleyCoordinates(s.hsp);
    solventNames.push(s.name);
    solventDeltaV.push(coords.deltaV);
    solventDeltaH.push(coords.deltaH);
  }

  const partNames: string[] = [];
  const partDeltaV: number[] = [];
  const partDeltaH: number[] = [];

  for (const p of parts) {
    const coords = calculateBagleyCoordinates(p.hsp);
    partNames.push(p.name);
    partDeltaV.push(coords.deltaV);
    partDeltaH.push(coords.deltaH);
  }

  return {
    solvents: { names: solventNames, deltaV: solventDeltaV, deltaH: solventDeltaH },
    parts: { names: partNames, deltaV: partDeltaV, deltaH: partDeltaH },
  };
}

/**
 * Hansen空間の2D射影（3面図）
 * δD-δP, δP-δH, δD-δH 平面への射影
 */
import type { Solvent, Part } from './types';

/** 射影平面 */
export type ProjectionPlane = 'dD-dP' | 'dP-dH' | 'dD-dH';

/** 個別射影データ */
export interface ProjectionData {
  plane: ProjectionPlane;
  xLabel: string;
  yLabel: string;
  solvents: { names: string[]; x: number[]; y: number[] };
  parts: { names: string[]; x: number[]; y: number[]; r0: number[] };
}

/** 3面図データ */
export interface Projection2DData {
  projections: [ProjectionData, ProjectionData, ProjectionData];
}

/** 射影平面の定義 */
const PLANE_DEFINITIONS: { plane: ProjectionPlane; xLabel: string; yLabel: string; xKey: 'deltaD' | 'deltaP' | 'deltaH'; yKey: 'deltaD' | 'deltaP' | 'deltaH' }[] = [
  { plane: 'dD-dP', xLabel: 'δD', yLabel: 'δP', xKey: 'deltaD', yKey: 'deltaP' },
  { plane: 'dP-dH', xLabel: 'δP', yLabel: 'δH', xKey: 'deltaP', yKey: 'deltaH' },
  { plane: 'dD-dH', xLabel: 'δD', yLabel: 'δH', xKey: 'deltaD', yKey: 'deltaH' },
];

/**
 * 溶媒・部品の3面図射影データを構築する
 * 各部品にはr0を含め、2D射影上に相互作用円を描画可能にする
 */
export function buildProjection2DData(solvents: Solvent[], parts: Part[] = []): Projection2DData {
  const projections = PLANE_DEFINITIONS.map((def) => {
    const solventNames: string[] = [];
    const solventX: number[] = [];
    const solventY: number[] = [];

    for (const s of solvents) {
      solventNames.push(s.name);
      solventX.push(s.hsp[def.xKey]);
      solventY.push(s.hsp[def.yKey]);
    }

    const partNames: string[] = [];
    const partX: number[] = [];
    const partY: number[] = [];
    const partR0: number[] = [];

    for (const p of parts) {
      partNames.push(p.name);
      partX.push(p.hsp[def.xKey]);
      partY.push(p.hsp[def.yKey]);
      partR0.push(p.r0);
    }

    return {
      plane: def.plane,
      xLabel: def.xLabel,
      yLabel: def.yLabel,
      solvents: { names: solventNames, x: solventX, y: solventY },
      parts: { names: partNames, x: partX, y: partY, r0: partR0 },
    } satisfies ProjectionData;
  }) as [ProjectionData, ProjectionData, ProjectionData];

  return { projections };
}

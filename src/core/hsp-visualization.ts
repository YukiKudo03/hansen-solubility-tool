/**
 * HSP 3D可視化用データ生成
 */
import type { Part, Solvent } from './types';

export interface ScatterData {
  x: number[];
  y: number[];
  z: number[];
  names: string[];
}

export interface SphereData {
  center: { x: number; y: number; z: number };
  r0: number;
  vertices: { x: number[]; y: number[]; z: number[] };
}

/**
 * 溶媒リストからδD-δP-δH散布点データを生成
 */
export function buildScatterData(solvents: Solvent[]): ScatterData {
  return {
    x: solvents.map((s) => s.hsp.deltaD),
    y: solvents.map((s) => s.hsp.deltaP),
    z: solvents.map((s) => s.hsp.deltaH),
    names: solvents.map((s) => s.name),
  };
}

/**
 * 部品のHSP球のワイヤーフレーム頂点を生成
 */
export function buildSphereData(part: Part): SphereData {
  const cx = part.hsp.deltaD;
  const cy = part.hsp.deltaP;
  const cz = part.hsp.deltaH;
  const r = part.r0;

  const vertices: { x: number[]; y: number[]; z: number[] } = { x: [], y: [], z: [] };

  // 経度・緯度で球面の点を生成
  const resolution = 16;
  for (let i = 0; i <= resolution; i++) {
    const phi = (Math.PI * i) / resolution;
    for (let j = 0; j <= resolution; j++) {
      const theta = (2 * Math.PI * j) / resolution;
      vertices.x.push(cx + r * Math.sin(phi) * Math.cos(theta));
      vertices.y.push(cy + r * Math.sin(phi) * Math.sin(theta));
      vertices.z.push(cz + r * Math.cos(phi));
    }
  }

  return {
    center: { x: cx, y: cy, z: cz },
    r0: r,
    vertices,
  };
}

/**
 * RED値を色に変換（緑→黄→赤のグラデーション）
 * RED < 0.5: 緑、RED = 1.0: 黄、RED > 1.5: 赤
 */
export function redToColor(red: number): string {
  if (!isFinite(red) || isNaN(red)) return 'rgb(128,128,128)';

  const t = Math.max(0, Math.min(2, red)); // 0-2にクランプ
  let r: number, g: number;
  if (t <= 1) {
    // 緑→黄
    r = Math.round(255 * t);
    g = 200;
  } else {
    // 黄→赤
    r = 255;
    g = Math.round(200 * (2 - t));
  }
  return `rgb(${r},${g},50)`;
}

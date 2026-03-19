/**
 * Teasプロット（三角図）— HSP3成分を分率座標に変換
 * fd = δD/(δD+δP+δH), fp = δP/(δD+δP+δH), fh = δH/(δD+δP+δH)
 * Jean P. Teas (1968)
 */
import type { HSPValues, Solvent, Part } from './types';

/** Teas分率座標 */
export interface TeasCoordinates {
  fd: number;
  fp: number;
  fh: number;
}

/** Teasプロットデータ */
export interface TeasPlotData {
  solvents: { names: string[]; fd: number[]; fp: number[]; fh: number[]; x: number[]; y: number[] };
  parts: { names: string[]; fd: number[]; fp: number[]; fh: number[]; x: number[]; y: number[] };
}

/**
 * HSP値からTeas分率座標を計算する
 * @throws {Error} 全成分が0の場合
 */
export function calculateTeasCoordinates(hsp: HSPValues): TeasCoordinates {
  const sum = hsp.deltaD + hsp.deltaP + hsp.deltaH;
  if (sum === 0) {
    throw new Error('HSP成分の合計が0です');
  }
  return {
    fd: hsp.deltaD / sum,
    fp: hsp.deltaP / sum,
    fh: hsp.deltaH / sum,
  };
}

/**
 * 三角座標（fd, fp, fh）を2Dデカルト座標に変換する
 * 正三角形マッピング: 底辺左=fd=1, 底辺右=fp=1, 頂点=fh=1
 */
export function toCartesian(fd: number, fp: number, fh: number): { x: number; y: number } {
  // 正三角形の頂点: fd=(0,0), fp=(1,0), fh=(0.5, √3/2)
  const x = fp + fh * 0.5;
  const y = fh * (Math.sqrt(3) / 2);
  return { x, y };
}

/**
 * 溶媒・部品のTeasプロットデータを構築する
 */
export function buildTeasPlotData(solvents: Solvent[], parts: Part[] = []): TeasPlotData {
  const solventNames: string[] = [];
  const solventFd: number[] = [];
  const solventFp: number[] = [];
  const solventFh: number[] = [];
  const solventX: number[] = [];
  const solventY: number[] = [];

  for (const s of solvents) {
    const coords = calculateTeasCoordinates(s.hsp);
    const cart = toCartesian(coords.fd, coords.fp, coords.fh);
    solventNames.push(s.name);
    solventFd.push(coords.fd);
    solventFp.push(coords.fp);
    solventFh.push(coords.fh);
    solventX.push(cart.x);
    solventY.push(cart.y);
  }

  const partNames: string[] = [];
  const partFd: number[] = [];
  const partFp: number[] = [];
  const partFh: number[] = [];
  const partX: number[] = [];
  const partY: number[] = [];

  for (const p of parts) {
    const coords = calculateTeasCoordinates(p.hsp);
    const cart = toCartesian(coords.fd, coords.fp, coords.fh);
    partNames.push(p.name);
    partFd.push(coords.fd);
    partFp.push(coords.fp);
    partFh.push(coords.fh);
    partX.push(cart.x);
    partY.push(cart.y);
  }

  return {
    solvents: { names: solventNames, fd: solventFd, fp: solventFp, fh: solventFh, x: solventX, y: solventY },
    parts: { names: partNames, fd: partFd, fp: partFp, fh: partFh, x: partX, y: partY },
  };
}

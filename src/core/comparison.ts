/**
 * 比較レポート — 複数材料 × 複数溶媒のバッチ評価
 */
import type { Part, Solvent, RiskLevel } from './types';
import { calculateRa, calculateRed } from './hsp';
import { classifyRisk } from './risk';

export interface ComparisonRow {
  partId: number;
  partName: string;
  materialType: string | null;
  solventId: number;
  solventName: string;
  ra: number;
  red: number;
  riskLevel: RiskLevel;
}

export interface ComparisonStats {
  totalRows: number;
  minRed: number;
  maxRed: number;
  avgRed: number;
}

/**
 * 材料 × 溶媒の全組み合わせでRa/REDを計算し、マトリクスを返す
 */
export function buildComparisonMatrix(parts: Part[], solvents: Solvent[]): ComparisonRow[] {
  const rows: ComparisonRow[] = [];
  for (const part of parts) {
    for (const solvent of solvents) {
      const ra = calculateRa(part.hsp, solvent.hsp);
      const red = calculateRed(part.hsp, solvent.hsp, part.r0);
      const riskLevel = classifyRisk(red);
      rows.push({
        partId: part.id,
        partName: part.name,
        materialType: part.materialType,
        solventId: solvent.id,
        solventName: solvent.name,
        ra,
        red,
        riskLevel,
      });
    }
  }
  return rows;
}

/**
 * 比較マトリクスの統計を計算
 */
export function calculateComparisonStats(rows: ComparisonRow[]): ComparisonStats {
  if (rows.length === 0) {
    return { totalRows: 0, minRed: 0, maxRed: 0, avgRed: 0 };
  }
  const reds = rows.map((r) => r.red);
  return {
    totalRows: rows.length,
    minRed: Math.min(...reds),
    maxRed: Math.max(...reds),
    avgRed: reds.reduce((a, b) => a + b, 0) / reds.length,
  };
}

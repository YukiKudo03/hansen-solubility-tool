/**
 * ナノ粒子に対する溶媒スクリーニング・フィルタリング
 */
import type {
  NanoParticle,
  Solvent,
  DispersibilityThresholds,
  SolventDispersibilityResult,
  SolventConstraints,
} from './types';
import { calculateRa, calculateRed } from './hsp';
import { classifyDispersibility, DEFAULT_DISPERSIBILITY_THRESHOLDS } from './dispersibility';

/**
 * ナノ粒子に対して全溶媒をスクリーニングし、REDでソートして返す
 */
export function screenSolvents(
  particle: NanoParticle,
  solvents: Solvent[],
  thresholds: DispersibilityThresholds = DEFAULT_DISPERSIBILITY_THRESHOLDS,
): SolventDispersibilityResult[] {
  const results = solvents.map((solvent) => {
    const ra = calculateRa(particle.hsp, solvent.hsp);
    const red = calculateRed(particle.hsp, solvent.hsp, particle.r0);
    const dispersibility = classifyDispersibility(red, thresholds);
    return { nanoParticle: particle, solvent, ra, red, dispersibility };
  });

  // REDの昇順（良好な分散順）でソート
  results.sort((a, b) => a.red - b.red);
  return results;
}

/**
 * 溶媒物性制約でフィルタリング
 */
export function filterByConstraints(
  results: SolventDispersibilityResult[],
  constraints: SolventConstraints,
): SolventDispersibilityResult[] {
  return results.filter((r) => {
    const s = r.solvent;
    if (constraints.maxBoilingPoint != null) {
      if (s.boilingPoint == null || s.boilingPoint > constraints.maxBoilingPoint) return false;
    }
    if (constraints.minBoilingPoint != null) {
      if (s.boilingPoint == null || s.boilingPoint < constraints.minBoilingPoint) return false;
    }
    if (constraints.maxViscosity != null) {
      if (s.viscosity == null || s.viscosity > constraints.maxViscosity) return false;
    }
    if (constraints.maxSurfaceTension != null) {
      if (s.surfaceTension == null || s.surfaceTension > constraints.maxSurfaceTension) return false;
    }
    return true;
  });
}

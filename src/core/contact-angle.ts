/**
 * HSPベースの接触角推定
 *
 * Nakamoto-Yamamoto式 (Langmuir 2023) を使用:
 *   γ = 0.0947·δD² + 0.0315·δP² + 0.0238·δH²
 *
 * Young式:
 *   cos(θ) = (γ_SV − γ_SL) / γ_LV
 */
import type { HSPValues, Part, Solvent, ContactAngleResult } from './types';
import { classifyWettability } from './wettability';

/** Nakamoto-Yamamoto 係数 */
const COEFF_D = 0.0947;
const COEFF_P = 0.0315;
const COEFF_H = 0.0238;

/**
 * HSP値から表面張力（対空気）を推定する (mN/m)
 *
 * γ = 0.0947·δD² + 0.0315·δP² + 0.0238·δH²
 */
export function calculateSurfaceTension(hsp: HSPValues): number {
  return (
    COEFF_D * hsp.deltaD * hsp.deltaD +
    COEFF_P * hsp.deltaP * hsp.deltaP +
    COEFF_H * hsp.deltaH * hsp.deltaH
  );
}

/**
 * 2つの物質間の界面張力を推定する (mN/m)
 *
 * γ_SL = 0.0947·(δD₁−δD₂)² + 0.0315·(δP₁−δP₂)² + 0.0238·(δH₁−δH₂)²
 */
export function calculateInterfacialTension(hsp1: HSPValues, hsp2: HSPValues): number {
  const dD = hsp1.deltaD - hsp2.deltaD;
  const dP = hsp1.deltaP - hsp2.deltaP;
  const dH = hsp1.deltaH - hsp2.deltaH;
  return COEFF_D * dD * dD + COEFF_P * dP * dP + COEFF_H * dH * dH;
}

/**
 * 固体HSPと液体HSPから接触角 θ (°) を推定する
 *
 * Young式: cos(θ) = (γ_SV − γ_SL) / γ_LV
 */
export function calculateContactAngle(solidHSP: HSPValues, liquidHSP: HSPValues): number {
  const gammaLV = calculateSurfaceTension(liquidHSP);
  const gammaSV = calculateSurfaceTension(solidHSP);
  const gammaSL = calculateInterfacialTension(solidHSP, liquidHSP);

  if (gammaLV === 0) {
    return 0;
  }

  const cosTheta = Math.max(-1, Math.min(1, (gammaSV - gammaSL) / gammaLV));
  return (Math.acos(cosTheta) * 180) / Math.PI;
}

/**
 * Part（固体）と Solvent（液体）から接触角を推定し、全結果を返す
 */
export function estimateContactAngle(part: Part, solvent: Solvent): ContactAngleResult {
  const surfaceTensionLV = calculateSurfaceTension(solvent.hsp);
  const surfaceEnergySV = calculateSurfaceTension(part.hsp);
  const interfacialTension = calculateInterfacialTension(part.hsp, solvent.hsp);

  let cosTheta: number;
  if (surfaceTensionLV === 0) {
    cosTheta = 1;
  } else {
    cosTheta = Math.max(-1, Math.min(1, (surfaceEnergySV - interfacialTension) / surfaceTensionLV));
  }

  const contactAngle = (Math.acos(cosTheta) * 180) / Math.PI;
  const wettability = classifyWettability(contactAngle);

  return {
    part,
    solvent,
    surfaceTensionLV,
    surfaceEnergySV,
    interfacialTension,
    cosTheta,
    contactAngle,
    wettability,
  };
}

/**
 * Polymer Blend Miscibility — 2つのポリマー間の相溶性をFlory-Huggins理論で評価する
 *
 * 処理フロー:
 * 1. Ra計算（HSP距離）
 * 2. chi計算（Flory-Huggins相互作用パラメータ）
 * 3. chi_c計算（臨界chi）
 * 4. assessMiscibility による相溶性判定
 */
import type { HSPValues } from './types';
import { calculateRa } from './hsp';
import {
  calculateFloryHugginsChi,
  calculateChiCritical,
  assessMiscibility,
} from './flory-huggins';

export interface PolymerBlendResult {
  polymer1: { name: string; hsp: HSPValues };
  polymer2: { name: string; hsp: HSPValues };
  ra: number;
  chi: number;
  chiCritical: number;
  miscibility: 'miscible' | 'immiscible' | 'partial';
}

/**
 * 2つのポリマーブレンドの相溶性を評価する
 *
 * @param polymer1 - ポリマー1（名前、HSP、重合度）
 * @param polymer2 - ポリマー2（名前、HSP、重合度）
 * @param referenceVolume - 繰り返し単位参照体積 [cm³/mol]
 * @param temperature - 温度 [K]（デフォルト: 298.15 = 25°C）
 * @returns ポリマーブレンド相溶性評価結果
 */
export function evaluatePolymerBlendMiscibility(
  polymer1: { name: string; hsp: HSPValues; degreeOfPolymerization: number },
  polymer2: { name: string; hsp: HSPValues; degreeOfPolymerization: number },
  referenceVolume: number,
  temperature: number = 298.15
): PolymerBlendResult {
  const ra = calculateRa(polymer1.hsp, polymer2.hsp);
  const chi = calculateFloryHugginsChi(polymer1.hsp, polymer2.hsp, referenceVolume, temperature);
  const chiCritical = calculateChiCritical(
    polymer1.degreeOfPolymerization,
    polymer2.degreeOfPolymerization
  );
  const miscibility = assessMiscibility(chi, chiCritical);

  return {
    polymer1: { name: polymer1.name, hsp: polymer1.hsp },
    polymer2: { name: polymer2.name, hsp: polymer2.hsp },
    ra,
    chi,
    chiCritical,
    miscibility,
  };
}

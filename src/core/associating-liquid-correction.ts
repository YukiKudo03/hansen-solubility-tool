/**
 * NL15: 会合性液体のdH温度補正
 *
 * 通常のBarton法（指数減衰）では水やアルコールのdH温度依存性を
 * 正しく再現できない。会合性液体では水素結合ネットワークの崩壊により
 * dHが急激に減少する。
 *
 * 会合性液体モデル:
 *   dH²(T) = dH²(Tref) * (1 - alpha * (T - Tref) / Tref)
 *   alpha: 会合パラメータ（液体ごとに異なる）
 *
 * 非会合性液体（フォールバック）:
 *   dH(T) = dH(T0) * exp(-1.22e-3 * (T - T0))
 *
 * 参考文献:
 * - Barton (1991) Handbook of Solubility Parameters
 * - Hansen (2007) Chapter 5, Temperature effects
 */

/** 会合性液体のパラメータ */
export interface AssociatingLiquidParams {
  /** 基準温度でのdH [MPa^0.5] */
  deltaH_ref: number;
  /** 基準温度 [K] */
  tRef: number;
  /** 会合パラメータ alpha (大きいほどTに敏感) */
  alpha: number;
}

/**
 * 会合性液体データベース
 *
 * alphaは文献値+水の100°Cデータ(dH≈30-34)からフィッティング
 */
export const ASSOCIATING_LIQUIDS: Record<string, AssociatingLiquidParams> = {
  water: {
    deltaH_ref: 42.3,
    tRef: 298.15,
    alpha: 1.8, // 水の水素結合ネットワーク崩壊の急峻さ
  },
  methanol: {
    deltaH_ref: 22.3,
    tRef: 298.15,
    alpha: 1.2,
  },
  ethanol: {
    deltaH_ref: 19.4,
    tRef: 298.15,
    alpha: 1.0,
  },
  ethylene_glycol: {
    deltaH_ref: 26.0,
    tRef: 298.15,
    alpha: 1.1,
  },
  acetic_acid: {
    deltaH_ref: 13.5,
    tRef: 298.15,
    alpha: 0.9,
  },
  formamide: {
    deltaH_ref: 19.0,
    tRef: 298.15,
    alpha: 1.0,
  },
};

/**
 * 指定された溶媒が会合性液体かどうか判定する
 */
export function isAssociatingLiquid(solventName: string): boolean {
  return solventName.toLowerCase() in ASSOCIATING_LIQUIDS;
}

/**
 * 会合性液体のdHを温度補正する
 *
 * 会合性液体: dH²(T) = dH²(Tref) * (1 - alpha*(T-Tref)/Tref)
 * 非会合性:   dH(T) = dH(T0) * exp(-1.22e-3 * (T-T0))
 *
 * @param deltaH_ref - 基準温度でのdH [MPa^0.5]
 * @param temperature - 目標温度 [K]
 * @param tRef - 基準温度 [K] (デフォルト: 298.15)
 * @param solventName - 溶媒名（会合性液体DBにあれば専用モデル使用）
 * @returns 温度補正後のdH [MPa^0.5]
 */
export function correctDeltaHAssociating(
  deltaH_ref: number,
  temperature: number,
  tRef: number = 298.15,
  solventName?: string
): number {
  if (temperature <= 0) throw new Error('Temperature must be positive');
  if (deltaH_ref < 0) throw new Error('deltaH must be non-negative');

  // 基準温度と同じなら元の値
  if (Math.abs(temperature - tRef) < 0.01) return deltaH_ref;

  // 会合性液体の場合: 専用モデル
  const key = solventName?.toLowerCase();
  if (key && key in ASSOCIATING_LIQUIDS) {
    const params = ASSOCIATING_LIQUIDS[key];
    const dT = temperature - tRef;
    const ratio = 1 - params.alpha * dT / tRef;

    // ratio ≤ 0 は極端な高温（モデル外）
    if (ratio <= 0) return 0;

    // dH²(T) = dH²(ref) * ratio → dH(T) = dH(ref) * sqrt(ratio)
    return deltaH_ref * Math.sqrt(ratio);
  }

  // 非会合性液体: 標準Barton指数減衰
  const dT = temperature - tRef;
  return deltaH_ref * Math.exp(-1.22e-3 * dT);
}

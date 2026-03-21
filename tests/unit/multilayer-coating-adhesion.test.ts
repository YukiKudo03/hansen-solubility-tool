/**
 * 多層コーティング界面密着性評価のテスト
 *
 * 文献参考:
 * - Owens-Wendt model for interfacial adhesion
 * - Automotive coating systems (primer/basecoat/clearcoat)
 */
import { describe, it, expect } from 'vitest';

import {
  evaluateMultilayerAdhesion,
  type CoatingLayer,
} from '../../src/core/multilayer-coating-adhesion';

// 自動車塗装3層モデル
const PRIMER: CoatingLayer = {
  name: 'Primer',
  hsp: { deltaD: 18, deltaP: 8, deltaH: 6 },
};
const BASECOAT: CoatingLayer = {
  name: 'Basecoat',
  hsp: { deltaD: 19, deltaP: 5, deltaH: 4 },
};
const CLEARCOAT: CoatingLayer = {
  name: 'Clearcoat',
  hsp: { deltaD: 17, deltaP: 3, deltaH: 8 },
};

describe('evaluateMultilayerAdhesion', () => {
  it('3層コーティング → 2界面を評価', () => {
    const result = evaluateMultilayerAdhesion([PRIMER, BASECOAT, CLEARCOAT]);

    expect(result.interfaceResults).toHaveLength(2);
    expect(result.interfaceResults[0].layer1Name).toBe('Primer');
    expect(result.interfaceResults[0].layer2Name).toBe('Basecoat');
    expect(result.interfaceResults[1].layer1Name).toBe('Basecoat');
    expect(result.interfaceResults[1].layer2Name).toBe('Clearcoat');
  });

  it('Primer-Basecoat界面のWa > Basecoat-Clearcoat界面のWa', () => {
    // Primer(18,8,6) - Basecoat(19,5,4): Wa≈68.4 (closer HSP)
    // Basecoat(19,5,4) - Clearcoat(17,3,8): Wa≈63.6 (more different)
    const result = evaluateMultilayerAdhesion([PRIMER, BASECOAT, CLEARCOAT]);

    const waPrimerBasecoat = result.interfaceResults[0].wa;
    const waBasecoatClearcoat = result.interfaceResults[1].wa;

    expect(waPrimerBasecoat).toBeGreaterThan(waBasecoatClearcoat);
  });

  it('最弱界面がBasecoat-Clearcoat界面として特定される', () => {
    const result = evaluateMultilayerAdhesion([PRIMER, BASECOAT, CLEARCOAT]);

    expect(result.weakestInterface.layer1Name).toBe('Basecoat');
    expect(result.weakestInterface.layer2Name).toBe('Clearcoat');
    expect(result.weakestInterface.wa).toBeLessThan(result.interfaceResults[0].wa);
  });

  it('2層のみでも正常動作', () => {
    const result = evaluateMultilayerAdhesion([PRIMER, BASECOAT]);

    expect(result.interfaceResults).toHaveLength(1);
    expect(result.weakestInterface.layer1Name).toBe('Primer');
    expect(result.weakestInterface.layer2Name).toBe('Basecoat');
  });

  it('4層システム → 3界面を評価', () => {
    const sealant: CoatingLayer = {
      name: 'Sealant',
      hsp: { deltaD: 16, deltaP: 4, deltaH: 10 },
    };
    const result = evaluateMultilayerAdhesion([PRIMER, BASECOAT, CLEARCOAT, sealant]);

    expect(result.interfaceResults).toHaveLength(3);
    // 最弱界面は必ず存在する
    expect(result.weakestInterface).toBeDefined();
    expect(result.weakestInterface.wa).toBeLessThanOrEqual(
      Math.min(...result.interfaceResults.map(r => r.wa)),
    );
  });

  it('1層以下でエラーを投げる', () => {
    expect(() => evaluateMultilayerAdhesion([])).toThrow('2層以上が必要');
    expect(() => evaluateMultilayerAdhesion([PRIMER])).toThrow('2層以上が必要');
  });

  it('同一材料の隣接層ではWaが最大になる', () => {
    const layer: CoatingLayer = {
      name: 'Same',
      hsp: { deltaD: 18, deltaP: 8, deltaH: 6 },
    };
    const result = evaluateMultilayerAdhesion([layer, layer, CLEARCOAT]);

    // 同一材料ペアのWaが異種材料ペアより大きい
    expect(result.interfaceResults[0].wa).toBeGreaterThan(result.interfaceResults[1].wa);
  });

  it('各界面結果にRa値が含まれる', () => {
    const result = evaluateMultilayerAdhesion([PRIMER, BASECOAT, CLEARCOAT]);

    for (const iface of result.interfaceResults) {
      expect(typeof iface.ra).toBe('number');
      expect(iface.ra).toBeGreaterThanOrEqual(0);
    }
  });
});

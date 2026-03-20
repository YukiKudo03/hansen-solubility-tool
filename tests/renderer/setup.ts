/**
 * Renderer テスト用セットアップ
 * window.api の型安全なモックを提供
 */
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import type { ElectronAPI } from '../../src/preload.d';

/** window.api の全メソッドをvi.fn()でモックする */
export function createMockApi(): { [K in keyof ElectronAPI]: ReturnType<typeof vi.fn> } {
  return {
    // 部品グループ
    getAllGroups: vi.fn().mockResolvedValue([]),
    getGroupById: vi.fn().mockResolvedValue(null),
    createGroup: vi.fn().mockResolvedValue({ id: 1, name: '', description: null, parts: [] }),
    updateGroup: vi.fn().mockResolvedValue(null),
    deleteGroup: vi.fn().mockResolvedValue(true),

    // 部品
    createPart: vi.fn().mockResolvedValue({ id: 1, groupId: 1, name: '', materialType: null, hsp: { deltaD: 0, deltaP: 0, deltaH: 0 }, r0: 1, notes: null }),
    updatePart: vi.fn().mockResolvedValue(null),
    deletePart: vi.fn().mockResolvedValue(true),

    // 溶媒
    getAllSolvents: vi.fn().mockResolvedValue([]),
    getSolventById: vi.fn().mockResolvedValue(null),
    searchSolvents: vi.fn().mockResolvedValue([]),
    createSolvent: vi.fn().mockResolvedValue({ id: 1, name: '', nameEn: null, casNumber: null, hsp: { deltaD: 0, deltaP: 0, deltaH: 0 }, molarVolume: null, molWeight: null, notes: null }),
    updateSolvent: vi.fn().mockResolvedValue(null),
    deleteSolvent: vi.fn().mockResolvedValue(true),
    createMixtureSolvent: vi.fn().mockResolvedValue({ id: 99, name: '混合溶媒', nameEn: null, casNumber: null, hsp: { deltaD: 17, deltaP: 5, deltaH: 10 }, molarVolume: null, molWeight: null, boilingPoint: null, viscosity: null, specificGravity: null, surfaceTension: null, notes: '混合溶媒' }),

    // 評価
    evaluate: vi.fn().mockResolvedValue(null),

    // 設定
    getThresholds: vi.fn().mockResolvedValue({ dangerousMax: 0.5, warningMax: 0.8, cautionMax: 1.2, holdMax: 2.0 }),
    setThresholds: vi.fn().mockResolvedValue(undefined),

    // CSV
    saveCsv: vi.fn().mockResolvedValue({ saved: false }),

    // ナノ粒子
    getAllNanoParticles: vi.fn().mockResolvedValue([]),
    getNanoParticleById: vi.fn().mockResolvedValue(null),
    getNanoParticlesByCategory: vi.fn().mockResolvedValue([]),
    searchNanoParticles: vi.fn().mockResolvedValue([]),
    createNanoParticle: vi.fn().mockResolvedValue({ id: 1, name: '', nameEn: null, category: 'other', coreMaterial: '', surfaceLigand: null, hsp: { deltaD: 0, deltaP: 0, deltaH: 0 }, r0: 1, particleSize: null, notes: null }),
    updateNanoParticle: vi.fn().mockResolvedValue(null),
    deleteNanoParticle: vi.fn().mockResolvedValue(true),

    // ナノ粒子分散評価
    evaluateNanoDispersion: vi.fn().mockResolvedValue(null),
    screenAllSolvents: vi.fn().mockResolvedValue(null),
    screenFilteredSolvents: vi.fn().mockResolvedValue(null),

    // 分散性閾値
    getDispersibilityThresholds: vi.fn().mockResolvedValue({ excellentMax: 0.5, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5 }),
    setDispersibilityThresholds: vi.fn().mockResolvedValue(undefined),

    // 接触角推定
    estimateContactAngle: vi.fn().mockResolvedValue(null),
    screenContactAngle: vi.fn().mockResolvedValue(null),

    // 濡れ性閾値
    getWettabilityThresholds: vi.fn().mockResolvedValue({ superHydrophilicMax: 10, hydrophilicMax: 30, wettableMax: 60, moderateMax: 90, hydrophobicMax: 150 }),
    setWettabilityThresholds: vi.fn().mockResolvedValue(undefined),

    // 膨潤度予測
    evaluateSwelling: vi.fn().mockResolvedValue(null),
    getSwellingThresholds: vi.fn().mockResolvedValue({ severeMax: 0.5, highMax: 1.0, moderateMax: 2.0, lowMax: 5.0 }),
    setSwellingThresholds: vi.fn().mockResolvedValue(undefined),

    // 薬物
    getAllDrugs: vi.fn().mockResolvedValue([]),
    getDrugById: vi.fn().mockResolvedValue(null),
    getDrugsByCategory: vi.fn().mockResolvedValue([]),
    searchDrugs: vi.fn().mockResolvedValue([]),
    createDrug: vi.fn().mockResolvedValue({ id: 1, name: '', nameEn: null, casNumber: null, category: 'other', hsp: { deltaD: 0, deltaP: 0, deltaH: 0 }, r0: 1, molarVolume: null, notes: null }),
    updateDrug: vi.fn().mockResolvedValue(null),
    deleteDrug: vi.fn().mockResolvedValue(true),

    // 薬物溶解性評価
    evaluateDrugSolubility: vi.fn().mockResolvedValue(null),
    screenDrugSolvents: vi.fn().mockResolvedValue(null),
    getDrugSolubilityThresholds: vi.fn().mockResolvedValue({ excellentMax: 0.5, goodMax: 1.0, fairMax: 2.0, poorMax: 4.0 }),
    setDrugSolubilityThresholds: vi.fn().mockResolvedValue(undefined),

    // ブレンド最適化
    optimizeBlend: vi.fn().mockResolvedValue(null),

    // 耐薬品性評価
    evaluateChemicalResistance: vi.fn().mockResolvedValue(null),
    getChemicalResistanceThresholds: vi.fn().mockResolvedValue({ excellentMax: 0.5, goodMax: 1.0, fairMax: 2.0, poorMax: 4.0 }),
    setChemicalResistanceThresholds: vi.fn().mockResolvedValue(undefined),

    // 可塑剤選定
    getPlasticizers: vi.fn().mockResolvedValue([]),
    screenPlasticizers: vi.fn().mockResolvedValue(null),
    getPlasticizerThresholds: vi.fn().mockResolvedValue({ excellentMax: 0.5, goodMax: 1.0, fairMax: 2.0, poorMax: 4.0 }),
    setPlasticizerThresholds: vi.fn().mockResolvedValue(undefined),

    // キャリア選定（DDS）
    evaluateCarrier: vi.fn().mockResolvedValue(null),
    screenCarriers: vi.fn().mockResolvedValue(null),
    getCarrierThresholds: vi.fn().mockResolvedValue({ excellentMax: 0.5, goodMax: 1.0, fairMax: 2.0, poorMax: 4.0 }),
    setCarrierThresholds: vi.fn().mockResolvedValue(undefined),

    // CSVインポート
    importOpenFile: vi.fn().mockResolvedValue(null),
    importParseSolventCsv: vi.fn().mockResolvedValue({ rows: [], errors: [] }),
    importParsePartCsv: vi.fn().mockResolvedValue({ rows: [], errors: [] }),

    // ブックマーク
    getAllBookmarks: vi.fn().mockResolvedValue([]),
    createBookmark: vi.fn().mockResolvedValue({ id: 1 }),
    deleteBookmark: vi.fn().mockResolvedValue(true),

    // 評価履歴
    getAllHistory: vi.fn().mockResolvedValue([]),
    getHistoryByPipeline: vi.fn().mockResolvedValue([]),
    saveHistory: vi.fn().mockResolvedValue({ id: 1 }),
    deleteHistory: vi.fn().mockResolvedValue(true),
    deleteHistoryOlderThan: vi.fn().mockResolvedValue(0),

    // 接着性評価
    evaluateAdhesion: vi.fn().mockResolvedValue(null),
    getAdhesionThresholds: vi.fn().mockResolvedValue({ excellentMax: 2.0, goodMax: 4.0, fairMax: 6.0, poorMax: 8.0 }),
    setAdhesionThresholds: vi.fn().mockResolvedValue(undefined),

    // HSP球フィッティング
    fitSphere: vi.fn().mockResolvedValue(null),

    // グリーン溶媒
    findGreenAlternatives: vi.fn().mockResolvedValue(null),

    // 多目的溶媒選定
    screenMultiObjective: vi.fn().mockResolvedValue(null),

    // 族寄与法
    estimateGroupContribution: vi.fn().mockResolvedValue(null),
    getGroupContributionGroups: vi.fn().mockResolvedValue({ firstOrder: [], secondOrder: [] }),

    // 可視化
    getTeasPlotData: vi.fn().mockResolvedValue(null),
    getBagleyPlotData: vi.fn().mockResolvedValue(null),
    getProjection2DData: vi.fn().mockResolvedValue(null),

    // 分散剤
    getAllDispersants: vi.fn().mockResolvedValue([]),
    getDispersantById: vi.fn().mockResolvedValue(null),
    getDispersantsByType: vi.fn().mockResolvedValue([]),
    searchDispersants: vi.fn().mockResolvedValue([]),
    createDispersant: vi.fn().mockResolvedValue({ id: 1, name: '', nameEn: null, dispersantType: 'other', anchorHSP: { deltaD: 0, deltaP: 0, deltaH: 0 }, anchorR0: 1, solvationHSP: { deltaD: 0, deltaP: 0, deltaH: 0 }, solvationR0: 1, overallHSP: { deltaD: 0, deltaP: 0, deltaH: 0 }, hlb: null, molWeight: null, tradeName: null, manufacturer: null, notes: null }),
    updateDispersant: vi.fn().mockResolvedValue(null),
    deleteDispersant: vi.fn().mockResolvedValue(true),

    // 分散剤選定
    screenDispersants: vi.fn().mockResolvedValue(null),
    screenSolventsForDispersant: vi.fn().mockResolvedValue(null),
    screenDispersantsFallback: vi.fn().mockResolvedValue(null),
    getDispersantThresholds: vi.fn().mockResolvedValue({ excellentMax: 0.5, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5 }),
    setDispersantThresholds: vi.fn().mockResolvedValue(undefined),

    // 汎用 IPC invoke
    invoke: vi.fn().mockResolvedValue(null),
  };
}

/** テスト用にwindow.apiをセットアップ */
export function setupMockApi() {
  const mockApi = createMockApi();
  Object.defineProperty(window, 'api', {
    value: mockApi,
    writable: true,
    configurable: true,
  });
  return mockApi;
}

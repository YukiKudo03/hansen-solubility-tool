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

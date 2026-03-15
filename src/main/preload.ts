/**
 * Preloadスクリプト — contextBridgeでRendererにAPIを公開
 */
import { contextBridge, ipcRenderer } from 'electron';

export const api = {
  // 部品グループ
  getAllGroups: () => ipcRenderer.invoke('parts:getAllGroups'),
  getGroupById: (id: number) => ipcRenderer.invoke('parts:getGroupById', id),
  createGroup: (dto: { name: string; description?: string }) =>
    ipcRenderer.invoke('parts:createGroup', dto),
  updateGroup: (id: number, dto: { name?: string; description?: string }) =>
    ipcRenderer.invoke('parts:updateGroup', id, dto),
  deleteGroup: (id: number) => ipcRenderer.invoke('parts:deleteGroup', id),

  // 部品
  createPart: (dto: {
    groupId: number;
    name: string;
    materialType?: string;
    deltaD: number;
    deltaP: number;
    deltaH: number;
    r0: number;
    notes?: string;
  }) => ipcRenderer.invoke('parts:createPart', dto),
  updatePart: (id: number, dto: Record<string, unknown>) =>
    ipcRenderer.invoke('parts:updatePart', id, dto),
  deletePart: (id: number) => ipcRenderer.invoke('parts:deletePart', id),

  // 溶媒
  getAllSolvents: () => ipcRenderer.invoke('solvents:getAll'),
  getSolventById: (id: number) => ipcRenderer.invoke('solvents:getById', id),
  searchSolvents: (query: string) => ipcRenderer.invoke('solvents:search', query),
  createSolvent: (dto: Record<string, unknown>) =>
    ipcRenderer.invoke('solvents:create', dto),
  updateSolvent: (id: number, dto: Record<string, unknown>) =>
    ipcRenderer.invoke('solvents:update', id, dto),
  deleteSolvent: (id: number) => ipcRenderer.invoke('solvents:delete', id),
  createMixtureSolvent: (dto: { components: { solventId: number; volumeRatio: number }[]; name: string }) =>
    ipcRenderer.invoke('solvents:createMixture', dto),

  // 評価
  evaluate: (partsGroupId: number, solventId: number) =>
    ipcRenderer.invoke('evaluate', partsGroupId, solventId),

  // 設定
  getThresholds: () => ipcRenderer.invoke('settings:getThresholds'),
  setThresholds: (thresholds: {
    dangerousMax: number;
    warningMax: number;
    cautionMax: number;
    holdMax: number;
  }) => ipcRenderer.invoke('settings:setThresholds', thresholds),

  // CSV保存
  saveCsv: (csvContent: string) => ipcRenderer.invoke('csv:save', csvContent),

  // ナノ粒子
  getAllNanoParticles: () => ipcRenderer.invoke('nanoParticles:getAll'),
  getNanoParticleById: (id: number) => ipcRenderer.invoke('nanoParticles:getById', id),
  getNanoParticlesByCategory: (category: string) => ipcRenderer.invoke('nanoParticles:getByCategory', category),
  searchNanoParticles: (query: string) => ipcRenderer.invoke('nanoParticles:search', query),
  createNanoParticle: (dto: Record<string, unknown>) =>
    ipcRenderer.invoke('nanoParticles:create', dto),
  updateNanoParticle: (id: number, dto: Record<string, unknown>) =>
    ipcRenderer.invoke('nanoParticles:update', id, dto),
  deleteNanoParticle: (id: number) => ipcRenderer.invoke('nanoParticles:delete', id),

  // ナノ粒子分散評価
  evaluateNanoDispersion: (particleId: number, solventId: number) =>
    ipcRenderer.invoke('nanoDispersion:evaluate', particleId, solventId),
  screenAllSolvents: (particleId: number) =>
    ipcRenderer.invoke('nanoDispersion:screenAll', particleId),
  screenFilteredSolvents: (particleId: number, constraints: Record<string, unknown>) =>
    ipcRenderer.invoke('nanoDispersion:screenFiltered', particleId, constraints),

  // 分散性閾値設定
  getDispersibilityThresholds: () => ipcRenderer.invoke('settings:getDispersibilityThresholds'),
  setDispersibilityThresholds: (thresholds: {
    excellentMax: number;
    goodMax: number;
    fairMax: number;
    poorMax: number;
  }) => ipcRenderer.invoke('settings:setDispersibilityThresholds', thresholds),
};

contextBridge.exposeInMainWorld('api', api);

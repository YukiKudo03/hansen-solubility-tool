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
};

contextBridge.exposeInMainWorld('api', api);

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

  // 接触角推定
  estimateContactAngle: (partsGroupId: number, solventId: number) =>
    ipcRenderer.invoke('contactAngle:evaluate', partsGroupId, solventId),
  screenContactAngle: (partId: number, groupId: number) =>
    ipcRenderer.invoke('contactAngle:screenSolvents', partId, groupId),

  // 濡れ性閾値設定
  getWettabilityThresholds: () => ipcRenderer.invoke('settings:getWettabilityThresholds'),
  setWettabilityThresholds: (thresholds: {
    superHydrophilicMax: number;
    hydrophilicMax: number;
    wettableMax: number;
    moderateMax: number;
    hydrophobicMax: number;
  }) => ipcRenderer.invoke('settings:setWettabilityThresholds', thresholds),

  // 膨潤度予測
  evaluateSwelling: (partsGroupId: number, solventId: number) =>
    ipcRenderer.invoke('swelling:evaluate', partsGroupId, solventId),

  // 膨潤度閾値設定
  getSwellingThresholds: () => ipcRenderer.invoke('settings:getSwellingThresholds'),
  setSwellingThresholds: (thresholds: {
    severeMax: number; highMax: number; moderateMax: number; lowMax: number;
  }) => ipcRenderer.invoke('settings:setSwellingThresholds', thresholds),

  // 薬物
  getAllDrugs: () => ipcRenderer.invoke('drugs:getAll'),
  getDrugById: (id: number) => ipcRenderer.invoke('drugs:getById', id),
  getDrugsByCategory: (category: string) => ipcRenderer.invoke('drugs:getByCategory', category),
  searchDrugs: (query: string) => ipcRenderer.invoke('drugs:search', query),
  createDrug: (dto: Record<string, unknown>) =>
    ipcRenderer.invoke('drugs:create', dto),
  updateDrug: (id: number, dto: Record<string, unknown>) =>
    ipcRenderer.invoke('drugs:update', id, dto),
  deleteDrug: (id: number) => ipcRenderer.invoke('drugs:delete', id),

  // 薬物溶解性評価
  evaluateDrugSolubility: (drugId: number, solventId: number) =>
    ipcRenderer.invoke('drugSolubility:evaluate', drugId, solventId),
  screenDrugSolvents: (drugId: number) =>
    ipcRenderer.invoke('drugSolubility:screenAll', drugId),

  // 薬物溶解性閾値設定
  getDrugSolubilityThresholds: () => ipcRenderer.invoke('settings:getDrugSolubilityThresholds'),
  setDrugSolubilityThresholds: (thresholds: {
    excellentMax: number; goodMax: number; partialMax: number; poorMax: number;
  }) => ipcRenderer.invoke('settings:setDrugSolubilityThresholds', thresholds),

  // ブレンド最適化
  optimizeBlend: (params: {
    targetDeltaD: number; targetDeltaP: number; targetDeltaH: number;
    candidateSolventIds: number[]; maxComponents: 2 | 3; stepSize: number; topN: number;
  }) => ipcRenderer.invoke('blend:optimize', params),

  // 耐薬品性評価
  evaluateChemicalResistance: (partsGroupId: number, solventId: number) =>
    ipcRenderer.invoke('chemicalResistance:evaluate', partsGroupId, solventId),

  // 耐薬品性閾値設定
  getChemicalResistanceThresholds: () => ipcRenderer.invoke('settings:getChemicalResistanceThresholds'),
  setChemicalResistanceThresholds: (thresholds: {
    noResistanceMax: number; poorMax: number; moderateMax: number; goodMax: number;
  }) => ipcRenderer.invoke('settings:setChemicalResistanceThresholds', thresholds),

  // 可塑剤選定
  getPlasticizers: () => ipcRenderer.invoke('solvents:getPlasticizers'),
  screenPlasticizers: (partId: number, groupId: number) =>
    ipcRenderer.invoke('plasticizer:screen', partId, groupId),

  // 可塑剤閾値設定
  getPlasticizerThresholds: () => ipcRenderer.invoke('settings:getPlasticizerThresholds'),
  setPlasticizerThresholds: (thresholds: {
    excellentMax: number; goodMax: number; fairMax: number; poorMax: number;
  }) => ipcRenderer.invoke('settings:setPlasticizerThresholds', thresholds),

  // キャリア選定（DDS）
  evaluateCarrier: (drugId: number, carrierId: number, carrierGroupId: number) =>
    ipcRenderer.invoke('carrier:evaluate', drugId, carrierId, carrierGroupId),
  screenCarriers: (drugId: number, carrierGroupId: number) =>
    ipcRenderer.invoke('carrier:screenAll', drugId, carrierGroupId),

  // キャリア閾値設定
  getCarrierThresholds: () => ipcRenderer.invoke('settings:getCarrierThresholds'),
  setCarrierThresholds: (thresholds: {
    excellentMax: number; goodMax: number; fairMax: number; poorMax: number;
  }) => ipcRenderer.invoke('settings:setCarrierThresholds', thresholds),
};

contextBridge.exposeInMainWorld('api', api);
